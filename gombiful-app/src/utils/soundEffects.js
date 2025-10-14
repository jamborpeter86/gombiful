// Sound effects utility for game events
// Uses Web Audio API for simple, built-in sounds

class SoundManager {
  constructor() {
    this.audioContext = null;
    this.enabled = true;
    this.volume = 0.3; // Default volume (0.0 to 1.0)
  }

  // Initialize audio context (lazy load)
  getAudioContext() {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    }
    return this.audioContext;
  }

  // Generate a beep tone
  playTone(frequency, duration, type = 'sine') {
    if (!this.enabled) return;

    try {
      const ctx = this.getAudioContext();
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.frequency.value = frequency;
      oscillator.type = type;
      gainNode.gain.value = this.volume;

      const now = ctx.currentTime;
      oscillator.start(now);
      
      // Fade out
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);
      oscillator.stop(now + duration);
    } catch (error) {
      console.warn('Audio playback failed:', error);
    }
  }

  // Play multiple tones in sequence
  playSequence(notes, noteDuration = 0.1) {
    if (!this.enabled) return;

    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.playTone(frequency, noteDuration);
      }, index * noteDuration * 1000);
    });
  }

  // Correct answer sound - happy ascending notes
  playCorrect() {
    this.playSequence([523.25, 659.25, 783.99], 0.15); // C5, E5, G5
  }

  // Wrong answer sound - descending sad notes
  playWrong() {
    this.playSequence([440, 392, 349.23], 0.2); // A4, G4, F4
  }

  // Card placement sound - single click
  playCardPlace() {
    this.playTone(880, 0.05, 'square'); // A5
  }

  // Game win sound - triumphant sequence
  playWin() {
    this.playSequence([523.25, 659.25, 783.99, 1046.50], 0.15); // C5, E5, G5, C6
  }

  // Button click sound
  playClick() {
    this.playTone(600, 0.03, 'square');
  }

  // Join/connect sound
  playJoin() {
    this.playSequence([392, 523.25], 0.1); // G4, C5
  }

  // Disconnect sound
  playDisconnect() {
    this.playSequence([523.25, 392], 0.15); // C5, G4
  }

  // Countdown/timer tick
  playTick() {
    this.playTone(1000, 0.05, 'square');
  }

  // Enable/disable sounds
  setEnabled(enabled) {
    this.enabled = enabled;
    // Store preference in localStorage
    localStorage.setItem('soundEnabled', enabled ? 'true' : 'false');
  }

  // Set volume (0.0 to 1.0)
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    localStorage.setItem('soundVolume', this.volume.toString());
  }

  // Load preferences from localStorage
  loadPreferences() {
    const savedEnabled = localStorage.getItem('soundEnabled');
    if (savedEnabled !== null) {
      this.enabled = savedEnabled === 'true';
    }

    const savedVolume = localStorage.getItem('soundVolume');
    if (savedVolume !== null) {
      this.volume = parseFloat(savedVolume);
    }
  }
}

// Create singleton instance
const soundManager = new SoundManager();

// Load saved preferences on init
soundManager.loadPreferences();

export default soundManager;
