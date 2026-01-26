class SoundEngine {
    constructor() {
        this.ctx = null;
        this.meditationOscillators = [];
        this.bgmOscillators = [];
        this.gainNodes = {};
        this.isMuted = localStorage.getItem('health_muted') === 'true';
        this.isMeditationActive = false;
    }

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        // Resume if suspended (browser policy)
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('health_muted', this.isMuted);

        // Stop persistent sounds if muted
        if (this.isMuted) {
            this.stopMeditationAmbience();
            this.stopBackgroundMusic();
        } else {
            // Optional: Restart BGM if we were supposed to be playing it
        }
        return this.isMuted;
    }

    // --- SFX ---

    playClick() {
        if (this.isMuted || !this.ctx) return;
        this.init(); // Ensure context is running

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playSuccess() {
        if (this.isMuted || !this.ctx) return;
        this.init();

        const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
        let time = this.ctx.currentTime;

        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.frequency.value = freq;
            osc.type = 'sine';

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            // Staggered entry
            const startTime = time + (i * 0.1);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.4, startTime + 0.05);
            gain.gain.exponentialRampToValueAtTime(0.001, startTime + 2.0);

            osc.start(startTime);
            osc.stop(startTime + 2.0);
        });
    }

    // --- MEDITATION (Ocean/Wind) ---

    // Generate Brown Noise buffer
    createBrownNoise() {
        const bufferSize = this.ctx.sampleRate * 2; // 2 seconds buffer
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        let lastOut = 0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.02 * white)) / 1.02;
            data[i] = lastOut * 3.5;
            // Compensation to avoid clipping
        }
        return buffer;
    }

    startMeditationAmbience() {
        if (this.isMuted || this.isMeditationActive || !this.ctx) return;
        this.init();
        this.isMeditationActive = true;

        // Create Noise Source
        const noiseBuffer = this.createBrownNoise();
        const noiseSource = this.ctx.createBufferSource();
        noiseSource.buffer = noiseBuffer;
        noiseSource.loop = true;

        // Filter (Lowpass to sound like distant ocean/wind)
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 400; // Deep sound

        // Gain (Volume)
        const gain = this.ctx.createGain();
        gain.gain.value = 0.8;

        // LFO for "Breathing" effect (Volume swell)
        const lfo = this.ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.value = 0.125; // Slow cycle (8 seconds) ~ 4 in 4 out

        const lfoGain = this.ctx.createGain();
        lfoGain.gain.value = 0.3; // Depth of swell

        // Connect: LFO -> LFO Gain -> Main Gain.gain (Audio Param)
        lfo.connect(lfoGain);
        lfoGain.connect(gain.gain);

        // Path: Noise -> Filter -> Gain -> Out
        noiseSource.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        noiseSource.start();
        lfo.start();

        this.meditationNodes = { noiseSource, lfo, gain };

        // Add a gentle pure tone (Sine) for "Zen"
        const zenOsc = this.ctx.createOscillator();
        const zenGain = this.ctx.createGain();
        zenOsc.frequency.value = 110; // A2 (Deep calm tone)
        zenOsc.type = 'sine';
        zenGain.gain.value = 0.1;
        zenOsc.connect(zenGain);
        zenGain.connect(this.ctx.destination);
        zenOsc.start();

        this.meditationNodes.zenOsc = zenOsc;
    }

    stopMeditationAmbience() {
        if (this.meditationNodes) {
            const { noiseSource, lfo, gain, zenOsc } = this.meditationNodes;
            // Fade out
            if (gain) gain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);

            setTimeout(() => {
                if (noiseSource) noiseSource.stop();
                if (lfo) lfo.stop();
                if (zenOsc) zenOsc.stop();
            }, 600);

            this.isMeditationActive = false;
            this.meditationNodes = null;
        }
    }
}

// Export global instance
const soundEngine = new SoundEngine();
