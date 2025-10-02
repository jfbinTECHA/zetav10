let audio = null;

function initializeAudio() {
  audio = new Audio('/alert.mp3');
  audio.loop = true;
  // you might want to set volume or other params
}

function playAlertSound() {
  if (!audio) initializeAudio();
  audio.play().catch(err => {
    console.warn('Audio play failed, maybe blocked by browser:', err);
    // fallback to visual-only alert
  });
}

function stopAlertSound() {
  if (audio) audio.pause();
}

// Then in panic-trigger logic:
if (panicMode) {
  playAlertSound();
  // flash UI
} else {
  stopAlertSound();
}

export { playAlertSound, stopAlertSound, initializeAudio };