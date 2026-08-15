import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import './styles.css';

const experience = document.querySelector('#experience');
const host = document.querySelector('#webgl');
const promptText = document.querySelector('#prompt-text');
const currentIndex = document.querySelector('#current-index');
const progressFill = document.querySelector('#progress-fill');
const previousButton = document.querySelector('#previous');
const nextButton = document.querySelector('#next');
const generateButton = document.querySelector('#generate');
const clearButton = document.querySelector('#clear');
const signalButton = document.querySelector('#signal');
const timerElement = document.querySelector('.draw-timer');
const timerValue = document.querySelector('#timer-value');
const timerFill = document.querySelector('#timer-fill');
const transitionLoader = document.querySelector('#transition-loader');
const comparisonLabels = [...document.querySelectorAll('.comparison span')];
const cursorLabel = document.querySelector('.cursor-label');
const chapterButtons = [...document.querySelectorAll('.chapter')];
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const STAGES = [
  { key: 'human', name: 'HUMAN', prompt: 'DRAW A CIRCLE THAT FEELS TIRED' },
  { key: 'machine', name: 'MACHINE', prompt: 'DRAW SOMETHING YOU WOULD NEVER OPTIMIZE' },
  { key: 'nature', name: 'NATURE', prompt: 'DRAW WHERE THE WILD BEGINS' },
  { key: 'weather', name: 'WEATHER', prompt: 'DRAW THE SOUND OF RAIN' },
  { key: 'mirror', name: 'MIRROR', prompt: 'DRAW WITHOUT USING SYMMETRY' },
  { key: 'shadow', name: 'SHADOW', prompt: 'DRAW WHAT IS MISSING' },
  { key: 'echo', name: 'ECHO', prompt: 'HEAR IT. DRAW ITS RHYTHM.' },
  { key: 'swarm', name: 'SWARM', prompt: 'DRAW A PATH THROUGH NOISE' },
  { key: 'relic', name: 'RELIC', prompt: 'DRAW AN OBJECT FROM ANOTHER LIFE' },
  { key: 'recall', name: 'RECALL', prompt: 'REDRAW THE FIRST THING YOU MADE' },
];

const DRAW_COLORS = [0x171718, 0xffffff, 0xe9f5df, 0x281722, 0xf4f1e8, 0xd8d2c7, 0x201d32, 0xe9ffe6, 0xf5e5bd, 0xf3f5ff];
const AI_COLORS = [0x3268ef, 0xd8ff45, 0xf1bf3b, 0x3b65ff, 0x9aabff, 0xff7a67, 0x6e4fff, 0xa6ff7d, 0xe2a85f, 0x8da4ff];
const TOOL_STYLES = [
  {
    name: 'graphite', snap: 0, audio: [1550, 0.78, 0.032],
    layers: [
      { kind: 'line', color: 0x282321, opacity: 0.72, jitter: 0.002 },
      { kind: 'points', color: 0x171718, opacity: 0.24, size: 0.045, jitter: 0.014 },
    ],
  },
  {
    name: 'plotter', snap: 0.115, audio: [3050, 2.4, 0.018],
    layers: [
      { kind: 'line', color: 0xffffff, opacity: 0.92 },
      { kind: 'line', color: 0xd8ff45, opacity: 0.5, offset: 0.018 },
    ],
  },
  {
    name: 'moss-brush', snap: 0, audio: [720, 0.52, 0.042],
    layers: [
      { kind: 'line', color: 0xc9ffd9, opacity: 0.68, jitter: 0.008 },
      { kind: 'line', color: 0x55dc91, opacity: 0.36, offset: -0.028, jitter: 0.014 },
      { kind: 'points', color: 0xa8f5a6, opacity: 0.58, size: 0.16, jitter: 0.035, every: 2 },
    ],
  },
  {
    name: 'rain-nib', snap: 0, audio: [2350, 1.1, 0.026],
    layers: [
      { kind: 'line', color: 0x281722, opacity: 0.84 },
      { kind: 'line', color: 0x526dff, opacity: 0.38, offset: 0.022 },
      { kind: 'line', color: 0xf0d8e2, opacity: 0.24, offset: -0.022 },
    ],
  },
  {
    name: 'glass-stylus', snap: 0.055, audio: [4100, 3.1, 0.014],
    layers: [
      { kind: 'line', color: 0xf7f8ff, opacity: 0.88 },
      { kind: 'line', color: 0x869cff, opacity: 0.48, offset: 0.028 },
    ],
  },
  {
    name: 'charcoal', snap: 0, audio: [460, 0.44, 0.052],
    layers: [
      { kind: 'line', color: 0x171718, opacity: 0.72, jitter: 0.018 },
      { kind: 'line', color: 0xbdb7b0, opacity: 0.26, offset: 0.035, jitter: 0.028 },
      { kind: 'points', color: 0x171718, opacity: 0.36, size: 0.13, jitter: 0.045, every: 2 },
    ],
  },
  {
    name: 'signal-pen', snap: 0, audio: [1850, 4.2, 0.024],
    layers: [
      { kind: 'line', color: 0x342461, opacity: 0.88 },
      { kind: 'line', color: 0x8d6fff, opacity: 0.5, offset: 0.03 },
      { kind: 'points', color: 0xffffff, opacity: 0.4, size: 0.075, every: 3 },
    ],
  },
  {
    name: 'swarm-wand', snap: 0, audio: [1180, 0.32, 0.025],
    layers: [
      { kind: 'line', color: 0xcaffac, opacity: 0.2 },
      { kind: 'points', color: 0xddffd1, opacity: 0.92, size: 0.1, jitter: 0.038 },
      { kind: 'points', color: 0x78f450, opacity: 0.54, size: 0.16, jitter: 0.072, every: 3 },
    ],
  },
  {
    name: 'metal-quill', snap: 0.035, audio: [2650, 1.7, 0.026],
    layers: [
      { kind: 'line', color: 0xffe0a4, opacity: 0.86 },
      { kind: 'line', color: 0xb87931, opacity: 0.54, offset: -0.024 },
      { kind: 'points', color: 0xf6bf68, opacity: 0.34, size: 0.075, jitter: 0.018, every: 2 },
    ],
  },
  {
    name: 'memory-pencil', snap: 0, audio: [980, 0.9, 0.03],
    layers: [
      { kind: 'line', color: 0xf3f5ff, opacity: 0.7 },
      { kind: 'line', color: 0xff7fa9, opacity: 0.4, offset: 0.034, jitter: 0.008 },
      { kind: 'line', color: 0x8da4ff, opacity: 0.26, offset: -0.034, jitter: 0.008 },
    ],
  },
];
const MAX_STROKES = 8;
const MAX_POINTS_PER_STROKE = 720;
const MIN_POINTS_TO_TRANSFORM = 24;
const DRAW_TIME_LIMIT = 15;
const challengeWords = ['hesitate', 'correct', 'drift', 'return', 'remember', 'deviate'];
const challengeSeed = (() => {
  const values = new Uint32Array(1);
  window.crypto?.getRandomValues?.(values);
  return values[0] || Math.floor(Math.random() * 0xffffffff);
})();

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, window.innerWidth / window.innerHeight, 0.1, 60);
camera.position.set(0, 0, 8);

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.12;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
host.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enabled = false;
controls.enableDamping = true;
controls.dampingFactor = 0.055;
controls.enableZoom = true;
controls.enablePan = true;
controls.screenSpacePanning = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.48;
controls.minDistance = 2.7;
controls.maxDistance = 13;
controls.minPolarAngle = 0.2;
controls.maxPolarAngle = Math.PI - 0.2;

const environmentGenerator = new THREE.PMREMGenerator(renderer);
scene.environment = environmentGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
environmentGenerator.dispose();

scene.add(new THREE.HemisphereLight(0xf7f0df, 0x152039, 1.25));
const keyLight = new THREE.DirectionalLight(0xfff3dc, 4.2);
keyLight.position.set(3.5, 5.5, 5);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(1024, 1024);
keyLight.shadow.camera.left = -5;
keyLight.shadow.camera.right = 5;
keyLight.shadow.camera.top = 5;
keyLight.shadow.camera.bottom = -5;
scene.add(keyLight);
const rimLight = new THREE.PointLight(0x6f82ff, 32, 16, 2);
rimLight.position.set(-4, 1.5, 3);
scene.add(rimLight);
const warmLight = new THREE.PointLight(0xff765e, 24, 14, 2);
warmLight.position.set(3, -2, 4);
scene.add(warmLight);

const floorMaterial = new THREE.ShadowMaterial({ color: 0x000000, transparent: true, opacity: 0 });
const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 16), floorMaterial);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -2.35;
floor.receiveShadow = true;
scene.add(floor);

const stageGroups = STAGES.map(() => {
  const group = new THREE.Group();
  group.visible = false;
  scene.add(group);
  return group;
});
const drawingGroups = [];
const aiDrawingGroups = [];
const outputGroups = [];
for (let i = 0; i < STAGES.length; i += 1) {
  const drawing = new THREE.Group();
  const aiDrawing = new THREE.Group();
  const output = new THREE.Group();
  stageGroups[i].add(drawing, aiDrawing, output);
  drawingGroups.push(drawing);
  aiDrawingGroups.push(aiDrawing);
  outputGroups.push(output);
}

function freshStageData() {
  return {
    strokes: [],
    aiStrokes: [],
    totalPoints: 0,
    samples: [],
    recallStrokes: [],
    recallPoints: 0,
    recallSamples: [],
    phase: 'draw',
    completed: false,
    presence: null,
    timerStartedAt: null,
    timerRemaining: DRAW_TIME_LIMIT,
    timeExpired: false,
    aiProgress: 0,
    aiRevealLines: [],
    aiFinishedAt: null,
  };
}

const stageData = Array.from({ length: STAGES.length }, freshStageData);

const pointerNdc = new THREE.Vector2();
const pointerWorld = new THREE.Vector3();
const previousPointerWorld = new THREE.Vector3();
const clock = new THREE.Clock();
let pointerDown = false;
let stageIndex = 0;
let currentStroke = null;
let currentLiveLine = null;
let currentMachineGhost = null;
let currentAiLine = null;
let currentAiStroke = null;
let generationProgress = 0;
let natureReveal = [];
let latestPointerSample = { time: performance.now(), pressure: 0, pointerType: 'mouse' };
let controlsInteracting = false;
let audioContext = null;
let pencilNoiseBuffer = null;
let pencilNoiseSource = null;
let pencilGain = null;
let pencilFilter = null;
let pencilPan = null;
let lastPencilSampleTime = performance.now();
let transitionBusy = false;
let activeOutputTarget = null;
let promptTimer = 0;
let promptSequence = 0;
let cursorScreenX = window.innerWidth / 2;
let cursorScreenY = window.innerHeight / 2;
let cursorAngle = -24;

controls.addEventListener('start', () => { controlsInteracting = true; });
controls.addEventListener('end', () => { controlsInteracting = false; });

function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

function smooth(value) {
  const v = clamp(value);
  return v * v * (3 - 2 * v);
}

function ensurePencilNoiseBuffer() {
  if (pencilNoiseBuffer || !audioContext) return;
  const length = Math.floor(audioContext.sampleRate * 1.5);
  pencilNoiseBuffer = audioContext.createBuffer(1, length, audioContext.sampleRate);
  const samples = pencilNoiseBuffer.getChannelData(0);
  let previous = 0;
  for (let index = 0; index < length; index += 1) {
    const raw = Math.random() * 2 - 1;
    const tooth = Math.sin(index * 0.71) * 0.18 + Math.sin(index * 0.137) * 0.11;
    samples[index] = (raw - previous * 0.72 + tooth) * 0.38;
    previous = raw;
  }
}

function startPencilSound() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  audioContext.resume?.().catch?.(() => {});
  ensurePencilNoiseBuffer();
  if (pencilNoiseSource) return;
  pencilNoiseSource = audioContext.createBufferSource();
  pencilNoiseSource.buffer = pencilNoiseBuffer;
  pencilNoiseSource.loop = true;
  pencilFilter = audioContext.createBiquadFilter();
  pencilFilter.type = 'bandpass';
  const [frequency, resonance] = TOOL_STYLES[stageIndex].audio;
  pencilFilter.frequency.value = frequency;
  pencilFilter.Q.value = resonance;
  pencilGain = audioContext.createGain();
  pencilGain.gain.setValueAtTime(0.0001, audioContext.currentTime);
  pencilPan = audioContext.createStereoPanner?.() ?? null;
  pencilNoiseSource.connect(pencilFilter);
  if (pencilPan) pencilFilter.connect(pencilPan).connect(pencilGain);
  else pencilFilter.connect(pencilGain);
  pencilGain.connect(audioContext.destination);
  pencilNoiseSource.start();
  pencilGain.gain.exponentialRampToValueAtTime(0.006, audioContext.currentTime + 0.025);
  lastPencilSampleTime = performance.now();
}

function updatePencilSound(distance, sample) {
  if (!pencilNoiseSource || !audioContext || !pencilGain || !pencilFilter) return;
  const now = performance.now();
  const deltaSeconds = Math.max(0.008, (now - lastPencilSampleTime) / 1000);
  const speed = distance / deltaSeconds;
  const pressure = sample.pointerType === 'mouse' ? 0.46 : clamp(sample.pressure || 0.28, 0.12, 1);
  const energy = clamp(speed / 11) * (0.62 + pressure * 0.58);
  const [frequency, resonance, volume] = TOOL_STYLES[stageIndex].audio;
  const audioTime = audioContext.currentTime;
  pencilGain.gain.setTargetAtTime(0.003 + energy * volume, audioTime, 0.018);
  pencilFilter.frequency.setTargetAtTime(frequency * (0.72 + energy * 1.08), audioTime, 0.022);
  pencilFilter.Q.setTargetAtTime(resonance + pressure * 0.7, audioTime, 0.03);
  pencilPan?.pan.setTargetAtTime(clamp(pointerNdc.x, -0.78, 0.78), audioTime, 0.025);
  lastPencilSampleTime = now;
}

function stopPencilSound() {
  if (!pencilNoiseSource || !audioContext || !pencilGain) return;
  const source = pencilNoiseSource;
  const now = audioContext.currentTime;
  pencilGain.gain.cancelScheduledValues(now);
  pencilGain.gain.setTargetAtTime(0.0001, now, 0.018);
  window.setTimeout(() => {
    try { source.stop(); } catch {}
    source.disconnect();
  }, 90);
  pencilNoiseSource = null;
  pencilGain = null;
  pencilFilter = null;
  pencilPan = null;
}

function makeSurfaceTexture(seed) {
  const size = 128;
  const data = new Uint8Array(size * size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const waveA = Math.sin((x + seed * 13) * 0.23) * 34;
      const waveB = Math.cos((y - seed * 7) * 0.31) * 27;
      const grain = Math.sin((x * 1.7 + y * 2.3 + seed) * 1.91) * 18;
      data[y * size + x] = clamp(Math.round(128 + waveA + waveB + grain), 0, 255);
    }
  }
  const texture = new THREE.DataTexture(data, size, size, THREE.RedFormat, THREE.UnsignedByteType);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(7, 2);
  texture.colorSpace = THREE.NoColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const clayTexture = makeSurfaceTexture(2.1);
const metalTexture = makeSurfaceTexture(5.3);
const barkTexture = makeSurfaceTexture(8.8);
const glassTexture = makeSurfaceTexture(12.4);

function physicalMaterial(options, texture, bumpScale = 0.025) {
  return new THREE.MeshPhysicalMaterial({
    envMapIntensity: 1.25,
    bumpMap: texture,
    bumpScale,
    roughnessMap: texture,
    ...options,
  });
}

const surfaceTemplates = {
  humanInk: physicalMaterial({ color: 0x1c1918, roughness: 0.38, metalness: 0.08, clearcoat: 0.32, sheen: 0.45, sheenColor: new THREE.Color(0x8b493f) }, clayTexture, 0.034),
  humanCoral: physicalMaterial({ color: 0xe86350, roughness: 0.31, metalness: 0.05, clearcoat: 0.62, clearcoatRoughness: 0.28 }, clayTexture, 0.045),
  machineChrome: physicalMaterial({ color: 0xcbd4e7, roughness: 0.13, metalness: 0.94, clearcoat: 0.8, clearcoatRoughness: 0.08, iridescence: 0.28 }, metalTexture, 0.012),
  machineSignal: physicalMaterial({ color: 0xcdfb37, emissive: 0x3e5500, emissiveIntensity: 0.75, roughness: 0.22, metalness: 0.36, clearcoat: 0.7 }, metalTexture, 0.018),
  nature: physicalMaterial({ color: 0x54b986, roughness: 0.72, metalness: 0, sheen: 0.35, sheenColor: new THREE.Color(0xa6ffd2) }, barkTexture, 0.065),
  memory: physicalMaterial({ color: 0xf4d9d5, roughness: 0.14, metalness: 0, transmission: 0.82, thickness: 0.46, ior: 1.42, transparent: true, opacity: 0.82, iridescence: 0.35 }, glassTexture, 0.018),
  mirror: physicalMaterial({ color: 0xe7edf9, roughness: 0.08, metalness: 0.92, clearcoat: 1, iridescence: 0.7 }, metalTexture, 0.012),
  shadow: physicalMaterial({ color: 0x131315, roughness: 0.62, metalness: 0.18, clearcoat: 0.16 }, barkTexture, 0.055),
  echo: physicalMaterial({ color: 0x856dff, emissive: 0x312277, emissiveIntensity: 1.2, roughness: 0.2, metalness: 0.25, clearcoat: 0.8 }, glassTexture, 0.016),
  swarm: physicalMaterial({ color: 0xb9ff83, emissive: 0x23540e, emissiveIntensity: 0.65, roughness: 0.32, metalness: 0.28 }, barkTexture, 0.025),
  relic: physicalMaterial({ color: 0xa56a2c, roughness: 0.36, metalness: 0.82, clearcoat: 0.22 }, barkTexture, 0.07),
  dream: physicalMaterial({ color: 0xdadfff, roughness: 0.05, metalness: 0.12, transmission: 0.7, thickness: 0.6, ior: 1.55, transparent: true, opacity: 0.86, iridescence: 0.82 }, glassTexture, 0.022),
  recallUser: physicalMaterial({ color: 0xf07863, roughness: 0.34, metalness: 0.04, clearcoat: 0.58, sheen: 0.4, sheenColor: new THREE.Color(0xffb8a8) }, clayTexture, 0.045),
  recallModel: physicalMaterial({ color: 0x9aabff, roughness: 0.12, metalness: 0.9, clearcoat: 0.9, iridescence: 0.52 }, metalTexture, 0.012),
};

const PAPER_COLORS = [
  [0xf2eee5, 0xe8edf8],
  [0x263aaf, 0x203293],
  [0x173a31, 0x12332b],
  [0xedb1a6, 0xe3a398],
  [0x17171b, 0x11131a],
  [0x57535a, 0x4c4a52],
  [0xd2c8ee, 0xc4b9e6],
  [0x1a3323, 0x142d1e],
  [0x563820, 0x482f1d],
  [0x29263f, 0x22243b],
];
const DRAWING_CENTER_X = 2.48;
const DRAWING_WIDTH = 4.46;
const DRAWING_HEIGHT = 4.78;

function makePaperArtwork(mode, role) {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 720;
  const context = canvas.getContext('2d');
  const random = (salt = 0) => {
    const value = Math.sin((mode + 1) * 971.3 + (role + 1) * 313.7 + salt * 89.17) * 43758.5453;
    return value - Math.floor(value);
  };
  context.fillStyle = role ? '#edf0f4' : '#f2efe8';
  context.fillRect(0, 0, canvas.width, canvas.height);

  context.globalAlpha = 0.1;
  for (let i = 0; i < 840; i += 1) {
    const x = random(i * 2.1) * canvas.width;
    const y = random(i * 3.7) * canvas.height;
    const length = 4 + random(i * 5.9) * 38;
    context.strokeStyle = i % 3 ? '#5b554d' : '#ffffff';
    context.lineWidth = 0.35 + random(i * 7.3) * 0.8;
    context.beginPath();
    context.moveTo(x, y);
    context.lineTo(x + length, y + (random(i * 9.1) - 0.5) * 2.5);
    context.stroke();
  }

  context.globalAlpha = 0;
  context.lineWidth = role ? 2.1 : 2.8;
  context.strokeStyle = role ? '#5276c7' : '#665a50';
  context.fillStyle = role ? '#597ee0' : '#6e6256';
  const cx = 256 + (role ? 22 : -18);
  const cy = 360;
  if (mode === 0) {
    context.globalAlpha = role ? 0.075 : 0.09;
    for (let mark = 0; mark < 38; mark += 1) {
      const x = 34 + random(mark * 4.7) * 444;
      const y = 30 + random(mark * 8.9) * 660;
      const drift = (random(mark * 13.1) - 0.5) * 92;
      context.beginPath();
      context.moveTo(x, y);
      context.bezierCurveTo(x + drift * 0.3, y - 7, x + drift * 0.7, y + 9, x + drift, y + (random(mark * 7.2) - 0.5) * 20);
      context.stroke();
    }
  } else if (mode === 1) {
    for (let i = 0; i < 22; i += 1) {
      const x = 28 + random(i * 4.2) * 456;
      const y = 30 + random(i * 8.3) * 660;
      context.beginPath();
      context.moveTo(x, y);
      context.lineTo(x + (random(i * 3.1) - 0.5) * 150, y);
      context.lineTo(x + (random(i * 6.2) - 0.5) * 150, y + (random(i * 9.7) - 0.5) * 170);
      context.stroke();
      context.fillRect(x - 3, y - 3, 6, 6);
    }
  } else if (mode === 2) {
    for (let i = 0; i < 28; i += 1) {
      context.beginPath();
      context.moveTo(cx, 690);
      context.bezierCurveTo(cx + (random(i) - 0.5) * 90, 520, random(i * 2.1) * 512, 260, random(i * 4.3) * 512, 20);
      context.stroke();
    }
  } else if (mode === 3) {
    context.lineCap = 'round';
    for (let i = 0; i < 34; i += 1) {
      const x = 18 + random(i * 2.4) * 476;
      context.lineWidth = 1 + random(i * 4.5) * 9;
      context.beginPath();
      context.moveTo(x, -20);
      context.bezierCurveTo(x - 30, 220, x + 40, 460, x + (random(i * 8.8) - 0.5) * 60, 750);
      context.stroke();
    }
  } else if (mode === 4) {
    for (let i = -3; i < 12; i += 1) {
      context.beginPath();
      context.moveTo(i * 72, 0);
      context.lineTo(512 - i * 27, 720);
      context.lineTo(256 + i * 18, 360);
      context.stroke();
    }
  } else if (mode === 5) {
    for (let i = 0; i < 12; i += 1) {
      const gradient = context.createRadialGradient(random(i) * 512, random(i * 3.2) * 720, 0, random(i) * 512, random(i * 3.2) * 720, 55 + random(i * 8.1) * 120);
      gradient.addColorStop(0, 'rgba(18,16,20,.34)');
      gradient.addColorStop(1, 'rgba(18,16,20,0)');
      context.fillStyle = gradient;
      context.fillRect(0, 0, 512, 720);
    }
  } else if (mode === 6) {
    for (let wave = 0; wave < 18; wave += 1) {
      context.beginPath();
      for (let x = 0; x <= 512; x += 8) {
        const y = 70 + wave * 34 + Math.sin(x * 0.024 + wave * 0.62) * (9 + wave * 0.7);
        if (x) context.lineTo(x, y); else context.moveTo(x, y);
      }
      context.stroke();
    }
  } else if (mode === 7) {
    for (let i = 0; i < 260; i += 1) {
      const x = random(i * 2.7) * 512;
      const y = random(i * 4.7) * 720;
      const radius = 0.8 + random(i * 7.2) * 4.2;
      context.beginPath();
      context.arc(x, y, radius, 0, Math.PI * 2);
      context.fill();
      if (i % 5 === 0) {
        context.beginPath();
        context.moveTo(x, y);
        context.lineTo(random(i * 9.1) * 512, random(i * 11.3) * 720);
        context.stroke();
      }
    }
  } else if (mode === 8) {
    context.lineWidth = 1.2;
    for (let i = 0; i < 36; i += 1) {
      let x = random(i) * 512;
      let y = random(i * 2.9) * 720;
      context.beginPath();
      context.moveTo(x, y);
      for (let segment = 0; segment < 7; segment += 1) {
        x += (random(i * 11 + segment) - 0.5) * 62;
        y += 22 + random(i * 17 + segment) * 42;
        context.lineTo(x, y);
      }
      context.stroke();
    }
  } else {
    for (let layer = 0; layer < 24; layer += 1) {
      context.beginPath();
      context.ellipse(cx + Math.sin(layer) * 38, cy + Math.cos(layer * 1.7) * 46, 44 + layer * 8, 70 + layer * 5, layer * 0.14, 0, Math.PI * 2);
      context.stroke();
    }
  }
  context.globalAlpha = 1;
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  texture.needsUpdate = true;
  return texture;
}

const PAPER_ARTWORKS = PAPER_COLORS.map((_, mode) => [makePaperArtwork(mode, 0), makePaperArtwork(mode, 1)]);

function makeTornPaperGeometry(mode, role) {
  const halfWidth = DRAWING_WIDTH / 2;
  const halfHeight = DRAWING_HEIGHT / 2;
  const random = (salt = 0) => {
    const value = Math.sin((mode + 3) * 747.1 + (role + 5) * 191.7 + salt * 61.37) * 43758.5453;
    return value - Math.floor(value);
  };
  const damage = 0.105 + mode * 0.011;
  const points = [];
  const edgeSteps = 18;
  for (let step = 0; step <= edgeSteps; step += 1) {
    const t = step / edgeSteps;
    const cornerSoftness = Math.sin(t * Math.PI);
    const tear = (random(step * 2.7) - 0.5) * damage * (0.35 + cornerSoftness);
    points.push(new THREE.Vector2(-halfWidth + t * DRAWING_WIDTH, halfHeight + tear));
  }
  for (let step = 1; step <= edgeSteps; step += 1) {
    const t = step / edgeSteps;
    const notch = step === 6 + (mode % 7) ? -damage * (1.5 + role * 0.5) : 0;
    const tear = (random(50 + step * 3.1) - 0.5) * damage + notch;
    points.push(new THREE.Vector2(halfWidth + tear, halfHeight - t * DRAWING_HEIGHT));
  }
  for (let step = 1; step <= edgeSteps; step += 1) {
    const t = step / edgeSteps;
    const notch = step === 4 + ((mode + role) % 9) ? damage * 1.8 : 0;
    const tear = (random(100 + step * 4.3) - 0.5) * damage + notch;
    points.push(new THREE.Vector2(halfWidth - t * DRAWING_WIDTH, -halfHeight + tear));
  }
  for (let step = 1; step < edgeSteps; step += 1) {
    const t = step / edgeSteps;
    const notch = step === 10 - (mode % 5) ? damage * 1.6 : 0;
    const tear = (random(160 + step * 5.7) - 0.5) * damage + notch;
    points.push(new THREE.Vector2(-halfWidth + tear, -halfHeight + t * DRAWING_HEIGHT));
  }
  const shape = new THREE.Shape(points);
  const geometry = new THREE.ShapeGeometry(shape, 12);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  for (let vertex = 0; vertex < position.count; vertex += 1) {
    const x = position.getX(vertex);
    const y = position.getY(vertex);
    const edgeCurl = Math.max(0, Math.abs(x) - halfWidth * 0.82) * (0.035 + mode * 0.003);
    position.setZ(vertex, Math.sin(x * (1.6 + mode * 0.12) + y * 0.84 + role) * 0.007 + edgeCurl);
    uv.setXY(vertex, x / DRAWING_WIDTH + 0.5, y / DRAWING_HEIGHT + 0.5);
  }
  position.needsUpdate = true;
  uv.needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.userData.basePositions = Float32Array.from(position.array);
  geometry.userData.mode = mode;
  geometry.userData.role = role;
  return geometry;
}

const PAPER_GEOMETRIES = PAPER_COLORS.map((_, mode) => [makeTornPaperGeometry(mode, 0), makeTornPaperGeometry(mode, 1)]);

function makePaperEdgeGeometry(surfaceGeometry) {
  const edgeGeometry = new THREE.EdgesGeometry(surfaceGeometry, 25);
  const surfacePosition = surfaceGeometry.attributes.position;
  const edgePosition = edgeGeometry.attributes.position;
  const surfaceVertexMap = [];
  for (let edgeVertex = 0; edgeVertex < edgePosition.count; edgeVertex += 1) {
    let closestVertex = 0;
    let closestDistance = Infinity;
    const edgeX = edgePosition.getX(edgeVertex);
    const edgeY = edgePosition.getY(edgeVertex);
    const edgeZ = edgePosition.getZ(edgeVertex);
    for (let surfaceVertex = 0; surfaceVertex < surfacePosition.count; surfaceVertex += 1) {
      const dx = edgeX - surfacePosition.getX(surfaceVertex);
      const dy = edgeY - surfacePosition.getY(surfaceVertex);
      const dz = edgeZ - surfacePosition.getZ(surfaceVertex);
      const distance = dx * dx + dy * dy + dz * dz;
      if (distance < closestDistance) {
        closestDistance = distance;
        closestVertex = surfaceVertex;
      }
    }
    surfaceVertexMap.push(closestVertex);
  }
  edgeGeometry.userData.surfaceVertexMap = surfaceVertexMap;
  return edgeGeometry;
}

const PAPER_EDGE_GEOMETRIES = PAPER_GEOMETRIES.map((pair) => pair.map(makePaperEdgeGeometry));

const drawingSurfaceGroup = new THREE.Group();
const paperMaterials = [];
const paperSheets = [];
const paperEdges = [];
const paperGridMaterials = [];
[-1, 1].forEach((side, index) => {
  const paperTexture = clayTexture.clone();
  paperTexture.repeat.set(18, 12);
  paperTexture.needsUpdate = true;
  const paperMaterial = physicalMaterial({
    color: PAPER_COLORS[0][index],
    roughness: 0.9,
    metalness: 0,
    clearcoat: 0.05,
    clearcoatRoughness: 0.82,
    side: THREE.DoubleSide,
  }, paperTexture, 0.022);
  paperMaterials.push(paperMaterial);
  paperMaterial.map = PAPER_ARTWORKS[0][index];
  const sheet = new THREE.Mesh(PAPER_GEOMETRIES[0][index], paperMaterial);
  sheet.position.set(side * DRAWING_CENTER_X, -0.1, -0.58);
  sheet.rotation.z = side * 0.006;
  sheet.receiveShadow = true;
  sheet.renderOrder = -2;
  const edge = new THREE.LineSegments(
    PAPER_EDGE_GEOMETRIES[0][index],
    new THREE.LineBasicMaterial({ color: index ? 0x6f7ca6 : 0x625f59, transparent: true, opacity: 0.42 }),
  );
  edge.position.z = 0.004;
  sheet.add(edge);
  drawingSurfaceGroup.add(sheet);
  paperSheets.push(sheet);
  paperEdges.push(edge);

  const gridPoints = [];
  for (let row = 0; row < 13; row += 1) {
    for (let column = 0; column < 13; column += 1) {
      gridPoints.push(new THREE.Vector3(side * DRAWING_CENTER_X + (column - 6) * 0.35, -1.98 + row * 0.32, -0.53));
    }
  }
  const gridMaterial = new THREE.PointsMaterial({
    color: index ? AI_COLORS[0] : DRAW_COLORS[0],
    size: 0.028,
    transparent: true,
    opacity: 0.24,
    sizeAttenuation: true,
    depthWrite: false,
  });
  const grid = new THREE.Points(new THREE.BufferGeometry().setFromPoints(gridPoints), gridMaterial);
  paperGridMaterials.push(gridMaterial);
  drawingSurfaceGroup.add(grid);
});
scene.add(drawingSurfaceGroup);

function setPaperStage(index) {
  paperMaterials.forEach((material, materialIndex) => {
    material.color.setHex(PAPER_COLORS[index][materialIndex]);
    material.map = PAPER_ARTWORKS[index][materialIndex];
    material.needsUpdate = true;
  });
  paperGridMaterials[0].color.setHex(DRAW_COLORS[index]);
  paperGridMaterials[1].color.setHex(AI_COLORS[index]);
  paperSheets.forEach((sheet, sheetIndex) => {
    sheet.geometry = PAPER_GEOMETRIES[index][sheetIndex];
    paperEdges[sheetIndex].geometry = PAPER_EDGE_GEOMETRIES[index][sheetIndex];
  });
}

function setPrompt(text) {
  const nextText = String(text);
  if (promptText.dataset.prompt === nextText) return;
  window.clearTimeout(promptTimer);
  const sequence = ++promptSequence;
  promptText.dataset.prompt = nextText;
  promptText.classList.remove('is-typing');
  if (reducedMotion) {
    promptText.textContent = nextText;
    return;
  }
  promptText.textContent = '';
  void promptText.offsetWidth;
  promptText.classList.add('is-typing');
  let character = 0;
  const typeNext = () => {
    if (sequence !== promptSequence) return;
    character += 1;
    promptText.textContent = nextText.slice(0, character);
    if (character < nextText.length) {
      const punctuationPause = /[.,:]/.test(nextText[character - 1]) ? 95 : 0;
      promptTimer = window.setTimeout(typeNext, 18 + punctuationPause + (character % 4) * 4);
    } else {
      promptText.classList.remove('is-typing');
    }
  };
  typeNext();
}

function syncTimerUi(data = stageData[stageIndex]) {
  const remaining = clamp(data?.timerRemaining ?? DRAW_TIME_LIMIT, 0, DRAW_TIME_LIMIT);
  timerValue.textContent = remaining.toFixed(1);
  timerFill.style.transform = `scaleX(${remaining / DRAW_TIME_LIMIT})`;
  timerElement.classList.toggle('is-running', data?.timerStartedAt !== null && !data?.timeExpired && data?.phase === 'draw');
  timerElement.classList.toggle('is-expired', Boolean(data?.timeExpired));
}

function updateDrawingTimer(now) {
  const data = stageData[stageIndex];
  if (!data) return;
  if (data.phase === 'draw' && data.timerStartedAt !== null && !data.timeExpired) {
    data.timerRemaining = Math.max(0, DRAW_TIME_LIMIT - (now - data.timerStartedAt) / 1000);
    if (data.timerRemaining <= 0) {
      data.timeExpired = true;
      if (pointerDown) finishStroke();
      generateButton.classList.toggle('is-visible', data.totalPoints >= 4);
      clearButton.classList.toggle('is-visible', data.totalPoints > 0);
      setPrompt('TIME. TRANSFORM');
    }
  }
  syncTimerUi(data);
}

function pointerToWorld(event) {
  pointerNdc.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointerNdc.y = -(event.clientY / window.innerHeight) * 2 + 1;
  const projected = new THREE.Vector3(pointerNdc.x, pointerNdc.y, 0.2).unproject(camera);
  const direction = projected.sub(camera.position).normalize();
  const distance = -camera.position.z / direction.z;
  previousPointerWorld.copy(pointerWorld);
  pointerWorld.copy(camera.position).add(direction.multiplyScalar(distance));
  if (window.innerWidth <= 760 && stageData[stageIndex]?.phase === 'draw') {
    pointerWorld.x /= 0.35;
    pointerWorld.y /= 1.35;
  }
  cursorLabel.style.left = `${event.clientX}px`;
  cursorLabel.style.top = `${event.clientY}px`;
  const cursorDeltaX = event.clientX - cursorScreenX;
  const cursorDeltaY = event.clientY - cursorScreenY;
  if (Math.hypot(cursorDeltaX, cursorDeltaY) > 1) {
    const targetAngle = clamp(-24 + cursorDeltaX * 0.72 + cursorDeltaY * 0.12, -46, -8);
    cursorAngle += (targetAngle - cursorAngle) * 0.24;
    cursorLabel.style.setProperty('--tool-angle', `${cursorAngle.toFixed(2)}deg`);
  }
  cursorScreenX = event.clientX;
  cursorScreenY = event.clientY;
  experience.classList.toggle('is-over-control', Boolean(event.target.closest?.('button, a')));
  latestPointerSample = {
    time: performance.now(),
    pressure: Number.isFinite(event.pressure) ? event.pressure : 0,
    pointerType: event.pointerType || 'mouse',
  };
}

function disposeGroup(group) {
  group.traverse((object) => {
    object.geometry?.dispose?.();
    if (Array.isArray(object.material)) {
      object.material.forEach((material) => {
        if (material.map?.userData?.ephemeral) material.map.dispose();
        material.dispose?.();
      });
    } else {
      if (object.material?.map?.userData?.ephemeral) object.material.map.dispose();
      object.material?.dispose?.();
    }
  });
  group.clear();
}

function makeCirclePoints(radius, count, wobble = 0) {
  const points = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (i / count) * Math.PI * 2;
    const r = radius + Math.sin(angle * 3.2) * wobble + Math.sin(angle * 7.7) * wobble * 0.4;
    points.push(new THREE.Vector3(Math.cos(angle) * r, Math.sin(angle) * r, Math.sin(angle * 2) * 0.04));
  }
  return points;
}

function lineFromPoints(points, color, opacity = 1) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  const material = new THREE.LineBasicMaterial({ color, transparent: opacity < 1, opacity });
  return new THREE.Line(geometry, material);
}

function makeBrushNibTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const context = canvas.getContext('2d');
  const gradient = context.createRadialGradient(32, 32, 1, 32, 32, 30);
  gradient.addColorStop(0, 'rgba(255,255,255,0.96)');
  gradient.addColorStop(0.62, 'rgba(255,255,255,0.78)');
  gradient.addColorStop(1, 'rgba(255,255,255,0)');
  context.fillStyle = gradient;
  context.fillRect(0, 0, 64, 64);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;
  return texture;
}

const brushNibTexture = makeBrushNibTexture();

function createDynamicPrimitive(layer) {
  const positions = new Float32Array(MAX_POINTS_PER_STROKE * 3);
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  const material = layer.kind === 'points'
    ? new THREE.PointsMaterial({
      color: layer.color,
      transparent: true,
      opacity: layer.opacity,
      size: layer.size,
      sizeAttenuation: true,
      map: brushNibTexture,
      alphaTest: 0.025,
      depthWrite: false,
    })
    : new THREE.LineBasicMaterial({ color: layer.color, transparent: layer.opacity < 1, opacity: layer.opacity });
  const primitive = layer.kind === 'points' ? new THREE.Points(geometry, material) : new THREE.Line(geometry, material);
  primitive.userData.positions = positions;
  primitive.userData.count = 0;
  primitive.userData.layer = layer;
  primitive.frustumCulled = false;
  return primitive;
}

function createDynamicStroke(index) {
  const style = TOOL_STYLES[index];
  const stroke = new THREE.Group();
  stroke.userData.style = style;
  stroke.userData.count = 0;
  stroke.userData.lastPoint = null;
  style.layers.forEach((layer) => stroke.add(createDynamicPrimitive(layer)));
  return stroke;
}

function pushDynamicPoint(stroke, point) {
  const sourceCount = stroke.userData.count;
  if (sourceCount >= MAX_POINTS_PER_STROKE) return;
  const style = stroke.userData.style;
  const previous = stroke.userData.lastPoint;
  const dx = previous ? point.x - previous.x : 1;
  const dy = previous ? point.y - previous.y : 0;
  const length = Math.max(0.0001, Math.hypot(dx, dy));
  const normalX = -dy / length;
  const normalY = dx / length;

  stroke.children.forEach((primitive, layerIndex) => {
    const layer = primitive.userData.layer;
    if (layer.every && sourceCount % layer.every !== 0) return;
    const count = primitive.userData.count;
    if (count >= MAX_POINTS_PER_STROKE) return;
    const noiseX = Math.sin(sourceCount * 2.173 + layerIndex * 7.13) * (layer.jitter || 0);
    const noiseY = Math.cos(sourceCount * 1.713 + layerIndex * 5.47) * (layer.jitter || 0);
    let x = point.x + normalX * (layer.offset || 0) + noiseX;
    let y = point.y + normalY * (layer.offset || 0) + noiseY;
    if (style.snap) {
      x = Math.round(x / style.snap) * style.snap;
      y = Math.round(y / style.snap) * style.snap;
    }
    const i = count * 3;
    primitive.userData.positions[i] = x;
    primitive.userData.positions[i + 1] = y;
    primitive.userData.positions[i + 2] = point.z + layerIndex * 0.0015;
    primitive.userData.count += 1;
    primitive.geometry.attributes.position.needsUpdate = true;
    primitive.geometry.setDrawRange(0, primitive.userData.count);
  });
  stroke.userData.count += 1;
  stroke.userData.lastPoint = point.clone();
}

function normalizeStrokeSet(sourceStrokes) {
  const strokes = sourceStrokes.filter((stroke) => stroke.length > 3);
  const all = strokes.flat();
  if (!all.length) return [];
  const box = new THREE.Box3().setFromPoints(all);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  const span = Math.max(size.x, size.y, 0.4);
  const scale = clamp(3.65 / span, 0.72, 1.7);
  return strokes.map((stroke) => stroke.map((point) => point.clone().sub(center).multiplyScalar(scale)));
}

function normalizedStrokes(index = stageIndex) {
  return normalizeStrokeSet(stageData[index].strokes);
}

function makeCurve(points, closed = false) {
  const usable = points.length === 4 ? [...points, points[3].clone()] : points;
  return new THREE.CatmullRomCurve3(usable, closed, 'centripetal');
}

function makeTube(points, radius, closed, material) {
  const curve = makeCurve(points, closed);
  const geometry = new THREE.TubeGeometry(curve, Math.min(420, Math.max(48, points.length * 2)), radius, 10, closed);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  return mesh;
}

function setObjectShadows(object) {
  object.traverse((child) => {
    if (child.isMesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
  return object;
}

// Quiet guides establish each interpretation before the user draws.
const humanGuide = new THREE.Group();
stageGroups[0].add(humanGuide);
for (let i = 0; i < 16; i += 1) {
  const circle = lineFromPoints(makeCirclePoints(1.35 + i * 0.055, 140, 0.015 + i * 0.0015), 0xf04f3d, 0.14 + i * 0.016);
  circle.rotation.z = i * 0.012;
  humanGuide.add(circle);
}
const humanField = new THREE.Mesh(
  new THREE.CircleGeometry(1.08, 96),
  new THREE.MeshBasicMaterial({ color: 0xf04f3d, transparent: true, opacity: 0.055, side: THREE.DoubleSide }),
);
humanField.position.z = -0.2;
stageGroups[0].add(humanField);

const machineGridWidth = 31;
const machineGridHeight = 19;
const machineGridPositions = new Float32Array(machineGridWidth * machineGridHeight * 3);
const machineGridBase = new Float32Array(machineGridPositions.length);
for (let y = 0; y < machineGridHeight; y += 1) {
  for (let x = 0; x < machineGridWidth; x += 1) {
    const i = (y * machineGridWidth + x) * 3;
    machineGridBase[i] = (x - (machineGridWidth - 1) / 2) * 0.21;
    machineGridBase[i + 1] = (y - (machineGridHeight - 1) / 2) * 0.21;
    machineGridPositions[i] = machineGridBase[i];
    machineGridPositions[i + 1] = machineGridBase[i + 1];
  }
}
const machineGridGeometry = new THREE.BufferGeometry();
machineGridGeometry.setAttribute('position', new THREE.BufferAttribute(machineGridPositions, 3));
const machineGrid = new THREE.Points(
  machineGridGeometry,
  new THREE.PointsMaterial({ color: 0xd8ff45, size: 0.025, transparent: true, opacity: 0.56, sizeAttenuation: true }),
);
stageGroups[1].add(machineGrid);
const machineGhosts = new THREE.Group();
stageGroups[1].add(machineGhosts);

const sporePositions = [];
for (let i = 0; i < 220; i += 1) {
  const angle = i * 2.39996;
  const radius = Math.sqrt(i / 220) * 2.35;
  sporePositions.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72 - 0.2, -0.5));
}
const natureSpores = new THREE.Points(
  new THREE.BufferGeometry().setFromPoints(sporePositions),
  new THREE.PointsMaterial({ color: 0xf1bf3b, size: 0.025, transparent: true, opacity: 0.24, sizeAttenuation: true }),
);
stageGroups[2].add(natureSpores);

const memoryGuide = new THREE.Group();
stageGroups[3].add(memoryGuide);
for (let i = 0; i < 14; i += 1) {
  const wave = [];
  for (let p = 0; p < 150; p += 1) {
    const x = (p / 149 - 0.5) * 5.1;
    const y = Math.sin(x * 1.7 + i * 0.42) * (0.12 + i * 0.014) + (i - 6.5) * 0.09;
    wave.push(new THREE.Vector3(x, y, -0.5));
  }
  memoryGuide.add(lineFromPoints(wave, 0x281722, 0.055 + i * 0.006));
}

const mirrorGuide = new THREE.Group();
for (let i = 0; i < 11; i += 1) {
  const loop = lineFromPoints(makeCirclePoints(0.58 + i * 0.065, 120, 0.026), 0xdbe2f3, 0.09 + i * 0.018);
  loop.scale.x = i % 2 ? -1 : 1;
  loop.rotation.z = i * 0.09;
  mirrorGuide.add(loop);
}
stageGroups[4].add(mirrorGuide);

const shadowGuide = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.15, 0.34, 180, 18, 2, 3),
  new THREE.MeshBasicMaterial({ color: 0x57545c, wireframe: true, transparent: true, opacity: 0.17 }),
);
shadowGuide.scale.set(1.32, 0.8, 0.55);
stageGroups[5].add(shadowGuide);

const echoGuide = new THREE.Group();
for (let ring = 0; ring < 12; ring += 1) {
  const wave = [];
  for (let p = 0; p < 180; p += 1) {
    const angle = (p / 179) * Math.PI * 2;
    const radius = 0.65 + ring * 0.1 + Math.sin(angle * 8 + ring) * 0.025;
    wave.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, -0.25));
  }
  echoGuide.add(lineFromPoints(wave, ring % 3 ? 0x5c5186 : 0x9b82ff, 0.08 + ring * 0.012));
}
stageGroups[6].add(echoGuide);

const swarmGuidePositions = [];
for (let i = 0; i < 520; i += 1) {
  const angle = i * 2.39996;
  const radius = 0.3 + seeded(i * 0.31) * 2.35;
  swarmGuidePositions.push(new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius * 0.72, (seeded(i) - 0.5) * 0.8));
}
const swarmGuide = new THREE.Points(
  new THREE.BufferGeometry().setFromPoints(swarmGuidePositions),
  new THREE.PointsMaterial({ color: 0xa6ff7d, size: 0.025, transparent: true, opacity: 0.34 }),
);
stageGroups[7].add(swarmGuide);

const relicGuide = new THREE.Mesh(
  new THREE.TorusKnotGeometry(1.12, 0.31, 210, 24, 3, 5),
  new THREE.MeshBasicMaterial({ color: 0xb98549, wireframe: true, transparent: true, opacity: 0.2 }),
);
relicGuide.rotation.x = 0.55;
stageGroups[8].add(relicGuide);

const dreamGuide = new THREE.Group();
for (let i = 0; i < 18; i += 1) {
  const loop = lineFromPoints(makeCirclePoints(0.55 + i * 0.07, 120, 0.05), i % 3 ? 0xc3cbff : 0xffa9de, 0.055 + i * 0.007);
  loop.rotation.set(i * 0.07, i * 0.11, i * 0.13);
  dreamGuide.add(loop);
}
stageGroups[9].add(dreamGuide);

const guideObjects = [
  [humanGuide, humanField],
  [machineGrid],
  [natureSpores],
  [memoryGuide],
  [mirrorGuide],
  [shadowGuide],
  [echoGuide],
  [swarmGuide],
  [relicGuide],
  [dreamGuide],
];

function setGuideVisible(index) {
  guideObjects[index]?.forEach((object) => { object.visible = false; });
  if (index === 1) machineGhosts.visible = false;
}

function resampleStroke(stroke, count = 48) {
  if (!stroke?.length) return [];
  const result = [];
  for (let i = 0; i < count; i += 1) {
    const index = Math.round((i / Math.max(1, count - 1)) * (stroke.length - 1));
    result.push(stroke[index]);
  }
  return result;
}

function recallSimilarity(index) {
  const source = normalizeStrokeSet(stageData[0].strokes);
  const attempt = normalizeStrokeSet(stageData[index].strokes);
  if (!source.length || !attempt.length) return 0;
  const a = resampleStroke(source.flat(), 64);
  const b = resampleStroke(attempt.flat(), 64);
  const direct = a.reduce((sum, point, index) => sum + point.distanceTo(b[index]), 0) / a.length;
  const reverse = a.reduce((sum, point, index) => sum + point.distanceTo(b[b.length - 1 - index]), 0) / a.length;
  return clamp(1 - Math.min(direct, reverse) / 2.5);
}

function calculatePresence(index) {
  const samples = [...stageData[0].samples, ...stageData[index].samples];
  if (samples.length < 8) return 0.5;
  const intervals = [];
  const turns = [];
  for (let i = 1; i < samples.length; i += 1) intervals.push(clamp(samples[i].time - samples[i - 1].time, 0, 120));
  for (let i = 2; i < samples.length; i += 1) {
    const a = new THREE.Vector2(samples[i - 1].x - samples[i - 2].x, samples[i - 1].y - samples[i - 2].y);
    const b = new THREE.Vector2(samples[i].x - samples[i - 1].x, samples[i].y - samples[i - 1].y);
    if (a.lengthSq() && b.lengthSq()) turns.push(Math.abs(a.angle() - b.angle()));
  }
  const mean = intervals.reduce((sum, value) => sum + value, 0) / intervals.length;
  const variance = intervals.reduce((sum, value) => sum + (value - mean) ** 2, 0) / intervals.length;
  const timingVariation = clamp(Math.sqrt(variance) / Math.max(mean, 1) / 1.8);
  const correctionSignal = clamp((turns.filter((angle) => angle > 0.18).length / Math.max(1, turns.length)) * 2.4);
  const strokeSignal = clamp((stageData[0].strokes.length + stageData[index].strokes.length) / 4);
  const recallSignal = recallSimilarity(index);
  return clamp(0.38 + timingVariation * 0.2 + correctionSignal * 0.2 + strokeSignal * 0.08 + recallSignal * 0.14, 0.4, 0.97);
}

function activeStrokeState(data = stageData[stageIndex]) {
  return {
    recalling: false,
    strokes: data.strokes,
    samples: data.samples,
    totalKey: 'totalPoints',
  };
}

function resetCamera() {
  const narrow = window.innerWidth <= 760;
  controls.enabled = false;
  controls.autoRotate = true;
  controls.target.set(0, 0, 0);
  stageGroups[stageIndex]?.scale.set(narrow ? 0.35 : 1, narrow ? 1.35 : 1, 1);
  drawingSurfaceGroup.scale.set(narrow ? 0.35 : 1, narrow ? 1.35 : 1, 1);
  camera.position.set(0, 0, narrow ? 9.5 : 8);
  camera.lookAt(0, 0, 0);
}

function enableInspection() {
  const narrow = window.innerWidth <= 760;
  controls.target.set(0, 0, 0);
  stageGroups[stageIndex]?.scale.set(narrow ? 0.62 : 1, narrow ? 1.15 : 1, 1);
  drawingSurfaceGroup.scale.set(1, 1, 1);
  camera.position.set(0, 0, narrow ? 9.5 : stageIndex === 4 ? 5.9 : 5.3);
  controls.enabled = true;
  controls.autoRotate = !reducedMotion;
  controls.update();
}

function aiPointFor(point, previous, count) {
  const rightCenter = new THREE.Vector3(DRAWING_CENTER_X, 0, 0);
  const leftCenter = new THREE.Vector3(-DRAWING_CENTER_X, 0, 0);
  const base = point.clone();
  base.x += DRAWING_CENTER_X * 2;
  if (stageIndex === 0) {
    const radial = point.clone().sub(leftCenter);
    const radius = THREE.MathUtils.lerp(radial.length(), 1.18, 0.62);
    return rightCenter.clone().add(radial.normalize().multiplyScalar(radius)).setZ(Math.sin(count * 0.08) * 0.04);
  }
  if (stageIndex === 1 && previous) {
    const velocity = point.clone().sub(previous);
    return base.add(velocity.multiplyScalar(6)).setZ(Math.sin(count * 0.22) * 0.1);
  }
  if (stageIndex === 2) return base.add(new THREE.Vector3(Math.sin(count * 0.11) * 0.08, Math.sin(count * 0.19) * 0.1, Math.cos(count * 0.13) * 0.18));
  if (stageIndex === 3) return base.setY(Math.round(base.y * 5) / 5 + Math.sin(count * 0.45) * 0.05).setZ(Math.sin(count * 0.28) * 0.16);
  if (stageIndex === 4) return base.setY(-base.y).setZ(Math.sin(count * 0.12) * 0.12);
  if (stageIndex === 5 && previous) return base.lerp(previous.clone().setX(previous.x + DRAWING_CENTER_X * 2), 0.22).setZ(-0.2 - count * 0.002);
  if (stageIndex === 6) return base.setY(Math.round(base.y * 7) / 7).setZ(Math.sin(count * 0.38) * 0.24);
  if (stageIndex === 7) return base.add(new THREE.Vector3((seeded(count * 0.77) - 0.5) * 0.16, (seeded(count * 1.31) - 0.5) * 0.16, (seeded(count * 2.11) - 0.5) * 0.5));
  if (stageIndex === 8 && previous) return base.lerp(previous.clone().setX(previous.x + DRAWING_CENTER_X * 2), 0.32).setZ(Math.sin(count * 0.09) * 0.18);
  if (stageIndex === 9 && stageData[0].totalPoints) {
    const source = stageData[0].strokes.flat();
    const sourceIndex = Math.min(source.length - 1, Math.floor(clamp(count / Math.max(1, source.length)) * source.length));
    return source[sourceIndex].clone().add(new THREE.Vector3(DRAWING_CENTER_X * 2, 0, Math.sin(count * 0.12) * 0.08));
  }
  return base;
}

function aiStroke(count, sampler) {
  return Array.from({ length: count }, (_, index) => {
    const t = count <= 1 ? 0 : index / (count - 1);
    const [x, y, z = 0.035] = sampler(t, index);
    return new THREE.Vector3(DRAWING_CENTER_X + x, y - 0.08, z);
  });
}

function generatePromptDrawing(index) {
  const strokes = [];
  const wobble = (value, amount = 0.025) => Math.sin(value * 17.3 + index * 2.1) * amount + Math.sin(value * 41.7) * amount * 0.38;
  if (index === 0) {
    strokes.push(aiStroke(180, (t) => {
      const angle = t * Math.PI * 2;
      const fatigue = Math.max(0, -Math.sin(angle)) * 0.22;
      return [Math.cos(angle) * (1.02 + wobble(t, 0.018)), Math.sin(angle) * 0.92 - fatigue + Math.cos(angle * 2) * 0.035];
    }));
    strokes.push(aiStroke(34, (t) => [-0.48 + t * 0.34, 0.12 - Math.sin(t * Math.PI) * 0.06]));
    strokes.push(aiStroke(34, (t) => [0.16 + t * 0.34, 0.1 - Math.sin(t * Math.PI) * 0.06]));
    strokes.push(aiStroke(46, (t) => [-0.3 + t * 0.6, -0.42 - Math.sin(t * Math.PI) * 0.11]));
  } else if (index === 1) {
    strokes.push(aiStroke(260, (t) => {
      const angle = t * Math.PI * 9.5;
      const radius = 0.18 + t * 1.05 + Math.sin(t * 31) * 0.1;
      return [Math.cos(angle) * radius * 0.9 + Math.sin(t * 47) * 0.12, Math.sin(angle) * radius * 0.66 + Math.sin(t * 13) * 0.13, Math.sin(angle * 0.7) * 0.12];
    }));
    for (let branch = 0; branch < 6; branch += 1) {
      strokes.push(aiStroke(42, (t) => {
        const angle = branch * 1.17 + t * (branch % 2 ? -0.8 : 1.2);
        const originRadius = 0.38 + branch * 0.1;
        return [Math.cos(branch * 1.17) * originRadius + Math.cos(angle) * t * 0.65, Math.sin(branch * 1.17) * originRadius * 0.68 + Math.sin(angle) * t * 0.52];
      }));
    }
  } else if (index === 2) {
    strokes.push(aiStroke(110, (t) => [Math.sin(t * 8) * 0.08, -1.65 + t * 3.15, Math.sin(t * 11) * 0.05]));
    for (let branch = 0; branch < 11; branch += 1) {
      const originY = -1.05 + branch * 0.24;
      const side = branch % 2 ? 1 : -1;
      strokes.push(aiStroke(58, (t) => [side * t * (0.48 + branch * 0.045) + Math.sin(t * 7 + branch) * 0.055, originY + t * (0.36 + branch * 0.025), Math.sin(t * 5 + branch) * 0.09]));
    }
  } else if (index === 3) {
    for (let rain = 0; rain < 13; rain += 1) {
      const x = -1.22 + rain * 0.205;
      strokes.push(aiStroke(46, (t) => [x + Math.sin(t * 9 + rain) * 0.03, 1.72 - t * (1.65 + (rain % 4) * 0.22), Math.sin(t * 7 + rain) * 0.04]));
    }
    for (let ripple = 0; ripple < 4; ripple += 1) {
      strokes.push(aiStroke(100, (t) => {
        const angle = t * Math.PI * 2;
        return [Math.cos(angle) * (0.36 + ripple * 0.22), -1.28 + Math.sin(angle) * (0.09 + ripple * 0.045)];
      }));
    }
  } else if (index === 4) {
    strokes.push(aiStroke(190, (t) => {
      const angle = t * Math.PI * 2;
      const radiusX = 0.9 + Math.sin(angle * 3) * 0.2 + (Math.cos(angle) > 0 ? 0.2 : -0.06);
      const radiusY = 1.12 + Math.cos(angle * 2.4) * 0.13;
      return [Math.cos(angle) * radiusX, Math.sin(angle) * radiusY + Math.cos(angle * 1.5) * 0.1];
    }));
    strokes.push(aiStroke(58, (t) => [-0.62 + t * 0.44, 0.27 + Math.sin(t * Math.PI) * 0.09]));
    strokes.push(aiStroke(28, (t) => [0.28 + t * 0.17, 0.12 + Math.sin(t * Math.PI) * 0.03]));
    strokes.push(aiStroke(65, (t) => [-0.3 + t * 0.84, -0.48 + Math.sin(t * Math.PI) * 0.22]));
  } else if (index === 5) {
    strokes.push(aiStroke(76, (t) => {
      const angle = -0.15 + t * Math.PI * 1.42;
      return [Math.cos(angle) * 1.0, Math.sin(angle) * 1.1];
    }));
    strokes.push(aiStroke(70, (t) => {
      const angle = Math.PI * 1.72 + t * Math.PI * 1.18;
      return [Math.cos(angle) * 1.0, Math.sin(angle) * 1.1];
    }));
    strokes.push(aiStroke(62, (t) => [-0.42 + t * 0.84, -0.08 + Math.sin(t * Math.PI * 2) * 0.06]));
  } else if (index === 6) {
    strokes.push(aiStroke(220, (t) => {
      const x = -1.3 + t * 2.6;
      const envelope = 0.2 + Math.sin(t * Math.PI) * 0.75;
      const y = Math.sin(t * 26) * envelope * (0.35 + Math.sin(t * 7) * 0.12);
      return [x, y, Math.cos(t * 22) * 0.08];
    }));
    for (let beat = 0; beat < 7; beat += 1) {
      const x = -1.14 + beat * 0.38;
      strokes.push(aiStroke(26, (t) => [x, -1.25 + t * (0.35 + (beat % 3) * 0.14)]));
    }
  } else if (index === 7) {
    strokes.push(aiStroke(190, (t) => {
      const x = -1.28 + t * 2.56;
      const y = Math.sin(t * 9.2) * 0.72 + Math.sin(t * 27) * 0.16;
      return [x, y, Math.sin(t * 16) * 0.1];
    }));
    for (let obstacle = 0; obstacle < 18; obstacle += 1) {
      const x = -1.18 + seeded(obstacle * 2.2 + challengeSeed) * 2.36;
      const y = -1.48 + seeded(obstacle * 4.7 + challengeSeed) * 2.96;
      strokes.push(aiStroke(12, (t) => [x - 0.07 + t * 0.14, y - 0.07 + t * 0.14]));
      strokes.push(aiStroke(12, (t) => [x - 0.07 + t * 0.14, y + 0.07 - t * 0.14]));
    }
  } else if (index === 8) {
    strokes.push(aiStroke(90, (t) => [-0.82 + t * 0.32, 1.28 - t * 0.62]));
    strokes.push(aiStroke(150, (t) => {
      const angle = Math.PI * (0.05 + t * 0.9);
      return [-0.48 + Math.cos(angle) * 0.78, 0.24 - Math.sin(angle) * 1.32];
    }));
    strokes.push(aiStroke(150, (t) => {
      const angle = Math.PI * (1.05 + t * 0.9);
      return [0.48 + Math.cos(angle) * 0.78, 0.24 - Math.sin(angle) * 1.32];
    }));
    strokes.push(aiStroke(90, (t) => [0.5 + t * 0.32, 0.66 + t * 0.62]));
    strokes.push(aiStroke(65, (t) => [-0.82 + t * 1.64, 1.28 + Math.sin(t * Math.PI) * 0.12]));
    for (let glyph = 0; glyph < 4; glyph += 1) {
      strokes.push(aiStroke(36, (t) => [-0.42 + glyph * 0.28 + Math.sin(t * Math.PI * 2) * 0.1, 0.48 - glyph * 0.29 + t * 0.18]));
    }
  } else if (stageData[0].aiStrokes.length) {
    return stageData[0].aiStrokes.map((stroke) => stroke.map((point) => point.clone()));
  } else {
    return generatePromptDrawing(0);
  }
  return strokes;
}

function prepareAiDrawing(data) {
  disposeGroup(aiDrawingGroups[stageIndex]);
  data.aiStrokes = generatePromptDrawing(stageIndex);
  data.aiProgress = 0;
  data.aiFinishedAt = null;
  data.aiRevealLines = [];
  let pointOffset = 0;
  data.aiStrokes.forEach((points, strokeIndex) => {
    const line = lineFromPoints(points, AI_COLORS[stageIndex], 0.94);
    line.geometry.setDrawRange(0, 0);
    line.userData.pointOffset = pointOffset;
    line.userData.totalPoints = points.length;
    line.position.z = strokeIndex * 0.0008;
    aiDrawingGroups[stageIndex].add(line);
    data.aiRevealLines.push(line);
    pointOffset += points.length;
  });
  data.aiPointTotal = pointOffset;
}

function beginStroke() {
  if (stageIndex >= STAGES.length) return;
  const data = stageData[stageIndex];
  if (data.phase !== 'draw') return;
  if (data.timeExpired) {
    setPrompt('TIME. TRANSFORM');
    return;
  }
  if (stageIndex === 9 && !stageData[0].totalPoints) {
    setPrompt('COMPLETE 01 FIRST');
    return;
  }
  const active = activeStrokeState(data);
  if (active.strokes.length >= MAX_STROKES) {
    setPrompt('TRANSFORM');
    return;
  }
  currentStroke = [];
  active.strokes.push(currentStroke);
  currentLiveLine = createDynamicStroke(stageIndex);
  drawingGroups[stageIndex].add(currentLiveLine);
  if (data.timerStartedAt === null) data.timerStartedAt = performance.now();
  setGuideVisible(stageIndex, false);
  pointerDown = true;
  startPencilSound();
  experience.classList.add('is-active');
  setPrompt(STAGES[stageIndex].prompt);
  addDrawPoint();
}

function addDrawPoint() {
  if (!pointerDown || !currentStroke || !currentLiveLine) return;
  const point = pointerWorld.clone();
  point.x = clamp(point.x, -4.42, -0.18);
  point.y = clamp(point.y, -2.14, 1.94);
  const data = stageData[stageIndex];
  const active = activeStrokeState(data);
  point.z = Math.sin((data[active.totalKey] + currentStroke.length) * 0.23) * 0.018;
  const previous = currentStroke.at(-1);
  if (previous && previous.distanceTo(point) < 0.024) return;
  if (currentStroke.length >= MAX_POINTS_PER_STROKE) {
    finishStroke();
    return;
  }
  currentStroke.push(point);
  data[active.totalKey] += 1;
  active.samples.push({
    x: point.x,
    y: point.y,
    time: latestPointerSample.time,
    pressure: latestPointerSample.pressure,
    pointerType: latestPointerSample.pointerType,
  });
  pushDynamicPoint(currentLiveLine, point);
  updatePencilSound(previous ? previous.distanceTo(point) : 0.02, latestPointerSample);

  if (data[active.totalKey] >= MIN_POINTS_TO_TRANSFORM) {
    generateButton.classList.add('is-visible');
    clearButton.classList.add('is-visible');
  }
}

function finishStroke() {
  if (!currentStroke) {
    stopPencilSound();
    return;
  }
  pointerDown = false;
  stopPencilSound();
  experience.classList.remove('is-active');
  const data = stageData[stageIndex];
  const active = activeStrokeState(data);
  if (currentStroke.length < 3) {
    data[active.totalKey] -= currentStroke.length;
    active.strokes.pop();
    currentLiveLine?.removeFromParent();
    if (currentLiveLine) disposeGroup(currentLiveLine);
  }
  currentStroke = null;
  currentLiveLine = null;
  currentMachineGhost = null;
  currentAiLine = null;
  currentAiStroke = null;
  const total = data[active.totalKey];
  setPrompt(total >= MIN_POINTS_TO_TRANSFORM ? STAGES[stageIndex].prompt : 'DRAW LONGER');
}

function clearCurrentStage() {
  if (stageIndex >= STAGES.length) return;
  stopPencilSound();
  pointerDown = false;
  currentStroke = null;
  currentLiveLine = null;
  currentMachineGhost = null;
  currentAiLine = null;
  currentAiStroke = null;
  disposeGroup(drawingGroups[stageIndex]);
  disposeGroup(aiDrawingGroups[stageIndex]);
  const data = stageData[stageIndex];
  if (data.phase === 'recall') {
    data.recallStrokes = [];
    data.recallPoints = 0;
    data.recallSamples = [];
    drawingGroups[stageIndex].visible = true;
    generateButton.classList.remove('is-visible');
    clearButton.classList.remove('is-visible');
    setPrompt('REDRAW FROM MEMORY');
    return;
  }
  disposeGroup(outputGroups[stageIndex]);
  outputGroups[stageIndex].rotation.set(0, 0, 0);
  outputGroups[stageIndex].position.set(0, 0, 0);
  outputGroups[stageIndex].scale.set(1, 1, 1);
  if (stageIndex === 2) natureReveal = [];
  if (stageIndex === 1) {
    disposeGroup(machineGhosts);
    machineGhosts.visible = false;
  }
  stageData[stageIndex] = freshStageData();
  natureReveal = [];
  generationProgress = 0;
  drawingGroups[stageIndex].visible = true;
  aiDrawingGroups[stageIndex].visible = true;
  generateButton.classList.remove('is-visible');
  clearButton.classList.remove('is-visible');
  nextButton.classList.remove('is-visible');
  signalButton.classList.toggle('is-visible', stageIndex === 6);
  experience.classList.remove('is-viewing', 'is-comparing', 'is-ai-drawing');
  drawingSurfaceGroup.visible = true;
  resetCamera();
  outputGroups[stageIndex].rotation.set(0, 0, 0);
  outputGroups[stageIndex].position.set(0, 0, 0);
  outputGroups[stageIndex].scale.set(1, 1, 1);
  setGuideVisible(stageIndex, false);
  setPrompt(STAGES[stageIndex].prompt);
  cursorLabel.textContent = 'DRAW';
}

function enterStudy() {
  const data = stageData[stageIndex];
  data.phase = 'study';
  data.completed = true;
  generationProgress = 0;
  drawingGroups[stageIndex].visible = false;
  aiDrawingGroups[stageIndex].visible = false;
  outputGroups[stageIndex].visible = true;
  setGuideVisible(stageIndex, false);
  generateButton.classList.remove('is-visible');
  clearButton.classList.add('is-visible');
  experience.classList.add('is-viewing');
  experience.classList.remove('is-ai-drawing');
  experience.classList.remove('is-comparing');
  drawingSurfaceGroup.visible = false;
  comparisonLabels[0].textContent = 'HUMAN';
  comparisonLabels[1].textContent = 'AI';
  setPrompt(STAGES[stageIndex].prompt);
  cursorLabel.textContent = 'ORBIT';
  enableInspection();
  window.setTimeout(() => {
    if (stageData[stageIndex]?.phase === 'study' && stageIndex < STAGES.length - 1) nextButton.classList.add('is-visible');
  }, reducedMotion ? 20 : 900);
}

function beginRecallPhase() {
  const data = stageData[stageIndex];
  if (data.phase !== 'study') return;
  data.phase = 'recall';
  data.recallStrokes = [];
  data.recallPoints = 0;
  data.recallSamples = [];
  disposeGroup(drawingGroups[stageIndex]);
  drawingGroups[stageIndex].visible = true;
  outputGroups[stageIndex].visible = false;
  nextButton.classList.remove('is-visible');
  clearButton.classList.remove('is-visible');
  signalButton.classList.remove('is-visible');
  experience.classList.remove('is-viewing', 'is-comparing');
  drawingSurfaceGroup.visible = true;
  resetCamera();
  setPrompt('REDRAW FROM MEMORY');
  cursorLabel.textContent = 'DRAW';
}

function completeRecall() {
  const data = stageData[stageIndex];
  data.phase = 'compare';
  data.completed = true;
  data.presence = calculatePresence(stageIndex);
  drawingGroups[stageIndex].visible = false;
  aiDrawingGroups[stageIndex].visible = false;
  outputGroups[stageIndex].visible = true;
  generationProgress = 0;
  generateButton.classList.remove('is-visible');
  signalButton.classList.remove('is-visible');
  clearButton.classList.add('is-visible');
  experience.classList.add('is-viewing', 'is-comparing');
  experience.classList.remove('is-ai-drawing');
  drawingSurfaceGroup.visible = false;
  comparisonLabels[0].textContent = 'ORIGINAL';
  comparisonLabels[1].textContent = 'RECALL';
  setPrompt(`MEMORY ${Math.round(data.presence * 100)}%`);
  cursorLabel.textContent = 'ORBIT';
  enableInspection();
}

function transformHuman(strokes) {
  const output = activeOutputTarget ?? outputGroups[0];
  strokes.forEach((points, strokeIndex) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.9;
    for (let i = 0; i < 10; i += 1) {
      const material = (i + strokeIndex) % 4 === 0
        ? surfaceTemplates.humanCoral.clone()
        : surfaceTemplates.humanInk.clone();
      material.opacity = 0.94 - i * 0.045;
      material.transparent = i > 4;
      const trace = makeTube(points, 0.028 - i * 0.0008, closed, material);
      const scale = 0.72 + i * 0.048;
      trace.scale.set(scale, scale, 1);
      trace.position.z = i * -0.038 - strokeIndex * 0.018;
      trace.rotation.z = (i - 4.5) * 0.012;
      output.add(trace);
    }
  });
}

function makeCodePlane(textValue, accent = false) {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 144;
  const context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.font = '650 46px ui-monospace, SFMono-Regular, Menlo, monospace';
  context.fillStyle = accent ? '#d8ff45' : '#f6f7ff';
  context.shadowColor = accent ? '#7da500' : '#5168ff';
  context.shadowBlur = 14;
  context.fillText(textValue, 22, 92);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.userData.ephemeral = true;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(3.7, 0.52),
    new THREE.MeshBasicMaterial({ map: texture, transparent: true, opacity: 0.88, depthWrite: false, side: THREE.DoubleSide }),
  );
  plane.castShadow = false;
  return plane;
}

function transformMachine(strokes) {
  const output = activeOutputTarget ?? outputGroups[1];
  const maxCodePlanes = output.name === 'ai-transformation' ? 16 : 12;
  let codePlaneCount = 0;
  strokes.forEach((points, strokeIndex) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.7;
    output.add(makeTube(points, 0.042, closed, surfaceTemplates.machineChrome.clone()));
    const predicted = points.map((point, index) => {
      const previous = points[Math.max(0, index - 3)];
      const next = points[Math.min(points.length - 1, index + 3)];
      return point.clone().multiplyScalar(0.56).add(previous.clone().multiplyScalar(0.22)).add(next.clone().multiplyScalar(0.22)).setZ(0.11 + Math.sin(index * 0.2) * 0.12);
    });
    output.add(makeTube(predicted, 0.017, closed, surfaceTemplates.machineSignal.clone()));
    const step = Math.max(8, Math.floor(points.length / 9));
    for (let i = 0; i < points.length; i += step) {
      if (codePlaneCount >= maxCodePlanes) break;
      const point = points[i];
      const word = challengeWords[(i + strokeIndex + challengeSeed) % challengeWords.length];
      const line = i % (step * 2) === 0
        ? `latent[${String(i).padStart(3, '0')}] = ${word}(${point.x.toFixed(2)});`
        : `curveTo(${point.x.toFixed(2)}, ${point.y.toFixed(2)});`;
      const code = makeCodePlane(line, i % (step * 2) === 0);
      code.position.set(point.x + (strokeIndex % 2 ? -0.28 : 0.28), point.y + 0.16, 0.3 + (i / points.length) * 0.8);
      code.scale.setScalar(0.64);
      code.rotation.y = (seeded(i + strokeIndex * 9) - 0.5) * 0.48;
      code.rotation.x = (seeded(i * 0.7 + 4) - 0.5) * 0.18;
      output.add(code);
      codePlaneCount += 1;
    }
  });
  machineGhosts.visible = false;
}

function seeded(value) {
  const raw = Math.sin(value * 91.345 + 12.17) * 43758.5453;
  return raw - Math.floor(raw);
}

function transformNature(strokes) {
  const output = activeOutputTarget ?? outputGroups[2];
  const segments = [];
  const leaves = [];
  let seed = stageData[2].totalPoints * 0.137 + 4;

  function branch(start, direction, length, depth) {
    if (segments.length > 27000) return;
    const bend = new THREE.Vector3((seeded(seed += 0.7) - 0.5) * 0.12, (seeded(seed += 0.3) - 0.5) * 0.12, (seeded(seed += 0.9) - 0.5) * 0.2);
    const end = start.clone().add(direction.clone().multiplyScalar(length)).add(bend);
    segments.push(start.x, start.y, start.z, end.x, end.y, end.z);
    if (depth >= 3 || length < 0.035) {
      leaves.push(end);
      return;
    }
    const axis = new THREE.Vector3(0, 0, 1);
    for (const sign of [-1, 1]) {
      const angle = sign * (0.32 + seeded(seed += 0.4) * 0.42);
      const next = direction.clone().applyAxisAngle(axis, angle);
      next.z += (seeded(seed += 0.2) - 0.5) * 0.4;
      branch(end, next.normalize(), length * (0.62 + seeded(seed += 0.5) * 0.12), depth + 1);
    }
  }

  strokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.65;
    output.add(makeTube(points, 0.034, closed, surfaceTemplates.nature.clone()));
    const step = Math.max(4, Math.floor(points.length / 54));
    for (let i = 1; i < points.length - 1; i += step) {
      const tangent = points[i + 1].clone().sub(points[i - 1]).normalize();
      const normal = new THREE.Vector3(-tangent.y, tangent.x, (seeded(seed += 0.8) - 0.5) * 0.3).normalize();
      branch(points[i], normal, 0.19 + seeded(seed += 0.6) * 0.19, 0);
      branch(points[i], normal.clone().multiplyScalar(-1), 0.16 + seeded(seed += 0.6) * 0.16, 0);
    }
  });

  const branchGeometry = new THREE.BufferGeometry();
  branchGeometry.setAttribute('position', new THREE.Float32BufferAttribute(segments, 3));
  branchGeometry.setDrawRange(0, 0);
  const branchLines = new THREE.LineSegments(branchGeometry, new THREE.LineBasicMaterial({ color: 0xe9f5df, transparent: true, opacity: 0.88 }));
  branchLines.userData.total = segments.length / 3;
  output.add(branchLines);
  const leafPoints = new THREE.Points(
    new THREE.BufferGeometry().setFromPoints(leaves),
    new THREE.PointsMaterial({ color: 0xf1bf3b, size: 0.055, transparent: true, opacity: 0, sizeAttenuation: true }),
  );
  output.add(leafPoints);
  natureReveal.push({ branches: branchLines, leaves: leafPoints });
}

function transformMemory(strokes) {
  const output = activeOutputTarget ?? outputGroups[3];
  strokes.forEach((points, strokeIndex) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.75;
    output.add(makeTube(points, 0.044, closed, surfaceTemplates.memory.clone()));
    for (let echo = 0; echo < 24; echo += 1) {
      const scale = 0.66 + echo * 0.017;
      const echoPoints = points.map((point, i) => new THREE.Vector3(
        point.x * scale + Math.sin(i * 0.19 + echo * 0.7) * echo * 0.006,
        point.y * scale + Math.cos(i * 0.14 + echo * 0.5) * echo * 0.005,
        -echo * 0.052 - strokeIndex * 0.02,
      ));
      const line = lineFromPoints(echoPoints, echo % 5 === 0 ? 0xf4ece2 : 0x281722, 0.62 - echo * 0.016);
      line.rotation.z = (echo - 15) * 0.006;
      output.add(line);
    }
  });
}

function transformMirror(strokes) {
  const output = activeOutputTarget ?? outputGroups[4];
  strokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.72;
    for (const sign of [-1, 1]) {
      const mirrored = points.map((point, index) => new THREE.Vector3(point.x * sign, point.y, Math.sin(index * 0.16) * 0.22 * sign));
      const tube = makeTube(mirrored, 0.045, closed, surfaceTemplates.mirror.clone());
      tube.position.z = sign * 0.1;
      output.add(tube);
    }
  });
}

function transformShadow(strokes) {
  const output = activeOutputTarget ?? outputGroups[5];
  strokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.72;
    for (let depth = 0; depth < 14; depth += 1) {
      const material = surfaceTemplates.shadow.clone();
      material.opacity = 0.93 - depth * 0.038;
      material.transparent = depth > 3;
      const layer = makeTube(points, 0.052, closed, material);
      layer.position.z = -depth * 0.085;
      layer.position.x = depth * 0.018;
      layer.position.y = -depth * 0.012;
      output.add(layer);
    }
  });
}

function transformEcho(strokes) {
  const output = activeOutputTarget ?? outputGroups[6];
  strokes.forEach((points, strokeIndex) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.72;
    for (let echo = 0; echo < 13; echo += 1) {
      const material = surfaceTemplates.echo.clone();
      material.opacity = 0.9 - echo * 0.05;
      material.transparent = echo > 2;
      const tube = makeTube(points, 0.025 + echo * 0.0018, closed, material);
      tube.scale.setScalar(0.72 + echo * 0.034);
      tube.rotation.z = (echo - 6) * 0.016;
      tube.position.z = -echo * 0.07 - strokeIndex * 0.02;
      tube.userData.echoPhase = echo * 0.34;
      output.add(tube);
    }
  });
}

function transformSwarm(strokes) {
  const output = activeOutputTarget ?? outputGroups[7];
  const source = strokes.flat();
  const count = Math.min(760, Math.max(180, source.length * 4));
  const geometry = new THREE.IcosahedronGeometry(0.035, 1);
  const material = surfaceTemplates.swarm.clone();
  const mesh = new THREE.InstancedMesh(geometry, material, count);
  const matrix = new THREE.Matrix4();
  const bases = [];
  for (let i = 0; i < count; i += 1) {
    const point = source[i % source.length];
    const spread = 0.06 + seeded(i * 0.47) * 0.25;
    const base = new THREE.Vector3(
      point.x + (seeded(i * 1.3) - 0.5) * spread,
      point.y + (seeded(i * 2.1) - 0.5) * spread,
      (seeded(i * 3.7) - 0.5) * 1.15,
    );
    bases.push(base);
    const scale = 0.45 + seeded(i * 0.77) * 1.1;
    matrix.compose(base, new THREE.Quaternion(), new THREE.Vector3(scale, scale, scale));
    mesh.setMatrixAt(i, matrix);
  }
  mesh.userData.swarmBases = bases;
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  output.add(mesh);
}

function transformRelic(strokes) {
  const output = activeOutputTarget ?? outputGroups[8];
  strokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.72;
    output.add(makeTube(points, 0.085, closed, surfaceTemplates.relic.clone()));
    const step = Math.max(10, Math.floor(points.length / 16));
    for (let i = 0; i < points.length; i += step) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.018, 8, 28), surfaceTemplates.relic.clone());
      ring.position.copy(points[i]);
      ring.position.z += Math.sin(i * 0.21) * 0.36;
      ring.rotation.set(i * 0.07, i * 0.11, i * 0.04);
      ring.castShadow = true;
      output.add(ring);
    }
  });
}

function transformDream(strokes) {
  const output = activeOutputTarget ?? outputGroups[9];
  strokes.forEach((points, strokeIndex) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.78;
    for (let layer = 0; layer < 12; layer += 1) {
      const dreamPoints = points.map((point, index) => new THREE.Vector3(
        point.x * (0.75 + layer * 0.025),
        point.y * (0.75 + layer * 0.025),
        Math.sin(index * 0.13 + layer * 0.7) * (0.15 + layer * 0.035),
      ));
      const tube = makeTube(dreamPoints, 0.018 + (layer % 3) * 0.006, closed, surfaceTemplates.dream.clone());
      tube.rotation.y = (layer - 5.5) * 0.055;
      tube.rotation.z = layer * 0.018 + strokeIndex * 0.04;
      output.add(tube);
    }
  });
}

function transformMemoryComparison(originalStrokes, recalledStrokes) {
  const output = outputGroups[stageIndex];
  const originalGroup = new THREE.Group();
  const recalledGroup = new THREE.Group();
  originalGroup.position.x = -1.62;
  recalledGroup.position.x = 1.62;
  originalGroup.scale.setScalar(0.56);
  recalledGroup.scale.setScalar(0.56);
  originalStrokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.74;
    originalGroup.add(makeTube(points, 0.07, closed, surfaceTemplates.recallModel.clone()));
  });
  recalledStrokes.forEach((points) => {
    const closed = points[0].distanceTo(points.at(-1)) < 0.74;
    recalledGroup.add(makeTube(points, 0.07, closed, surfaceTemplates.recallUser.clone()));
  });
  output.add(setObjectShadows(originalGroup), setObjectShadows(recalledGroup));
}

function runStageTransform(index, strokes) {
  if (index === 0) transformHuman(strokes);
  if (index === 1) transformMachine(strokes);
  if (index === 2) transformNature(strokes);
  if (index === 3) transformMemory(strokes);
  if (index === 4) transformMirror(strokes);
  if (index === 5) transformShadow(strokes);
  if (index === 6) transformEcho(strokes);
  if (index === 7) transformSwarm(strokes);
  if (index === 8) transformRelic(strokes);
}

function tintAiArtifact(group, colorHex) {
  const tint = new THREE.Color(colorHex);
  group.traverse((child) => {
    const materials = Array.isArray(child.material) ? child.material : [child.material];
    materials.filter(Boolean).forEach((material) => {
      material.color?.lerp(tint, material.map ? 0.12 : 0.24);
      if (material.emissive) {
        material.emissive.lerp(tint, 0.18);
        material.emissiveIntensity = Math.max(material.emissiveIntensity ?? 0, 0.22);
      }
    });
  });
}

function transformHumanAndAi(index, humanStrokes, aiStrokes) {
  const output = outputGroups[index];
  const humanArtifact = new THREE.Group();
  const aiArtifact = new THREE.Group();
  humanArtifact.name = 'human-transformation';
  aiArtifact.name = 'ai-transformation';
  humanArtifact.position.x = -1.66;
  aiArtifact.position.x = 1.66;
  humanArtifact.rotation.y = 0.1;
  aiArtifact.rotation.y = -0.1;
  humanArtifact.scale.setScalar(0.5);
  aiArtifact.scale.setScalar(0.5);
  output.add(humanArtifact, aiArtifact);
  try {
    activeOutputTarget = humanArtifact;
    runStageTransform(index, humanStrokes);
    activeOutputTarget = aiArtifact;
    runStageTransform(index, aiStrokes.length ? aiStrokes : humanStrokes);
  } finally {
    activeOutputTarget = null;
  }
  tintAiArtifact(aiArtifact, AI_COLORS[index]);
  setObjectShadows(humanArtifact);
  setObjectShadows(aiArtifact);
}

function completeTransformationFromDrawings() {
  if (stageIndex >= STAGES.length) return;
  const data = stageData[stageIndex];
  if (data.phase !== 'ai-drawing') return;
  const active = activeStrokeState(data);
  disposeGroup(outputGroups[stageIndex]);
  const strokes = normalizeStrokeSet(active.strokes);
  const aiStrokes = normalizeStrokeSet(data.aiStrokes);
  if (!strokes.length) return;
  if (stageIndex === STAGES.length - 1) {
    transformMemoryComparison(normalizeStrokeSet(stageData[0].strokes), strokes);
    outputGroups[stageIndex].scale.setScalar(reducedMotion ? 1 : 0.001);
    completeRecall();
    return;
  }
  transformHumanAndAi(stageIndex, strokes, aiStrokes);
  outputGroups[stageIndex].scale.setScalar(reducedMotion ? 1 : 0.001);
  enterStudy();
}

function performTransformCurrentStage() {
  if (stageIndex >= STAGES.length) return;
  if (pointerDown) finishStroke();
  const data = stageData[stageIndex];
  if (data.phase !== 'draw') return;
  const requiredPoints = data.timeExpired ? 4 : MIN_POINTS_TO_TRANSFORM;
  if (data.totalPoints < requiredPoints) {
    setPrompt('DRAW LONGER');
    return;
  }
  prepareAiDrawing(data);
  data.phase = 'ai-drawing';
  data.aiProgress = 0;
  drawingGroups[stageIndex].visible = true;
  aiDrawingGroups[stageIndex].visible = true;
  outputGroups[stageIndex].visible = false;
  drawingSurfaceGroup.visible = true;
  generateButton.classList.remove('is-visible');
  clearButton.classList.remove('is-visible');
  signalButton.classList.remove('is-visible');
  experience.classList.add('is-ai-drawing');
  experience.classList.remove('is-viewing', 'is-comparing');
  setPrompt('AI DRAWING');
  cursorLabel.textContent = 'WAIT';
}

function showTransition(action, variant = stageIndex) {
  if (transitionBusy) return;
  transitionBusy = true;
  transitionLoader.dataset.variant = String(((variant % 10) + 10) % 10);
  transitionLoader.classList.add('is-visible');
  window.setTimeout(action, reducedMotion ? 20 : 430);
  window.setTimeout(() => {
    transitionLoader.classList.remove('is-visible');
    transitionBusy = false;
  }, reducedMotion ? 40 : 1050);
}

function transformCurrentStage() {
  const data = stageData[stageIndex];
  const requiredPoints = data.timeExpired ? 4 : MIN_POINTS_TO_TRANSFORM;
  if (data.phase !== 'draw' || data.totalPoints < requiredPoints) {
    if (data.totalPoints < requiredPoints) setPrompt('DRAW LONGER');
    return;
  }
  showTransition(performTransformCurrentStage, stageIndex);
}

function restoreStageUi(index) {
  const data = stageData[index];
  const drawing = data.phase === 'draw';
  const aiDrawing = data.phase === 'ai-drawing';
  const viewing = ['study', 'compare'].includes(data.phase);
  const points = data.totalPoints;
  nextButton.classList.toggle('is-visible', data.phase === 'study' && index < STAGES.length - 1);
  generateButton.classList.toggle('is-visible', drawing && points >= (data.timeExpired ? 4 : MIN_POINTS_TO_TRANSFORM));
  clearButton.classList.toggle('is-visible', points > 0 || viewing);
  signalButton.classList.toggle('is-visible', index === 6 && data.phase === 'draw');
  drawingGroups[index].visible = drawing || aiDrawing;
  aiDrawingGroups[index].visible = drawing || aiDrawing;
  outputGroups[index].visible = viewing;
  drawingSurfaceGroup.visible = drawing || aiDrawing;
  experience.classList.toggle('is-viewing', viewing);
  experience.classList.toggle('is-comparing', data.phase === 'compare');
  experience.classList.toggle('is-ai-drawing', aiDrawing);
  setGuideVisible(index, false);
  if (viewing) enableInspection();
  else resetCamera();
  if (data.phase === 'draw' || data.phase === 'study') setPrompt(STAGES[index].prompt);
  if (aiDrawing) setPrompt('AI DRAWING');
  if (data.phase === 'compare') setPrompt(`MEMORY ${Math.round(data.presence * 100)}%`);
  comparisonLabels[0].textContent = data.phase === 'compare' ? 'ORIGINAL' : 'HUMAN';
  comparisonLabels[1].textContent = data.phase === 'compare' ? 'RECALL' : 'AI';
  cursorLabel.textContent = viewing ? 'ORBIT' : aiDrawing ? 'WAIT' : 'DRAW';
  syncTimerUi(data);
}

function goToStage(index) {
  finishStroke();
  const target = clamp(index, 0, STAGES.length - 1);
  stageIndex = target;
  stageGroups.forEach((group, i) => { group.visible = i === target; });
  const config = STAGES[target];
  experience.dataset.stage = config.key;
  setPaperStage(target);
  currentIndex.textContent = String(target + 1);
  progressFill.style.width = `${(target + 1) * 10}%`;
  chapterButtons.forEach((button, i) => button.classList.toggle('is-active', i === target));
  previousButton.classList.toggle('is-visible', target > 0);
  experience.classList.remove('is-viewing', 'is-comparing', 'is-ai-drawing');
  generateButton.classList.remove('is-visible');
  clearButton.classList.remove('is-visible');
  nextButton.classList.remove('is-visible');
  restoreStageUi(target);
}

function handlePointerDown(event) {
  if (event.isTrusted) experience.classList.add('has-pointer');
  if (event.target.closest?.('button, a')) return;
  if (stageData[stageIndex]?.phase === 'draw' && event.clientX > window.innerWidth * 0.5) return;
  pointerToWorld(event);
  beginStroke();
}

function handlePointerMove(event) {
  if (event.isTrusted) experience.classList.add('has-pointer');
  pointerToWorld(event);
  if (pointerDown) addDrawPoint();
}

function handlePointerUp() {
  finishStroke();
}

window.addEventListener('pointerleave', () => experience.classList.remove('has-pointer', 'is-over-control'));

function playEchoSignal() {
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const now = audioContext.currentTime + 0.04;
  const pattern = [0, 0.18, 0.46, 0.61, 0.94];
  pattern.forEach((offset, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = index % 2 ? 'triangle' : 'sine';
    oscillator.frequency.value = 210 + index * 73 + (challengeSeed % 5) * 18;
    gain.gain.setValueAtTime(0.0001, now + offset);
    gain.gain.exponentialRampToValueAtTime(0.12, now + offset + 0.018);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + offset + 0.13);
    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(now + offset);
    oscillator.stop(now + offset + 0.15);
  });
}

window.addEventListener('pointerdown', handlePointerDown);
window.addEventListener('pointermove', handlePointerMove);
window.addEventListener('pointerup', handlePointerUp);
window.addEventListener('pointercancel', handlePointerUp);

generateButton.addEventListener('click', transformCurrentStage);
clearButton.addEventListener('click', clearCurrentStage);
signalButton.addEventListener('click', playEchoSignal);
nextButton.addEventListener('click', () => {
  if (stageData[stageIndex].phase === 'study' && stageIndex < STAGES.length - 1) showTransition(() => goToStage(stageIndex + 1), stageIndex + 1);
});
previousButton.addEventListener('click', () => showTransition(() => goToStage(stageIndex - 1), stageIndex - 1));
chapterButtons.forEach((button) => button.addEventListener('click', () => {
  const target = Number(button.dataset.index);
  if (target !== stageIndex) showTransition(() => goToStage(target), target);
}));
window.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && stageIndex < STAGES.length && generateButton.classList.contains('is-visible')) transformCurrentStage();
  if (event.key === 'ArrowRight' && stageData[stageIndex]?.phase === 'study' && stageIndex < STAGES.length - 1) showTransition(() => goToStage(stageIndex + 1), stageIndex + 1);
  if (event.key === 'ArrowLeft' && stageIndex > 0) showTransition(() => goToStage(stageIndex - 1), stageIndex - 1);
});

function updateGuides(elapsed) {
  humanGuide.rotation.z = Math.sin(elapsed * 0.16) * 0.035;
  humanGuide.scale.setScalar(1 + Math.sin(elapsed * 0.7) * 0.012);

  const positions = machineGrid.geometry.attributes.position.array;
  for (let i = 0; i < positions.length; i += 3) {
    const x = machineGridBase[i];
    const y = machineGridBase[i + 1];
    const distance = Math.hypot(x - pointerWorld.x, y - pointerWorld.y);
    const influence = Math.exp(-distance * 1.5);
    positions[i] = x + Math.sin(y * 3 + elapsed * 2) * influence * 0.07;
    positions[i + 1] = y + Math.cos(x * 3 - elapsed * 1.4) * influence * 0.07;
    positions[i + 2] = influence * 0.45 + Math.sin(x * 2 + y * 3 + elapsed) * 0.025;
  }
  machineGrid.geometry.attributes.position.needsUpdate = true;
  natureSpores.rotation.z = elapsed * 0.008;
  memoryGuide.position.x = Math.sin(elapsed * 0.2) * 0.06;
  mirrorGuide.rotation.y = Math.sin(elapsed * 0.32) * 0.18;
  shadowGuide.rotation.x = elapsed * 0.12;
  shadowGuide.rotation.y = elapsed * 0.18;
  echoGuide.scale.setScalar(1 + Math.sin(elapsed * 2.2) * 0.035);
  swarmGuide.rotation.z = elapsed * 0.035;
  const swarmPositions = swarmGuide.geometry.attributes.position.array;
  for (let i = 0; i < swarmPositions.length; i += 3) swarmPositions[i + 2] += Math.sin(elapsed * 1.4 + i) * 0.0007;
  swarmGuide.geometry.attributes.position.needsUpdate = true;
  relicGuide.rotation.y = elapsed * 0.16;
  relicGuide.rotation.z = Math.sin(elapsed * 0.3) * 0.18;
  dreamGuide.rotation.x = elapsed * 0.025;
  dreamGuide.rotation.y = elapsed * 0.045;
}

function updatePaperSurfaces(elapsed) {
  if (reducedMotion || !drawingSurfaceGroup.visible) return;
  const halfWidth = DRAWING_WIDTH / 2;
  const halfHeight = DRAWING_HEIGHT / 2;
  paperSheets.forEach((sheet, sheetIndex) => {
    const geometry = sheet.geometry;
    const position = geometry.attributes.position;
    const basePositions = geometry.userData.basePositions;
    if (!basePositions) return;
    const mode = geometry.userData.mode ?? stageIndex;
    const phase = sheetIndex * 2.83 + mode * 0.67;
    const amplitude = 0.015 + mode * 0.0007;

    for (let vertex = 0; vertex < position.count; vertex += 1) {
      const offset = vertex * 3;
      const baseX = basePositions[offset];
      const baseY = basePositions[offset + 1];
      const baseZ = basePositions[offset + 2];
      const horizontalEdge = clamp((Math.abs(baseX) / halfWidth - 0.72) / 0.28);
      const verticalEdge = clamp((Math.abs(baseY) / halfHeight - 0.72) / 0.28);
      const edgeInfluence = smooth(Math.max(horizontalEdge, verticalEdge));
      const driftX = (
        Math.sin(baseY * 1.52 + elapsed * 0.33 + phase)
        + Math.sin(baseY * 4.1 - elapsed * 0.16 + phase * 1.7) * 0.28
      ) * amplitude * edgeInfluence;
      const driftY = (
        Math.sin(baseX * 1.37 + elapsed * 0.27 + phase * 1.31)
        + Math.cos(baseX * 3.8 - elapsed * 0.13 + phase) * 0.24
      ) * amplitude * 0.78 * edgeInfluence;
      const curl = Math.sin(elapsed * 0.29 + baseX * 1.8 + baseY * 0.76 + phase)
        * 0.008 * (0.18 + edgeInfluence * 0.82);
      position.setXYZ(vertex, baseX + driftX, baseY + driftY, baseZ + curl);
    }
    position.needsUpdate = true;
    geometry.computeVertexNormals();

    const edgeGeometry = paperEdges[sheetIndex].geometry;
    const edgePosition = edgeGeometry.attributes.position;
    const surfaceVertexMap = edgeGeometry.userData.surfaceVertexMap;
    if (!surfaceVertexMap) return;
    for (let edgeVertex = 0; edgeVertex < edgePosition.count; edgeVertex += 1) {
      const surfaceVertex = surfaceVertexMap[edgeVertex];
      edgePosition.setXYZ(
        edgeVertex,
        position.getX(surfaceVertex),
        position.getY(surfaceVertex),
        position.getZ(surfaceVertex),
      );
    }
    edgePosition.needsUpdate = true;
  });
}

function updateAiDrawing(elapsed, delta) {
  const data = stageData[stageIndex];
  if (data?.phase !== 'ai-drawing') return;
  const duration = reducedMotion ? 0.08 : 2.35 + stageIndex * 0.11;
  data.aiProgress = clamp(data.aiProgress + delta / duration);
  const pointBudget = Math.floor(smooth(data.aiProgress) * data.aiPointTotal);
  data.aiRevealLines.forEach((line) => {
    const visiblePoints = clamp(pointBudget - line.userData.pointOffset, 0, line.userData.totalPoints);
    line.geometry.setDrawRange(0, visiblePoints);
  });
  if (data.aiProgress >= 1 && data.aiFinishedAt === null) {
    data.aiFinishedAt = elapsed;
    setPrompt('TWO ANSWERS');
  }
  if (data.aiFinishedAt !== null && elapsed - data.aiFinishedAt > (reducedMotion ? 0.02 : 0.58)) {
    completeTransformationFromDrawings();
  }
}

function updateOutputs(elapsed, delta) {
  const phase = stageData[stageIndex]?.phase;
  if (stageIndex < STAGES.length && ['study', 'compare'].includes(phase)) {
    generationProgress = clamp(generationProgress + delta * (reducedMotion ? 8 : 1.35));
    const reveal = smooth(generationProgress);
    outputGroups[stageIndex].scale.lerp(new THREE.Vector3(1, 1, 1), reducedMotion ? 1 : 0.12);
    const group = outputGroups[stageIndex];
    const pointerYaw = controlsInteracting ? 0 : pointerNdc.x * 0.04;
    const pointerPitch = controlsInteracting ? 0 : -pointerNdc.y * 0.025;
    if (stageIndex === 0) {
      group.rotation.y = Math.sin(elapsed * 0.32) * 0.08 + pointerYaw;
      group.rotation.x = pointerPitch;
    }
    if (stageIndex === 1) {
      group.rotation.y = Math.sin(elapsed * 0.35) * 0.1 + pointerYaw;
      group.rotation.x = pointerPitch;
      group.rotation.z = Math.sin(elapsed * 0.28) * 0.018;
    }
    if (stageIndex === 2) {
      group.rotation.y = Math.sin(elapsed * 0.27) * 0.08 + pointerYaw;
      group.rotation.x = pointerPitch;
      if (natureReveal.length && phase === 'study') {
        natureReveal.forEach(({ branches, leaves }) => {
          branches.geometry.setDrawRange(0, Math.floor(branches.userData.total * reveal));
          leaves.material.opacity = clamp((reveal - 0.58) * 2.4);
        });
      }
    }
    if (stageIndex === 3) {
      group.rotation.y = Math.sin(elapsed * 0.23) * 0.08 + pointerYaw;
      group.rotation.x = pointerPitch;
      group.position.z = Math.sin(elapsed * 0.5) * 0.06;
    }
    if (stageIndex === 4) {
      group.rotation.x = pointerPitch * 0.5;
      group.rotation.y = Math.sin(elapsed * 0.3) * 0.07 + pointerYaw;
    }
    if (stageIndex === 5) group.rotation.y = Math.sin(elapsed * 0.24) * 0.09 + pointerYaw;
    if (stageIndex === 6 && phase === 'study') {
      group.traverse((child) => {
        if (child.material?.emissiveIntensity !== undefined) child.material.emissiveIntensity = 0.8 + Math.sin(elapsed * 3.2 + child.userData.echoPhase) * 0.55;
      });
    }
    if (stageIndex === 7 && phase === 'study') {
      const matrix = new THREE.Matrix4();
      const quaternion = new THREE.Quaternion();
      group.traverse((child) => {
        if (!child.userData.swarmBases) return;
        child.userData.swarmBases.forEach((base, index) => {
          const position = base.clone().add(new THREE.Vector3(
            Math.sin(elapsed * 1.7 + index * 0.37) * 0.045,
            Math.cos(elapsed * 1.3 + index * 0.29) * 0.045,
            Math.sin(elapsed * 1.1 + index * 0.17) * 0.07,
          ));
          const scale = 0.7 + Math.sin(elapsed * 2 + index) * 0.18;
          matrix.compose(position, quaternion, new THREE.Vector3(scale, scale, scale));
          child.setMatrixAt(index, matrix);
        });
        child.instanceMatrix.needsUpdate = true;
      });
    }
    if (stageIndex === 8) group.rotation.y = Math.sin(elapsed * 0.22) * 0.08 + pointerYaw;
    if (stageIndex === 9) group.rotation.y = Math.sin(elapsed * 0.2) * 0.1 + pointerYaw;
  }
}

function animate() {
  const delta = Math.min(clock.getDelta(), 0.05);
  const elapsed = clock.elapsedTime;
  updateGuides(elapsed);
  updatePaperSurfaces(elapsed);
  updateDrawingTimer(performance.now());
  updateAiDrawing(elapsed, delta);
  updateOutputs(elapsed, delta);
  const viewing = ['study', 'compare'].includes(stageData[stageIndex]?.phase);
  if (controls.enabled) {
    if (!controlsInteracting && !reducedMotion) {
      controls.target.x += (Math.sin(elapsed * 0.18) * 0.1 - controls.target.x) * 0.012;
      controls.target.y += (Math.cos(elapsed * 0.15) * 0.06 - controls.target.y) * 0.012;
    }
    controls.update(delta);
  }
  floorMaterial.opacity += ((viewing ? 0.18 : 0) - floorMaterial.opacity) * 0.06;
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
  renderer.setSize(window.innerWidth, window.innerHeight);
  if (['study', 'compare'].includes(stageData[stageIndex]?.phase)) enableInspection();
  else resetCamera();
});

window.dispatchEvent(new PointerEvent('pointermove', { clientX: window.innerWidth / 2, clientY: window.innerHeight / 2 }));
goToStage(0);
animate();
