// Pleasant notification sound using Web Audio API
export const playOrderNotificationSound = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();

    // Play a pleasant chord (C-E-G major chord)
    const frequencies = [523.25, 659.25, 783.99]; // C5-E5-G5
    const duration = 0.6;

    frequencies.forEach((freq, index) => {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = freq;
      oscillator.type = 'sine'; // Smooth sine wave

      const startTime = audioContext.currentTime + (index * 0.08);

      // Volume envelope (fade in and out)
      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.15, startTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);

      oscillator.start(startTime);
      oscillator.stop(startTime + duration);
    });

    console.log('🔔 Order notification sound played');
    return true;
  } catch (error) {
    console.error('Error playing notification sound:', error);
    return false;
  }
};

// Initialize audio context (call on user interaction to bypass autoplay policy)
export const initializeAudio = () => {
  try {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    gainNode.gain.value = 0; // Silent

    oscillator.start();
    oscillator.stop(audioContext.currentTime + 0.01);

    console.log('✅ Audio context initialized');
  } catch (error) { // eslint-disable-line no-unused-vars
    console.log('Audio initialization will happen on first interaction');
  }
};