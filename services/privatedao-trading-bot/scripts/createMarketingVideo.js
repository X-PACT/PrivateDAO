const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const LOGO = path.join(ROOT, 'artifacts', 'marketing', 'pdao-logo.png');
const OUT_DIR = path.join(ROOT, 'artifacts', 'marketing');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_REGULAR = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
const WITH_AUDIO = process.env.MARKETING_VIDEO_WITH_AUDIO === 'true';
const VIDEO_WIDTH = 1280;
const VIDEO_HEIGHT = 720;
const DESKTOP_DIR = '/home/x-pact/Desktop/PrivateDAO-Bot-Demo';

const scenes = [
  {
    title: 'PrivateDAO Automation Trading',
    subtitle: 'Hollywood-style bot demo for Solana traders',
    voice: 'PrivateDAO Automation Trading turns serious Solana execution into a cinematic Telegram flow for fast traders and serious operators.',
    chips: ['Telegram', 'Wallet', 'Execution'],
    duration: 6,
  },
  {
    title: 'Pre-Migration Token Trading',
    subtitle: 'Pump dot fun tokens before they fully migrate',
    voice: 'The bot can discover and trade live Solana tokens, including early pump dot fun flow before the usual pool migration story is over.',
    chips: ['Pump', 'Discovery', 'Any Token'],
    duration: 6,
  },
  {
    title: 'Live Buy. DCA. Grid.',
    subtitle: 'One bot. Multiple execution styles.',
    voice: 'Fast buy, dollar cost averaging, and grid trading all run through the same protected execution core instead of separate fragile tools.',
    chips: ['Buy', 'DCA', 'Grid'],
    duration: 6,
  },
  {
    title: 'Smart Shield',
    subtitle: 'Liquidity, slippage, and price impact checks',
    voice: 'Smart Shield checks slippage, price impact, and route conditions before the order goes out, so the risk is visible before funds move.',
    chips: ['Shield', 'Slippage', 'Impact'],
    duration: 6,
  },
  {
    title: 'MEV Protection',
    subtitle: 'Helius, Jito, and protected routing paths',
    voice: 'Helius routes, Jito infrastructure, and protected submission paths help reduce the ugly parts of public mempool execution.',
    chips: ['Helius', 'Jito', 'Protected'],
    duration: 6,
  },
  {
    title: 'Private Execution',
    subtitle: 'Split larger orders without exposing strategy',
    voice: 'Private execution splits larger orders into controlled parts, reducing footprint while keeping the trader inside one simple conversation flow.',
    chips: ['Private Buy', 'Split', 'Stealth'],
    duration: 6,
  },
  {
    title: 'Verified Receipts',
    subtitle: 'Proof, hashes, anchors, and explorer links',
    voice: 'Every serious execution path can end with a verified receipt, cryptographic hashes, and explorer proof instead of a vague success message.',
    chips: ['ZK', 'Receipt', 'Anchor'],
    duration: 7,
  },
  {
    title: 'Built for Whales and Teams',
    subtitle: 'Buttons for newcomers. Infrastructure for heavy operators.',
    voice: 'PrivateDAO gives simple buttons to newer traders, but the stack underneath is built for bigger flow, better proofs, and long term serious use.',
    chips: ['Whales', 'Teams', 'Scale'],
    duration: 6,
  },
  {
    title: 'Launch the Bot',
    subtitle: 'Trade PDAO and beyond from one command surface',
    voice: 'Launch the bot, fund the wallet, and move from discovery to execution in one controlled product surface built around PrivateDAO.',
    chips: ['PDAO', 'Bot', 'Launch'],
    duration: 6,
  },
];

function run(command, args) {
  const result = childProcess.spawnSync(command, args, {
    cwd: ROOT,
    encoding: 'utf8',
    maxBuffer: 20 * 1024 * 1024,
  });
  if (result.status !== 0) {
    throw new Error(`${command} failed: ${(result.stderr || result.stdout || '').slice(0, 4000)}`);
  }
}

function escapeDrawtext(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,');
}

function escapeFlite(text) {
  return String(text).replace(/'/g, '').replace(/:/g, ' ');
}

function makeScene(scene, index) {
  const out = path.join(OUT_DIR, `scene-${String(index + 1).padStart(2, '0')}.mp4`);
  const audio = path.join(OUT_DIR, `scene-${String(index + 1).padStart(2, '0')}.wav`);
  const frame = path.join(OUT_DIR, `scene-${String(index + 1).padStart(2, '0')}.svg`);
  const framePng = path.join(OUT_DIR, `scene-${String(index + 1).padStart(2, '0')}.png`);
  const d = Math.max(3, Math.round(scene.duration * 0.55));
  const logo = fs.readFileSync(LOGO).toString('base64');
  const safeTitle = String(scene.title).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const safeSubtitle = String(scene.subtitle).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
  const chips = (scene.chips || []).slice(0, 3);
  fs.writeFileSync(frame, `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${VIDEO_WIDTH}" height="${VIDEO_HEIGHT}" viewBox="0 0 ${VIDEO_WIDTH} ${VIDEO_HEIGHT}">
  <defs>
    <radialGradient id="bg" cx="50%" cy="25%" r="70%">
      <stop offset="0%" stop-color="#073B99"/>
      <stop offset="45%" stop-color="#03183F"/>
      <stop offset="100%" stop-color="#020817"/>
    </radialGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="6" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="${VIDEO_WIDTH}" height="${VIDEO_HEIGHT}" fill="url(#bg)"/>
  <rect x="0" y="0" width="${VIDEO_WIDTH}" height="${VIDEO_HEIGHT}" fill="#001B5C" opacity="0.16"/>
  <rect x="58" y="34" rx="28" ry="28" width="524" height="292" fill="#051021" opacity="0.78" stroke="#1E8CFF" stroke-width="2"/>
  <rect x="86" y="58" rx="20" ry="20" width="468" height="236" fill="#09142F" opacity="0.95" stroke="#2AA6FF" stroke-width="1.5"/>
  <image href="data:image/jpeg;base64,${logo}" x="260" y="62" width="100" height="100" opacity="0.96"/>
  <text x="320" y="178" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="28" font-weight="700" fill="#6FEAFF" filter="url(#glow)">${safeTitle}</text>
  <text x="320" y="208" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="14" fill="#D7F7FF">${safeSubtitle}</text>
  <text x="320" y="230" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="11" fill="#A6E8FF">Telegram demo</text>
  <rect x="180" y="238" width="280" height="2" fill="#1E8CFF" opacity="0.78"/>
  ${chips.map((chip, i) => {
    const widths = [74, 92, 96];
    const w = widths[i] || 88;
    const x = 120 + i * 160;
    return `
      <rect x="${x}" y="268" rx="14" ry="14" width="${w}" height="28" fill="#102A63" stroke="#2AA6FF" stroke-width="1"/>
      <text x="${x + w / 2}" y="287" text-anchor="middle" font-family="DejaVu Sans, Arial, sans-serif" font-size="11" fill="#EAFBFF">${chip}</text>`;
  }).join('')}
</svg>
`);
  run('ffmpeg', ['-hide_banner', '-y', '-i', frame, '-frames:v', '1', framePng]);
  if (WITH_AUDIO) {
    const voice = escapeFlite(scene.voice);
    run('ffmpeg', [
      '-hide_banner',
      '-y',
      '-f',
      'lavfi',
      '-i',
      `flite=text='${voice}':voice=slt`,
      '-t',
      String(Math.max(1, d - 0.4)),
      '-acodec',
      'pcm_s16le',
      audio,
    ]);
  }
  const args = [
    '-hide_banner',
    '-y',
    '-loop',
    '1',
    '-framerate',
    '30',
    '-i',
    framePng,
  ];
  if (WITH_AUDIO) {
    args.push(
      '-i',
      audio,
      '-filter_complex',
      `[1:a]volume=1.45,apad=whole_dur=${d}[a]`,
      '-map',
      '0:v',
      '-map',
      '[a]',
    );
  }
  args.push(
    '-t',
    String(d),
    '-frames:v',
    String(Math.ceil(d * 30)),
    '-r',
    '30',
    '-vf',
    `zoompan=z='min(zoom+0.00085,1.08)':d=${Math.ceil(d * 30)}:s=${VIDEO_WIDTH}x${VIDEO_HEIGHT}:fps=30`,
    '-c:v',
    'libx264',
    '-preset',
    'ultrafast',
    '-pix_fmt',
    'yuv420p',
  );
  if (WITH_AUDIO) {
    args.push('-c:a', 'aac', '-b:a', '128k');
  } else {
    args.push('-an');
  }
  args.push(
    out,
  );
  run('ffmpeg', args);
  return out;
}

function main() {
  if (!fs.existsSync(LOGO)) throw new Error(`logo not found: ${LOGO}`);
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.mkdirSync(DESKTOP_DIR, { recursive: true });
  const scriptPath = path.join(OUT_DIR, 'voiceover-script.txt');
  fs.writeFileSync(scriptPath, scenes.map((s, i) => `${i + 1}. ${s.voice}`).join('\n'));
  const segments = scenes.map(makeScene);
  const listPath = path.join(OUT_DIR, 'concat.txt');
  fs.writeFileSync(listPath, segments.map((segment) => `file '${segment.replace(/'/g, "'\\''")}'`).join('\n'));
  const output = path.join(OUT_DIR, 'privatedao-trading-bot-commercial.mp4');
  const poster = path.join(OUT_DIR, 'privatedao-trading-bot-commercial-poster.png');
  run('ffmpeg', ['-hide_banner', '-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', output]);
  run('ffmpeg', ['-hide_banner', '-y', '-i', output, '-frames:v', '1', poster]);
  fs.copyFileSync(output, path.join(DESKTOP_DIR, 'PrivateDAO Automation Trading - Hollywood Demo.mp4'));
  fs.copyFileSync(poster, path.join(DESKTOP_DIR, 'PrivateDAO Automation Trading - Poster.png'));
  console.log(JSON.stringify({
    ok: true,
    output,
    poster,
    script: scriptPath,
    desktopDir: DESKTOP_DIR,
    audioIncluded: WITH_AUDIO,
    scenes: scenes.length,
  }, null, 2));
}

main();
