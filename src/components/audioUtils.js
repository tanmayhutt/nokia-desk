let audioCtx = null;

function getContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function playTone(freq, type, duration, vol = 0.1) {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    
    gain.gain.setValueAtTime(vol, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
}

export const playBeep = () => {
  try {
    const ctx = getContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.type = 'square';
    // Very fast frequency drop creates a classic sharp "tick" or "chirp"
    osc.frequency.setValueAtTime(2000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.03);
    
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.03);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + 0.03);
  } catch (e) {
    console.warn("Audio play failed:", e);
  }
};

export const playSnakeEat = () => {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.setValueAtTime(800, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.1);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.1);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.1);
}

export const playSnakeCrash = () => {
  const ctx = getContext();
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'sawtooth';
  osc.frequency.setValueAtTime(200, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(50, ctx.currentTime + 0.3);
  gain.gain.setValueAtTime(0.1, ctx.currentTime);
  gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start();
  osc.stop(ctx.currentTime + 0.3);
}

export const playStartupChime = () => {
  const notes = [
    { f: 1318.51, d: 0.15 }, // E6
    { f: 1174.66, d: 0.15 }, // D6
    { f: 739.99,  d: 0.3 },  // F#5
    { f: 830.61,  d: 0.3 },  // G#5
    { f: 1108.73, d: 0.15 }, // C#6
    { f: 987.77,  d: 0.15 }, // B5
    { f: 587.33,  d: 0.3 },  // D5
    { f: 659.25,  d: 0.3 },  // E5
    { f: 987.77,  d: 0.15 }, // B5
    { f: 880.00,  d: 0.15 }, // A5
    { f: 554.37,  d: 0.3 },  // C#5
    { f: 659.25,  d: 0.3 },  // E5
    { f: 880.00,  d: 0.6 }   // A5
  ];
  
  const ctx = getContext();
  let time = ctx.currentTime;
  
  notes.forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine'; // Classic nokia chime is quite pure
    osc.frequency.value = note.f;
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0, time + note.d);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + note.d);
    time += note.d;
  });
}

export const playSaulTheme = () => {
  const notes = [
    { f: 196.00, d: 0.2 }, // G3
    { f: 293.66, d: 0.2 }, // D4
    { f: 392.00, d: 0.4 }, // G4
    { f: 349.23, d: 0.2 }, // F4
    { f: 293.66, d: 0.4 }, // D4
  ];
  
  const ctx = getContext();
  let time = ctx.currentTime;
  notes.forEach(note => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.value = note.f;
    
    gain.gain.setValueAtTime(0.1, time);
    gain.gain.linearRampToValueAtTime(0, time + note.d);
    
    osc.connect(gain);
    gain.connect(ctx.destination);
    
    osc.start(time);
    osc.stop(time + note.d);
    time += note.d;
  });
}
