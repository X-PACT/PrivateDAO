#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'artifacts', 'hollywood-brand-film');
const DESKTOP_DIR = '/home/x-pact/Desktop/PrivateDAO-Hollywood-Brand-Film';
const LOGO = path.join(ROOT, 'artifacts', 'marketing', 'pdao-logo.png');
const FONT_BOLD = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf';
const FONT_REG = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';

const OUTPUT_VIDEO = path.join(OUT_DIR, 'privatedao-hollywood-brand-film-3min.mp4');
const OUTPUT_POSTER = path.join(OUT_DIR, 'privatedao-hollywood-brand-film-3min-poster.png');
const OUTPUT_AUDIO = path.join(OUT_DIR, 'master-audio.wav');
const DESKTOP_VIDEO = path.join(DESKTOP_DIR, 'PrivateDAO - Hollywood Brand Film - 3 Minutes.mp4');
const DESKTOP_POSTER = path.join(DESKTOP_DIR, 'PrivateDAO - Hollywood Brand Film - Poster.png');
const VOICE_SCRIPT = path.join(OUT_DIR, 'voiceover-script.txt');
const PRODUCTION_NOTES = path.join(OUT_DIR, 'production-notes.txt');

fs.mkdirSync(OUT_DIR, { recursive: true });
fs.mkdirSync(DESKTOP_DIR, { recursive: true });

function run(cmd, args, opts = {}) {
  const result = spawnSync(cmd, args, {
    stdio: opts.capture ? 'pipe' : 'inherit',
    encoding: 'utf8',
    ...opts,
  });
  if (result.status !== 0) {
    throw new Error(`${cmd} failed with code ${result.status}`);
  }
  return result.stdout || '';
}

function esc(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/:/g, '\\:')
    .replace(/'/g, "\\'")
    .replace(/,/g, '\\,')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/%/g, '\\%');
}

const scenes = [
  {
    id: '01',
    title: 'Opportunity Needs Protection',
    kicker: 'PRIVATEDAO',
    subtitle: 'A Hollywood brand film for pre-migration Solana trading.',
    tag: 'Protection. Privacy. Proof.',
    accent: '0x3EE6F0',
    bg: '0x050B1A',
    panel: '0x0B1630',
    voice:
      'In trading, speed without protection is noise. Visibility without privacy is exposure. And execution without proof is trust left to chance.',
  },
  {
    id: '02',
    title: 'Instant Buy. Instant Sell.',
    kicker: 'EXECUTION',
    subtitle: 'One bot. One flow. One command surface.',
    tag: 'One tap execution',
    accent: '0x4FD8FF',
    bg: '0x071021',
    panel: '0x10203A',
    voice:
      'PrivateDAO brings instant buy and sell execution for Solana traders who do not want to fight ten broken tools before every move.',
  },
  {
    id: '03',
    title: 'Trade What Others Cannot',
    kicker: 'EDGE',
    subtitle: 'Built for tokens before the standard liquidity-pool story.',
    tag: 'Pre-migration edge',
    accent: '0xFFD166',
    bg: '0x081220',
    panel: '0x1A2236',
    voice:
      'The edge is simple. Trade fast-moving pre-migration launches before they settle into the slower, more crowded liquidity game.',
  },
  {
    id: '04',
    title: 'Private Buy',
    kicker: 'STEALTH',
    subtitle: 'Large intent does not need large visibility.',
    tag: 'Split. Route. Disappear.',
    accent: '0x58F6D2',
    bg: '0x07111C',
    panel: '0x102631',
    voice:
      'Private execution breaks a larger order into cleaner pieces, reducing footprint and keeping serious intent out of the spotlight.',
  },
  {
    id: '05',
    title: 'Shield Mode',
    kicker: 'RISK CONTROL',
    subtitle: 'Liquidity, slippage, and price impact checked before commitment.',
    tag: 'Risk first',
    accent: '0xF8F8F8',
    bg: '0x120B16',
    panel: '0x2A1423',
    voice:
      'Before capital moves, Shield Mode checks liquidity depth, slippage pressure, and price impact so the user sees the danger before the transaction exists.',
  },
  {
    id: '06',
    title: 'MEV-Aware Lanes',
    kicker: 'ROUTING',
    subtitle: 'Protected pathways for time-sensitive execution.',
    tag: 'Land first. Land clean.',
    accent: '0x3EE6F0',
    bg: '0x06101B',
    panel: '0x0E1D33',
    voice:
      'Protected lanes reduce unnecessary exposure and help the trade reach the market with more control, more speed, and less chaos around it.',
  },
  {
    id: '07',
    title: 'Proof After Action',
    kicker: 'RECEIPTS',
    subtitle: 'Receipts, hashes, explorer trails, and verification surfaces.',
    tag: 'What happened can be proven.',
    accent: '0x6EE7B7',
    bg: '0x08131D',
    panel: '0x11252E',
    voice:
      'Every serious execution deserves a visible receipt. Hashes, signatures, and explorer-ready proof turn a claim into something reviewable.',
  },
  {
    id: '08',
    title: 'Wallet. Balance. Performance.',
    kicker: 'CONTROL',
    subtitle: 'A dedicated wallet posture built for active trading.',
    tag: 'Own the wallet. Own the result.',
    accent: '0xA78BFA',
    bg: '0x090D1F',
    panel: '0x1A1831',
    voice:
      'The trader keeps a dedicated wallet, sees performance directly, and stays close to the balance instead of delegating awareness to a black box.',
  },
  {
    id: '09',
    title: 'Strategies At Speed',
    kicker: 'AUTOMATION',
    subtitle: 'DCA. Grid. Sniper. Limit.',
    tag: 'Strategy, not reaction.',
    accent: '0xF59E0B',
    bg: '0x100D12',
    panel: '0x241A24',
    voice:
      'D C A for disciplined accumulation. Grid trading for structure. Sniper for launch timing. Limit orders for patience. One engine, multiple styles of intent.',
  },
  {
    id: '10',
    title: 'Built For Whale Flow',
    kicker: 'SCALE',
    subtitle: 'For traders, operators, and teams moving with intent.',
    tag: 'Whale-grade posture',
    accent: '0xFB7185',
    bg: '0x110A14',
    panel: '0x291528',
    voice:
      'This is not retail theater. It is an execution surface for traders and teams who care about timing, discretion, and the cost of being seen too early.',
  },
  {
    id: '11',
    title: 'PrivateDAO',
    kicker: 'BRAND',
    subtitle: 'Vegas confidence. Wall Street discipline. Cyber control.',
    tag: 'Trade with protection, privacy, and proof.',
    accent: '0x4FD8FF',
    bg: '0x050B1A',
    panel: '0x101B30',
    voice:
      'PrivateDAO combines casino confidence, trading-floor urgency, and a control-room mindset into one sharply focused Solana trading product.',
  },
  {
    id: '12',
    title: 'Launch The Bot',
    kicker: 'CTA',
    subtitle: 'The line is live. The handle is waiting.',
    tag: 't.me/PrivateDAOO_bot',
    accent: '0x3EE6F0',
    bg: '0x04101A',
    panel: '0x0D1828',
    voice:
      'PrivateDAO. Trade with protection, privacy, and proof. Launch the bot now at t dot me slash PrivateDAOO underscore bot.',
  },
];

function voiceScript() {
  return scenes
    .map((scene, index) => `${index + 1}. ${scene.title}\n${scene.voice}`)
    .join('\n\n');
}

function createSceneImage(scene, isLast) {
  const scenePng = path.join(OUT_DIR, `scene-${scene.id}.png`);
  const filters = [
    `drawbox=x=0:y=0:w=1280:h=720:color=${scene.bg}:t=fill`,
    `drawbox=x=36:y=36:w=1208:h=648:color=${scene.panel}@0.92:t=fill`,
    `drawbox=x=36:y=36:w=1208:h=6:color=${scene.accent}@0.96:t=fill`,
    `drawbox=x=74:y=92:w=248:h=42:color=${scene.accent}@0.18:t=fill`,
    `drawbox=x=74:y=464:w=1132:h=120:color=0x050B1A@0.36:t=fill`,
    `drawgrid=w=64:h=64:t=1:c=white@0.035`,
    `drawtext=fontfile=${FONT_BOLD}:text='${esc(scene.kicker)}':fontsize=22:fontcolor=${scene.accent}:x=92:y=100`,
    `drawtext=fontfile=${FONT_BOLD}:text='${esc(scene.title)}':fontsize=58:fontcolor=white:x=88:y=176`,
    `drawtext=fontfile=${FONT_REG}:text='${esc(scene.subtitle)}':fontsize=26:fontcolor=0xDCE8F6:x=92:y=252`,
    `drawtext=fontfile=${FONT_BOLD}:text='${esc(scene.tag)}':fontsize=${isLast ? 38 : 30}:fontcolor=${scene.accent}:x=92:y=492`,
    `drawtext=fontfile=${FONT_REG}:text='Private Solana trading for pre-migration token execution.':fontsize=22:fontcolor=white@0.86:x=92:y=540`,
    `drawtext=fontfile=${FONT_REG}:text='Buy. Sell. Private Buy. Shield. MEV. Receipts. DCA. Grid. Sniper.':fontsize=20:fontcolor=0xB8C7D9:x=92:y=584`,
  ];

  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-i',
    LOGO,
    '-f',
    'lavfi',
    '-i',
    'color=c=#050B1A:s=1280x720',
    '-filter_complex',
    `[1:v]${filters.join(',')}[bg];[0:v]scale=260:260[logo];[bg][logo]overlay=930:118`,
    '-frames:v',
    '1',
    scenePng,
  ]);
  return scenePng;
}

function createVoice(scene) {
  const out = path.join(OUT_DIR, `voice-${scene.id}.wav`);
  const text = scene.voice.replace(/:/g, '\\:').replace(/'/g, "\\'");
  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-f',
    'lavfi',
    '-i',
    `flite=text='${text}':voice=awb`,
    '-af',
    'atempo=0.92,aecho=0.8:0.75:45:0.18,firequalizer=gain_entry=\'entry(0,0);entry(80,2);entry(160,1);entry(800,-2);entry(3500,1)\',volume=1.9',
    out,
  ]);
  return out;
}

function getDuration(file) {
  const out = run(
    'ffprobe',
    ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', file],
    { capture: true }
  ).trim();
  return Number(out);
}

function createSceneVideo(scene, scenePng, voiceWav) {
  const out = path.join(OUT_DIR, `scene-${scene.id}.mp4`);
  // Keep the finished cut close to a true three-minute runtime after transitions.
  const duration = Math.max(16.0, Math.min(17.0, getDuration(voiceWav) + 5.0));
  const logoPulse = `drawbox=x='70+20*sin(t*1.4)':y=620:w=1140:h=2:color=${scene.accent}@0.7:t=fill`;
  const videoFx =
    `scale=1320:742,zoompan=z='min(1.12,1.0+0.0009*on)':x='iw/2-(iw/zoom/2)+10*sin(on/18)':y='ih/2-(ih/zoom/2)+6*cos(on/21)':d=1:s=1280x720:fps=24,` +
    `eq=saturation=1.14:brightness=0.02,${logoPulse},fade=t=in:st=0:d=0.6,fade=t=out:st=${(duration - 1.0).toFixed(2)}:d=1`;

  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-loop',
    '1',
    '-t',
    duration.toFixed(3),
    '-i',
    scenePng,
    '-filter_complex',
    `[0:v]${videoFx}[v]`,
    '-map',
    '[v]',
    '-r',
    '24',
    '-c:v',
    'libx264',
    '-preset',
    'veryfast',
    '-pix_fmt',
    'yuv420p',
    '-movflags',
    '+faststart',
    out,
  ]);

  return { file: out, duration };
}

function createMusicBed(targetDuration) {
  const out = path.join(OUT_DIR, 'music-bed.wav');
  const expr = [
    '0.16*sin(2*PI*48*t)',
    '+0.08*sin(2*PI*96*t)',
    '+0.035*sin(2*PI*192*t)',
    '+0.018*sin(2*PI*(330+25*sin(2*PI*0.11*t))*t)',
    '+0.012*sin(2*PI*(660+55*sin(2*PI*0.07*t))*t)',
    '+0.015*random(0)',
  ].join('');
  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-f',
    'lavfi',
    '-i',
    `aevalsrc=${expr}:s=48000:d=${targetDuration.toFixed(3)}`,
    '-af',
    'lowpass=f=480,highpass=f=28,aecho=0.8:0.7:40|120:0.20|0.08,chorus=0.7:0.9:50|60|40:0.3|0.25|0.2:0.25|0.4|0.3:2|2.3|1.3,volume=0.75',
    out,
  ]);
  return out;
}

function createSparkSfx(name, freq, dur, volume) {
  const out = path.join(OUT_DIR, `${name}.wav`);
  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-f',
    'lavfi',
    '-i',
    `aevalsrc=sin(2*PI*${freq}*t)*exp(-7*t):s=48000:d=${dur}`,
    '-af',
    `aecho=0.8:0.6:12:0.18,volume=${volume}`,
    out,
  ]);
  return out;
}

function buildEffectsTrack(totalDuration) {
  const chip = createSparkSfx('chip', 980, 0.18, 0.9);
  const cash = createSparkSfx('cash', 1320, 0.28, 0.6);
  const lock = createSparkSfx('lock', 440, 0.22, 0.85);
  const whoosh = createSparkSfx('whoosh', 220, 0.5, 0.55);
  const out = path.join(OUT_DIR, 'effects.wav');

  const events = [
    { file: chip, at: 18.0 },
    { file: chip, at: 33.2 },
    { file: lock, at: 63.8 },
    { file: whoosh, at: 78.4 },
    { file: chip, at: 94.0 },
    { file: cash, at: 111.6 },
    { file: chip, at: 128.0 },
    { file: whoosh, at: 142.5 },
    { file: chip, at: 158.0 },
  ];

  const args = ['-hide_banner', '-y'];
  events.forEach((event) => {
    args.push('-i', event.file);
  });
  const mixParts = events.map((event, index) => `[${index}:a]adelay=${Math.round(event.at * 1000)}|${Math.round(event.at * 1000)}[a${index}]`);
  const inputs = events.map((_, index) => `[a${index}]`).join('');
  mixParts.push(`${inputs}amix=inputs=${events.length}:normalize=0,atrim=0:${totalDuration.toFixed(3)}[mix]`);
  args.push('-filter_complex', mixParts.join(';'));
  args.push('-map', '[mix]', out);
  run('ffmpeg', args);
  return out;
}

function concatVideo(sceneVideos) {
  const out = path.join(OUT_DIR, 'master-video.mp4');
  if (sceneVideos.length !== scenes.length) throw new Error('scene count mismatch');

  const args = ['-hide_banner', '-y'];
  sceneVideos.forEach((scene) => {
    args.push('-i', scene.file);
  });

  const prep = sceneVideos.map((_, i) => `[${i}:v]fps=30,format=yuv420p[v${i}]`);
  let chain = '[v0]';
  let cursor = sceneVideos[0].duration;
  for (let i = 1; i < sceneVideos.length; i += 1) {
    cursor -= 1.0;
    const label = i === sceneVideos.length - 1 ? '[vout]' : `[x${i}]`;
    prep.push(`${chain}[v${i}]xfade=transition=fade:duration=1:offset=${cursor.toFixed(3)}${label}`);
    chain = label;
    cursor += sceneVideos[i].duration;
  }
  args.push('-filter_complex', prep.join(';'));
  args.push('-map', '[vout]', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out);
  run('ffmpeg', args);
  return out;
}

function concatVoiceTracks(sceneVoices, totalDuration) {
  const out = path.join(OUT_DIR, 'voiceover.wav');
  const args = ['-hide_banner', '-y'];
  sceneVoices.forEach((voice) => args.push('-i', voice.file));
  const parts = [];
  let t = 0;
  sceneVoices.forEach((voice, index) => {
    const delayMs = Math.round(t * 1000);
    parts.push(`[${index}:a]adelay=${delayMs}|${delayMs}[v${index}]`);
    t += voice.sceneDuration;
  });
  parts.push(`${sceneVoices.map((_, i) => `[v${i}]`).join('')}amix=inputs=${sceneVoices.length}:normalize=0,atrim=0:${totalDuration.toFixed(3)},volume=1.35[mix]`);
  args.push('-filter_complex', parts.join(';'));
  args.push('-map', '[mix]', out);
  run('ffmpeg', args);
  return out;
}

function mixFinalAudio(voice, bed, effects, totalDuration) {
  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-i',
    voice,
    '-i',
    bed,
    '-i',
    effects,
    '-filter_complex',
    `[1:a]volume=0.33[music];[2:a]volume=0.7[fx];[0:a][music][fx]amix=inputs=3:normalize=0,alimiter=limit=0.92,atrim=0:${totalDuration.toFixed(3)}[a]`,
    '-map',
    '[a]',
    OUTPUT_AUDIO,
  ]);
  return OUTPUT_AUDIO;
}

function mux(video, audio) {
  run('ffmpeg', [
    '-hide_banner',
    '-y',
    '-i',
    video,
    '-i',
    audio,
    '-map',
    '0:v:0',
    '-map',
    '1:a:0',
    '-c:v',
    'copy',
    '-c:a',
    'aac',
    '-b:a',
    '256k',
    '-shortest',
    OUTPUT_VIDEO,
  ]);
}

function cleanup(files) {
  files.forEach((file) => {
    try {
      fs.rmSync(file, { force: true, recursive: true });
    } catch (_) {}
  });
}

fs.writeFileSync(VOICE_SCRIPT, voiceScript());
fs.writeFileSync(
  PRODUCTION_NOTES,
  [
    'PrivateDAO Hollywood Brand Film',
    'Length target: 3 minutes',
    'Mode: English cinematic',
    'Video: generated locally from scratch with ffmpeg-based motion design',
    'Voice: local fallback TTS because no professional API key was available at runtime',
    'Music: procedural ambient + casino-style effects mixed locally',
  ].join('\n')
);

const scenePngs = [];
const voiceTracks = [];
const sceneVideos = [];

for (const scene of scenes) {
  const png = createSceneImage(scene, scene.id === '12');
  scenePngs.push(png);
  const voice = createVoice(scene);
  const video = createSceneVideo(scene, png, voice);
  voiceTracks.push({ file: voice, sceneDuration: video.duration });
  sceneVideos.push(video);
}

const totalDuration = sceneVideos.reduce((sum, scene) => sum + scene.duration, 0) - (sceneVideos.length - 1) * 1;
const masterVideo = concatVideo(sceneVideos);
const voiceover = concatVoiceTracks(voiceTracks, totalDuration);
const music = createMusicBed(totalDuration);
const effects = buildEffectsTrack(totalDuration);
mixFinalAudio(voiceover, music, effects, totalDuration);
mux(masterVideo, OUTPUT_AUDIO);

run('ffmpeg', ['-hide_banner', '-y', '-i', OUTPUT_VIDEO, '-frames:v', '1', OUTPUT_POSTER]);
fs.copyFileSync(OUTPUT_VIDEO, DESKTOP_VIDEO);
fs.copyFileSync(OUTPUT_POSTER, DESKTOP_POSTER);

cleanup(scenePngs);

console.log(JSON.stringify({
  ok: true,
  durationSeconds: Number(totalDuration.toFixed(2)),
  outputVideo: OUTPUT_VIDEO,
  outputPoster: OUTPUT_POSTER,
  desktopVideo: DESKTOP_VIDEO,
  desktopPoster: DESKTOP_POSTER,
  voiceScript: VOICE_SCRIPT,
  notes: PRODUCTION_NOTES,
}, null, 2));
