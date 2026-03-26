import { Audio } from 'expo-av';

export interface SoundInfo {
  key: string;
  nameHe: string;
  nameEn: string;
  description: string;
}

export const SOUNDS: SoundInfo[] = [
  { key: 'gentle_chime', nameHe: 'צליל עדין', nameEn: 'Gentle Chime', description: '🔔' },
  { key: 'soft_bell', nameHe: 'פעמון רך', nameEn: 'Soft Bell', description: '🛎️' },
  { key: 'digital_ping', nameHe: 'פינג דיגיטלי', nameEn: 'Digital Ping', description: '📱' },
  { key: 'melodic_tone', nameHe: 'מנגינה', nameEn: 'Melodic Tone', description: '🎵' },
  { key: 'harp', nameHe: 'נבל', nameEn: 'Harp', description: '🎶' },
  { key: 'bubble_pop', nameHe: 'בועה', nameEn: 'Bubble Pop', description: '🫧' },
];

let currentSound: Audio.Sound | null = null;
const SAMPLE_RATE = 22050;

async function ensureAudioMode(): Promise<void> {
  try {
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
      staysActiveInBackground: true,
      shouldDuckAndroid: true,
    });
  } catch {
    // Audio mode setup may fail on some platforms
  }
}

// --- Wave generation helpers ---

function sine(t: number, freq: number): number {
  return Math.sin(2 * Math.PI * freq * t);
}

function triangle(t: number, freq: number): number {
  const p = (t * freq) % 1;
  return 4 * Math.abs(p - 0.5) - 1;
}

function fadeEnvelope(i: number, total: number, fadeIn: number, fadeOut: number): number {
  const fadeInSamples = Math.floor(total * fadeIn);
  const fadeOutSamples = Math.floor(total * fadeOut);
  if (i < fadeInSamples) return i / fadeInSamples;
  if (i > total - fadeOutSamples) return (total - i) / fadeOutSamples;
  return 1;
}

// ADSR envelope: attack, decay, sustain level, release (all in ratio of total)
function adsrEnvelope(
  i: number,
  total: number,
  attack: number,
  decay: number,
  sustainLevel: number,
  release: number
): number {
  const a = Math.floor(total * attack);
  const d = Math.floor(total * decay);
  const r = Math.floor(total * release);
  const s = total - a - d - r;

  if (i < a) return i / a;
  if (i < a + d) return 1 - ((1 - sustainLevel) * (i - a)) / d;
  if (i < a + d + s) return sustainLevel;
  return sustainLevel * (1 - (i - a - d - s) / r);
}

// --- Sound generators ---

function generateGentleChime(): Float32Array {
  // Three ascending notes with harmonics - like a doorbell chime
  const duration = 1.2;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  const notes = [
    { freq: 523.25, start: 0, dur: 0.4 },     // C5
    { freq: 659.25, start: 0.2, dur: 0.4 },    // E5
    { freq: 783.99, start: 0.4, dur: 0.6 },    // G5
  ];

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const localT = t - note.start;
        const localI = Math.floor(localT * SAMPLE_RATE);
        const localTotal = Math.floor(note.dur * SAMPLE_RATE);
        const env = adsrEnvelope(localI, localTotal, 0.01, 0.15, 0.4, 0.4);

        // Fundamental + soft harmonics for bell-like quality
        sample += env * 0.5 * sine(localT, note.freq);
        sample += env * 0.25 * sine(localT, note.freq * 2) * Math.exp(-localT * 3);
        sample += env * 0.1 * sine(localT, note.freq * 3) * Math.exp(-localT * 5);
      }
    }
    samples[i] = sample * 0.7;
  }
  return samples;
}

function generateSoftBell(): Float32Array {
  // Rich bell sound with inharmonic overtones that decay at different rates
  const duration = 1.5;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  const bellFreq = 440;
  // Bell overtones are NOT integer multiples - that's what makes bells unique
  const overtones = [
    { ratio: 1.0, amp: 1.0, decay: 1.5 },
    { ratio: 2.0, amp: 0.6, decay: 2.0 },
    { ratio: 2.83, amp: 0.4, decay: 3.0 },
    { ratio: 4.07, amp: 0.25, decay: 4.0 },
    { ratio: 5.4, amp: 0.15, decay: 5.0 },
    { ratio: 6.2, amp: 0.1, decay: 6.0 },
  ];

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Quick attack
    const attack = Math.min(1, t / 0.005);

    for (const ot of overtones) {
      sample += attack * ot.amp * Math.exp(-t * ot.decay) * sine(t, bellFreq * ot.ratio);
    }

    // Second softer hit
    const t2 = t - 0.5;
    if (t2 > 0) {
      const attack2 = Math.min(1, t2 / 0.005);
      for (const ot of overtones) {
        sample += 0.5 * attack2 * ot.amp * Math.exp(-t2 * ot.decay) * sine(t2, bellFreq * ot.ratio * 1.5);
      }
    }

    samples[i] = sample * 0.3;
  }
  return samples;
}

function generateDigitalPing(): Float32Array {
  // Short, crisp digital notification - two quick pings
  const duration = 0.8;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  const pings = [
    { start: 0, freq: 1800, dur: 0.12 },
    { start: 0.18, freq: 2200, dur: 0.12 },
    { start: 0.4, freq: 1800, dur: 0.12 },
    { start: 0.52, freq: 2600, dur: 0.15 },
  ];

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const ping of pings) {
      if (t >= ping.start && t < ping.start + ping.dur) {
        const lt = t - ping.start;
        const env = Math.exp(-lt * 25); // Fast decay
        sample += env * sine(lt, ping.freq) * 0.6;
        sample += env * sine(lt, ping.freq * 0.5) * 0.2; // Sub octave
      }
    }
    samples[i] = sample;
  }
  return samples;
}

function generateMelodicTone(): Float32Array {
  // Pleasant 4-note melody (like iPhone default notification)
  const duration = 1.8;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  const notes = [
    { freq: 659.25, start: 0, dur: 0.25 },     // E5
    { freq: 783.99, start: 0.3, dur: 0.25 },    // G5
    { freq: 880.00, start: 0.6, dur: 0.25 },    // A5
    { freq: 1046.50, start: 0.9, dur: 0.6 },    // C6 (longer final note)
  ];

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const lt = t - note.start;
        const li = Math.floor(lt * SAMPLE_RATE);
        const lTotal = Math.floor(note.dur * SAMPLE_RATE);
        const env = adsrEnvelope(li, lTotal, 0.05, 0.1, 0.6, 0.35);

        // Warm tone with triangle + sine blend
        sample += env * 0.5 * sine(lt, note.freq);
        sample += env * 0.3 * triangle(lt, note.freq);
        sample += env * 0.1 * sine(lt, note.freq * 2);
      }
    }
    samples[i] = sample * 0.7;
  }
  return samples;
}

function generateHarp(): Float32Array {
  // Descending arpeggio - harp-like plucked strings
  const duration = 2.0;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  // C major arpeggio descending
  const notes = [
    { freq: 1046.50, start: 0, dur: 0.8 },     // C6
    { freq: 880.00, start: 0.15, dur: 0.7 },    // A5
    { freq: 783.99, start: 0.30, dur: 0.65 },   // G5
    { freq: 659.25, start: 0.45, dur: 0.6 },    // E5
    { freq: 523.25, start: 0.60, dur: 1.2 },    // C5
  ];

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    for (const note of notes) {
      if (t >= note.start && t < note.start + note.dur) {
        const lt = t - note.start;

        // Plucked string: sharp attack, exponential decay with harmonics
        const pluck = Math.exp(-lt * 4);
        const brightness = Math.exp(-lt * 8); // Higher harmonics decay faster

        sample += pluck * 0.4 * sine(lt, note.freq);
        sample += pluck * 0.2 * sine(lt, note.freq * 2);
        sample += brightness * 0.15 * sine(lt, note.freq * 3);
        sample += brightness * 0.08 * sine(lt, note.freq * 4);
      }
    }
    samples[i] = sample * 0.8;
  }
  return samples;
}

function generateBubblePop(): Float32Array {
  // Fun bubbly sound - rising pitch + pop
  const duration = 0.7;
  const total = Math.floor(SAMPLE_RATE * duration);
  const samples = new Float32Array(total);

  for (let i = 0; i < total; i++) {
    const t = i / SAMPLE_RATE;
    let sample = 0;

    // Bubble 1: rising pitch
    if (t < 0.2) {
      const freq = 300 + t * 3000; // Sweep up
      const env = Math.exp(-t * 8) * Math.min(1, t / 0.005);
      sample += env * sine(t, freq) * 0.6;
    }

    // Pop
    if (t >= 0.18 && t < 0.25) {
      const lt = t - 0.18;
      const env = Math.exp(-lt * 50);
      sample += env * (Math.random() * 2 - 1) * 0.3; // noise burst
      sample += env * sine(lt, 2500) * 0.3;
    }

    // Bubble 2: higher
    if (t >= 0.25 && t < 0.45) {
      const lt = t - 0.25;
      const freq = 500 + lt * 4000;
      const env = Math.exp(-lt * 10) * Math.min(1, lt / 0.003);
      sample += env * sine(lt, freq) * 0.5;
    }

    // Pop 2
    if (t >= 0.43 && t < 0.5) {
      const lt = t - 0.43;
      const env = Math.exp(-lt * 60);
      sample += env * (Math.random() * 2 - 1) * 0.25;
      sample += env * sine(lt, 3200) * 0.3;
    }

    // Final sparkle
    if (t >= 0.5 && t < 0.7) {
      const lt = t - 0.5;
      const env = Math.exp(-lt * 8);
      sample += env * sine(lt, 1800) * 0.2;
      sample += env * sine(lt, 2700) * 0.1;
    }

    samples[i] = sample;
  }
  return samples;
}

// --- Repeat sound 3 times with pause between ---

function repeatSound(generator: () => Float32Array, repeats = 3, pauseMs = 400): Float32Array {
  const single = generator();
  const pauseSamples = Math.floor(SAMPLE_RATE * pauseMs / 1000);
  const totalLength = repeats * single.length + (repeats - 1) * pauseSamples;
  const result = new Float32Array(totalLength);

  for (let r = 0; r < repeats; r++) {
    const offset = r * (single.length + pauseSamples);
    for (let i = 0; i < single.length; i++) {
      result[offset + i] = single[i];
    }
    // pause is already 0 (Float32Array default)
  }
  return result;
}

// --- WAV encoding ---

const GENERATORS: Record<string, () => Float32Array> = {
  gentle_chime: () => repeatSound(generateGentleChime, 3, 300),
  soft_bell: () => repeatSound(generateSoftBell, 3, 400),
  digital_ping: () => repeatSound(generateDigitalPing, 3, 350),
  melodic_tone: () => repeatSound(generateMelodicTone, 3, 250),
  harp: () => repeatSound(generateHarp, 3, 300),
  bubble_pop: () => repeatSound(generateBubblePop, 3, 350),
};

function samplesToWavBase64(samples: Float32Array): string {
  const numSamples = samples.length;
  const dataSize = numSamples * 2;
  const fileSize = 44 + dataSize;

  const buffer = new ArrayBuffer(fileSize);
  const view = new DataView(buffer);

  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  writeString(0, 'RIFF');
  view.setUint32(4, fileSize - 8, true);
  writeString(8, 'WAVE');
  writeString(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, SAMPLE_RATE, true);
  view.setUint32(28, SAMPLE_RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeString(36, 'data');
  view.setUint32(40, dataSize, true);

  for (let i = 0; i < numSamples; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    const intSample = Math.floor(clamped * 32000);
    view.setInt16(44 + i * 2, intSample, true);
  }

  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Cache generated sounds
const soundCache: Record<string, string> = {};

function getSoundUri(key: string): string {
  if (!soundCache[key]) {
    const generator = GENERATORS[key] ?? GENERATORS.gentle_chime;
    const samples = generator();
    soundCache[key] = `data:audio/wav;base64,${samplesToWavBase64(samples)}`;
  }
  return soundCache[key];
}

// --- Public API ---

export async function playAlert(soundKey: string): Promise<void> {
  await stopSound();
  await ensureAudioMode();

  try {
    const uri = getSoundUri(soundKey);
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true, volume: 1.0, isLooping: false }
    );
    currentSound = sound;

    sound.setOnPlaybackStatusUpdate((status) => {
      if (status.isLoaded && status.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        if (currentSound === sound) {
          currentSound = null;
        }
      }
    });
  } catch (e) {
    console.warn('Sound playback failed:', e);
  }
}

export async function previewSound(soundKey: string): Promise<void> {
  await playAlert(soundKey);
}

export async function stopSound(): Promise<void> {
  if (currentSound) {
    try {
      await currentSound.stopAsync();
      await currentSound.unloadAsync();
    } catch {
      // ignore
    }
    currentSound = null;
  }
}
