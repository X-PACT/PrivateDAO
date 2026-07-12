const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const rootDir = path.resolve(__dirname, '..');
const desktopPath = path.join(process.env.HOME || process.env.USERPROFILE || rootDir, 'Desktop', 'PrivateDAO-promo-codes.txt');
const repoPath = path.join(rootDir, 'data', 'promo-codes.txt');
const totalCodes = Number(process.argv.find((arg) => arg.startsWith('--count='))?.split('=')[1] || 200);
const oneDayCount = Number(process.argv.find((arg) => arg.startsWith('--one-day='))?.split('=')[1] || Math.floor(totalCodes / 2));
const threeDayCount = Number(process.argv.find((arg) => arg.startsWith('--three-day='))?.split('=')[1] || (totalCodes - oneDayCount));

function generateCode(prefix) {
  return `${prefix}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

function buildCodes() {
  const rows = [];
  for (let i = 0; i < Math.max(0, oneDayCount); i += 1) {
    rows.push(`${generateCode('PDAO1')}:1:0`);
  }
  for (let i = 0; i < threeDayCount; i += 1) {
    rows.push(`${generateCode('PDAO3')}:3:0`);
  }
  return rows;
}

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
}

const content = buildCodes().join('\n') + '\n';
writeFile(repoPath, content);
writeFile(desktopPath, content);

console.log(JSON.stringify({
  ok: true,
  repoPath,
  desktopPath,
  totalCodes,
  oneDayCount,
  threeDayCount,
}, null, 2));
