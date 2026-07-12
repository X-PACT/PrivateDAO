const path = require('path');
const { spawnSync } = require('child_process');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');

const rootDir = path.resolve(__dirname, '..');
const sqlFile = path.join(rootDir, 'db', 'wallet-binding-migration.sql');
dotenv.config({ path: path.join(rootDir, '.env') });

async function verifyAppliedWithServiceKey() {
  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) return false;
  const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
  const walletCheck = await supabase
    .from('bot_wallets')
    .select('telegram_id,public_key,encrypted_private_key,wallet_uuid,wallet_fingerprint,status,updated_at')
    .limit(1);
  if (walletCheck.error) return false;
  const archiveCheck = await supabase
    .from('archived_bot_wallets')
    .select('id,telegram_id,public_key,encrypted_private_key,wallet_uuid,wallet_fingerprint,archived_at,archive_reason')
    .limit(1);
  return !archiveCheck.error;
}

function runDockerPsql(label, args, extraEnv = {}) {
  console.log(`Applying wallet binding migration via ${label}...`);
  const result = spawnSync(
    'ccp',
    [
      'docker',
      'run',
      '--rm',
      '-i',
      '-v',
      `${rootDir}:/work:ro`,
      ...Object.entries(extraEnv).flatMap(([key, value]) => ['-e', `${key}=${value}`]),
      'postgres:16-alpine',
      'psql',
      ...args,
      '-v',
      'ON_ERROR_STOP=1',
      '-f',
      '/work/db/wallet-binding-migration.sql',
    ],
    { stdio: 'inherit' }
  );
  return result.status || 0;
}

async function main() {
  if (!process.env.SUPABASE_POOLER_CONNECTION_STRING && !process.env.SUPABASE_DB_PASSWORD) {
    if (await verifyAppliedWithServiceKey()) {
      console.log('wallet binding migration already applied; verified via Supabase service key');
      return;
    }
    console.error('wallet binding migration was not applied: missing SUPABASE_POOLER_CONNECTION_STRING or SUPABASE_DB_PASSWORD');
    console.error(`SQL file: ${sqlFile}`);
    process.exit(2);
  }

const dockerCheck = spawnSync('docker', ['--version'], { stdio: 'ignore' });
if (dockerCheck.status !== 0) {
  console.error('docker is required here because psql is not installed on this host');
  process.exit(1);
}

const match = String(process.env.SUPABASE_URL || '').match(/^https?:\/\/([^.]+)\.supabase\.co/);
if (!match) {
  console.error('could not derive Supabase project ref from SUPABASE_URL');
  process.exit(1);
}

const projectRef = match[1];
const attempts = [];

if (process.env.SUPABASE_DB_PASSWORD) {
  attempts.push({
    label: 'direct Supabase Postgres',
    args: [`host=db.${projectRef}.supabase.co port=5432 dbname=postgres user=postgres sslmode=require`],
    env: { PGPASSWORD: process.env.SUPABASE_DB_PASSWORD },
  });
  attempts.push({
    label: 'Supabase transaction pooler',
    args: [`host=aws-1-us-east-1.pooler.supabase.com port=6543 dbname=postgres user=postgres.${projectRef} sslmode=require`],
    env: { PGPASSWORD: process.env.SUPABASE_DB_PASSWORD },
  });
}

if (process.env.SUPABASE_POOLER_CONNECTION_STRING) {
  attempts.push({
    label: 'SUPABASE_POOLER_CONNECTION_STRING',
    args: [process.env.SUPABASE_POOLER_CONNECTION_STRING],
    env: {},
  });
}

let lastStatus = 1;
for (const attempt of attempts) {
  lastStatus = runDockerPsql(attempt.label, attempt.args, attempt.env);
  if (lastStatus === 0) {
    console.log(`wallet binding migration applied via ${attempt.label}`);
    process.exit(0);
  }
}

  console.error(`wallet binding migration failed after ${attempts.length} connection attempt(s). SQL file: ${sqlFile}`);
  process.exit(lastStatus || 1);
}

main().catch((err) => {
  console.error(`wallet binding migration check failed: ${err.message}`);
  process.exit(1);
});
