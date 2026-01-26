// --- AI LOGIC ---
const KEYWORDS = {
    food: {
        good: ['salad', 'vegetable', 'fruit', 'water', 'healthy', 'protein', 'chicken', 'fish', 'carrot', 'apple', 'banana', 'home cooked', 'grilled', 'oats', 'eggs', 'rice', 'meal', 'ate', 'dinner', 'lunch', 'breakfast', 'smoothie', 'yogurt', 'steak', 'avocado', 'nuts'],
        bad: ['sugar', 'candy', 'soda', 'coke', 'fast food', 'burger', 'fries', 'cake', 'chocolate', 'processed', 'grease', 'pizza', 'ice cream', 'chips', 'cookie', 'sweets', 'donut', 'mcdonalds']
    },
    screen: {
        good: ['off phone', 'no screen', 'detox', 'touch grass'],
        bad: ['tv', 'netflix', 'tiktok', 'instagram', 'youtube', 'video game', 'played', 'scrolled', 'watch', 'phone', 'computer', 'iPad', 'tablet', 'roblox', 'fortnite', 'minecraft']
    },
    active: {
        good: ['run', 'walk', 'gym', 'hike', 'bike', 'sport', 'basketball', 'soccer', 'outside', 'park', 'sun', 'exercise', 'workout', 'swimming', 'tennis', 'football', 'played outside', 'grass', 'fresh air', 'treadmill', 'lifted', 'weights'],
        bad: ['inside', 'couch', 'bed all day', 'lazy', 'sat', 'stayed in', 'did nothing', 'bored']
    },
    sleep: {
        good: ['slept well', 'rested', 'early', '8 hours', '9 hours', '7 hours', '10 hours', 'nap', 'bedtime'],
        bad: ['tired', 'insomnia', 'late', 'all nighter', '4 hours', '5 hours', '6 hours', 'cloudy', 'sleepy', 'woke up late']
    },
    hydration: {
        good: ['water', 'glass of water', 'bottle', 'hydrated', 'tea', 'drink', 'gallon'],
        bad: ['thirsty', 'dehydrated', 'soda', 'coke', 'pepsi', 'alcohol', 'beer', 'wine', 'dry', 'energy drink']
    },
    mindset: {
        good: ['happy', 'grateful', 'meditate', 'journal', 'calm', 'proud', 'smile', 'laughed', 'friend', 'social', 'family', 'fun', 'love', 'excited', 'productive', 'good day'],
        bad: ['sad', 'stressed', 'angry', 'anxious', 'cried', 'lonely', 'depressed', 'bored', 'mad', 'upset', 'bad day', 'horrible']
    },
    knowledge: {
        good: ['read', 'book', 'studied', 'homework', 'learning', 'painting', 'drawing', 'board game', 'lego', 'math', 'science', 'coding', 'history', 'school', 'class', 'piano', 'guitar', 'practice', 'skill', 'course'],
        bad: ['procrastinated', 'distracted', 'skipped', 'forgot']
    }
};

function analyzeEntry(text) {
    const lowerText = text.toLowerCase();
    let scores = { food: 0, screen: 0, active: 0, sleep: 0, hydration: 0, mindset: 0, knowledge: 0 };
    let mentions = { food: false, screen: false, active: false, sleep: false, hydration: false, mindset: false, knowledge: false };

    // 1. KEYWORD SCORING
    for (const category in KEYWORDS) {
        const catData = KEYWORDS[category];
        catData.good.forEach(word => {
            if (lowerText.includes(word)) {
                if (category === 'screen') scores[category] = 5;
                else scores[category] += 2.5;
                mentions[category] = true;
            }
        });
        catData.bad.forEach(word => {
            if (lowerText.includes(word)) {
                if (category === 'screen') scores[category] += 1;
                else scores[category] -= 2.0;
                mentions[category] = true;
            }
        });
    }

    // 2. DURATION LOGIC
    // A. ACTIVE TIME
    const activeMatch = lowerText.match(/(\d+)\s*(hours?|hr|mins?|minutes?)\s*.*(run|walk|gym|hike|bike|sport|exercise|workout|played)/);
    if (activeMatch) {
        mentions.active = true;
        const amount = parseInt(activeMatch[1]);
        const unit = activeMatch[2];
        let minutes = amount;
        if (unit.startsWith('h')) minutes = amount * 60;
        if (minutes >= 90) scores.active = 6;
        else if (minutes >= 45) scores.active = 5;
        else if (minutes >= 30) scores.active = 4;
        else scores.active = 3;
    }
    // B. SLEEP
    const sleepMatch = lowerText.match(/(\d+)\s*hours?\s*(sleep|slept)/);
    if (sleepMatch) {
        mentions.sleep = true;
        const hours = parseInt(sleepMatch[1]);
        if (hours >= 9) scores.sleep = 6;
        else if (hours >= 7) scores.sleep = 5;
        else if (hours >= 5) scores.sleep = 3;
        else scores.sleep = 1;
    }
    // C. KNOWLEDGE
    const studyMatch = lowerText.match(/(\d+)\s*(hours?|hr|mins?|minutes?)\s*.*(read|study|studied|homework|learn|practic)/);
    if (studyMatch) {
        mentions.knowledge = true;
        const amount = parseInt(studyMatch[1]);
        const unit = studyMatch[2];
        let minutes = amount;
        if (unit.startsWith('h')) minutes = amount * 60;
        if (minutes >= 60) scores.knowledge = 5;
        else if (minutes >= 30) scores.knowledge = 4;
        else scores.knowledge = 3;
    }
    // D. SCREEN
    const screenMatch = lowerText.match(/(\d+)\s*(hours?|hr|mins?|minutes?)\s*.*(game|tv|phone|screen|played|watch)/);
    if (screenMatch) {
        mentions.screen = true;
        const amount = parseInt(screenMatch[1]);
        const unit = screenMatch[2];
        let minutes = amount;
        if (unit.startsWith('h')) minutes = amount * 60;
        if (minutes <= 120) scores.screen = 5.0;
        else if (minutes <= 180) scores.screen = 3.5;
        else if (minutes <= 240) scores.screen = 2.0;
        else scores.screen = 0.5;
    } else if (mentions.screen) {
        let val = scores.screen;
        if (val > 2) scores.screen = 3.0;
        else scores.screen = 4.0;
    }
    // E. HYDRATION
    if (lowerText.match(/(\d+)\s*(liters?|gallons?)/)) {
        mentions.hydration = true;
        scores.hydration = 5.0;
    }
    const glassMatch = lowerText.match(/(\d+)\s*(glasses?|cups?|bottles?)/);
    if (glassMatch) {
        mentions.hydration = true;
        const count = parseInt(glassMatch[1]);
        if (count >= 5) scores.hydration = 5.0;
        else scores.hydration = 3.0;
    }

    // 3. FINAL CLAMPING
    for (const key in scores) {
        if (!mentions[key]) {
            scores[key] = 0;
        } else {
            if (scores[key] > 5) scores[key] = 5;
            if (scores[key] <= 0) scores[key] = 0.5;
        }
    }

    // 4. OVERALL SCORE
    let totalPoints = 0;
    const categories = Object.keys(scores);
    const maxPossible = categories.length * 5;

    categories.forEach(key => {
        if (mentions[key]) {
            totalPoints += scores[key];
        } else {
            totalPoints += 0; // STRICT: 0 points for unmentioned
        }
    });

    let overallPercent = Math.round((totalPoints / maxPossible) * 100);

    return {
        overall: overallPercent,
        categories: scores,
        mentions: mentions
    };
}

// --- SOUND ENGINE ---
window.soundEngine = {
    ctx: null,
    isMuted: localStorage.getItem('health_muted') === 'true',

    init() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.ctx = new AudioContext();
        }
        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    },

    playClick() {
        if (this.isMuted) return;
        this.init();

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.value = 800;
        gain.gain.value = 0.3;

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    },

    playSuccess() {
        if (this.isMuted) return;
        this.init();

        const notes = [523, 659, 784, 1047];
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            const time = this.ctx.currentTime + (i * 0.15);
            osc.frequency.value = freq;
            gain.gain.value = 0.2;

            osc.start(time);
            osc.stop(time + 0.3);
        });
    },

    bgmInterval: null,
    meditationInterval: null,
    beatInterval: null,

    startBackgroundMusic() {
        if (this.isMuted || this.bgmInterval) return;
        this.init();

        // Calm chord progression: C - Am - F - G
        const chords = [
            [261.63, 329.63, 392.00], // C major
            [220.00, 261.63, 329.63], // A minor
            [174.61, 220.00, 261.63], // F major
            [196.00, 246.94, 293.66]  // G major
        ];

        let chordIndex = 0;
        let beatCount = 0;

        const playChord = () => {
            if (this.isMuted) return;

            const chord = chords[chordIndex];
            chord.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.08, this.ctx.currentTime + 0.1);
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime + 2.5);
                gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 3);
            });

            chordIndex = (chordIndex + 1) % chords.length;
        };

        // Soft percussion beat
        const playBeat = () => {
            if (this.isMuted) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            // More varied beat pattern
            const beatPattern = beatCount % 8;
            if (beatPattern === 0 || beatPattern === 4) {
                osc.frequency.value = 60; // Kick
                gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
            } else if (beatPattern === 2 || beatPattern === 6) {
                osc.frequency.value = 150; // Snare
                gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
            } else {
                osc.frequency.value = 200; // Hi-hat
                gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
            }

            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);

            beatCount++;
        };

        playChord();
        this.bgmInterval = setInterval(playChord, 3000);
        this.beatInterval = setInterval(playBeat, 375); // 160 BPM
    },

    stopBackgroundMusic() {
        if (this.bgmInterval) {
            clearInterval(this.bgmInterval);
            this.bgmInterval = null;
        }
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }
    },

    startMeditationAmbience() {
        if (this.isMuted || this.meditationInterval) return;
        this.init();
        this.stopBackgroundMusic();

        // Higher, lighter meditation tones (not deep)
        const meditationChords = [
            [261.63, 329.63, 392.00], // C major - same as background
            [293.66, 349.23, 440.00], // D major
            [246.94, 293.66, 369.99]  // B major
        ];

        let toneIndex = 0;
        let meditationBeatCount = 0;

        const playMeditationTone = () => {
            if (this.isMuted) return;

            const tones = meditationChords[toneIndex];
            tones.forEach((freq, i) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                osc.frequency.value = freq;

                // Gentle fade in/out
                gain.gain.setValueAtTime(0, this.ctx.currentTime);
                gain.gain.linearRampToValueAtTime(0.1, this.ctx.currentTime + 0.3);
                gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 3);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start();
                osc.stop(this.ctx.currentTime + 3);
            });

            toneIndex = (toneIndex + 1) % meditationChords.length;
        };

        // Meditation beats - kick, snare, hi-hat pattern
        const playMeditationBeat = () => {
            if (this.isMuted) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'triangle';
            const beatPattern = meditationBeatCount % 8;

            if (beatPattern === 0 || beatPattern === 4) {
                osc.frequency.value = 70; // Kick
                gain.gain.setValueAtTime(0.18, this.ctx.currentTime);
            } else if (beatPattern === 2 || beatPattern === 6) {
                osc.frequency.value = 160; // Snare
                gain.gain.setValueAtTime(0.13, this.ctx.currentTime);
            } else {
                osc.frequency.value = 210; // Hi-hat
                gain.gain.setValueAtTime(0.07, this.ctx.currentTime);
            }

            gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start();
            osc.stop(this.ctx.currentTime + 0.1);

            meditationBeatCount++;
        };

        playMeditationTone();
        this.meditationInterval = setInterval(playMeditationTone, 3000);
        // Removed beat for more peaceful meditation
        // this.beatInterval = setInterval(playMeditationBeat, 300);
    },

    stopMeditationAmbience() {
        if (this.meditationInterval) {
            clearInterval(this.meditationInterval);
            this.meditationInterval = null;
        }
        if (this.beatInterval) {
            clearInterval(this.beatInterval);
            this.beatInterval = null;
        }
        if (!this.isMuted) {
            this.startBackgroundMusic();
        }
    },

    toggleMute() {
        this.isMuted = !this.isMuted;
        localStorage.setItem('health_muted', this.isMuted);

        if (this.isMuted) {
            this.stopBackgroundMusic();
            this.stopMeditationAmbience();
        } else {
            this.startBackgroundMusic();
        }

        return this.isMuted;
    }
};


// --- APP LOGIC ---

// --- SAFE PARSE HELPER ---
function safeJSON(key, fallback) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : fallback;
    } catch (e) {
        console.error("Corrupt Data for", key, e);
        return fallback;
    }
}

const state = {
    theme: localStorage.getItem('health_theme') || 'theme-light',
    history: safeJSON('health_history', []),
    today: new Date().toLocaleDateString(),
    streakResetDate: localStorage.getItem('health_streak_reset') ? new Date(localStorage.getItem('health_streak_reset')) : null,
    meditationActive: false,
    meditationPhase: 'ready', // ready, inhale, hold, exhale
    meditationTime: 60, // seconds
    unlockedBadges: safeJSON('health_badges', []),
    goals: safeJSON('health_goals', []), // NEW: Weekly goals
    meditationDates: safeJSON('health_meditation_dates', []) // NEW: Track meditation days for Zen Streak
};

let meditationInterval = null;
let breathingInterval = null;

// --- CONFIG ---
// SMART CHIPS - Organized by Category
const SMART_CHIPS = [
    // FOOD & NUTRITION
    { label: "Drank Water", icon: "fa-glass-water", text: "Drank water 💧", category: "food" },
    { label: "Ate Salad", icon: "fa-leaf", text: "Ate a healthy salad 🥗", category: "food" },
    { label: "Fruit", icon: "fa-apple-whole", text: "Ate fruit 🍎", category: "food" },
    { label: "Home Cooked", icon: "fa-utensils", text: "Made a home-cooked meal 🍳", category: "food" },
    { label: "Protein", icon: "fa-drumstick-bite", text: "Ate protein (chicken/fish/eggs) 🍗", category: "food" },
    { label: "Breakfast", icon: "fa-mug-saucer", text: "Had a healthy breakfast ☕", category: "food" },

    // EXERCISE & ACTIVITY
    { label: "Run/Walk", icon: "fa-person-running", text: "Went for a run/walk 🏃", category: "active" },
    { label: "Gym", icon: "fa-dumbbell", text: "Hit the gym 💪", category: "active" },
    { label: "Yoga", icon: "fa-spa", text: "Did yoga 🧘", category: "active" },
    { label: "Sports", icon: "fa-basketball", text: "Played sports 🏀", category: "active" },
    { label: "Bike Ride", icon: "fa-bicycle", text: "Went for a bike ride 🚴", category: "active" },
    { label: "Stretching", icon: "fa-person-walking", text: "Did stretching exercises 🤸", category: "active" },

    // SLEEP & REST
    { label: "Good Sleep", icon: "fa-bed", text: "Slept 8 hours 😴", category: "sleep" },
    { label: "Early Bedtime", icon: "fa-moon", text: "Went to bed early 🌙", category: "sleep" },
    { label: "Nap", icon: "fa-bed-pulse", text: "Took a refreshing nap 💤", category: "sleep" },

    // LEARNING & PRODUCTIVITY
    { label: "Read Book", icon: "fa-book", text: "Read a book 📖", category: "knowledge" },
    { label: "Studied", icon: "fa-graduation-cap", text: "Studied/did homework 📚", category: "knowledge" },
    { label: "Learned Skill", icon: "fa-lightbulb", text: "Learned something new 💡", category: "knowledge" },
    { label: "Productive Work", icon: "fa-laptop", text: "Had a productive work session 💻", category: "knowledge" },
    { label: "Creative", icon: "fa-palette", text: "Did something creative (art/music) 🎨", category: "knowledge" },

    // MINDSET & SOCIAL
    { label: "Meditated", icon: "fa-om", text: "Meditated 🧘", category: "mindset" },
    { label: "Grateful", icon: "fa-heart", text: "Feeling grateful ❤️", category: "mindset" },
    { label: "Friends", icon: "fa-user-group", text: "Spent time with friends 👥", category: "mindset" },
    { label: "Family Time", icon: "fa-house-heart", text: "Quality time with family 👨‍👩‍👧", category: "mindset" },
    { label: "Helped Someone", icon: "fa-hand-holding-heart", text: "Helped someone today 🤝", category: "mindset" },
    { label: "Journaled", icon: "fa-pen", text: "Wrote in my journal ✍️", category: "mindset" },

    // SCREEN TIME
    { label: "No Phone", icon: "fa-mobile-screen-button", text: "Stayed off my phone 📵", category: "screen" },
    { label: "Screen Break", icon: "fa-eye-slash", text: "Took screen breaks 👀", category: "screen" },
    { label: "Outside Time", icon: "fa-tree", text: "Spent time outside 🌳", category: "screen" }
];

const NEGATIVE_CHIPS = [
    // FOOD
    { label: "Junk Food", icon: "fa-burger", text: "Ate junk food 🍔", category: "food" },
    { label: "Soda/Sugar", icon: "fa-candy-cane", text: "Drank soda / ate sweets 🍬", category: "food" },
    { label: "Skipped Meal", icon: "fa-ban", text: "Skipped a meal 🚫", category: "food" },

    // SCREEN TIME
    { label: "Too Much TV", icon: "fa-tv", text: "Watched too much TV 📺", category: "screen" },
    { label: "Phone Scroll", icon: "fa-mobile", text: "Doomscrolled on phone 📱", category: "screen" },
    { label: "Video Games", icon: "fa-gamepad", text: "Played video games all day 🎮", category: "screen" },

    // ACTIVITY
    { label: "Lazy", icon: "fa-couch", text: "Laid on couch all day 🛋️", category: "active" },
    { label: "No Exercise", icon: "fa-person-walking-dashed-line-arrow-right", text: "Didn't exercise 😞", category: "active" },

    // SLEEP
    { label: "Bad Sleep", icon: "fa-face-dizzy", text: "Slept poorly 😫", category: "sleep" },
    { label: "Up Late", icon: "fa-clock", text: "Stayed up way too late 🦉", category: "sleep" },

    // MINDSET
    { label: "Stressed", icon: "fa-face-frown", text: "Felt stressed/anxious 😰", category: "mindset" },
    { label: "Procrastinated", icon: "fa-hourglass-end", text: "Procrastinated all day ⏰", category: "mindset" }
];

const ACHIEVEMENTS = [
    { id: 'first_step', icon: 'fa-flag', title: 'First Step', desc: 'Log your first journal entry.' },
    { id: 'streak_3', icon: 'fa-fire', title: 'On Fire', desc: 'Reach a 3-day streak.' },
    { id: 'streak_7', icon: 'fa-fire-flame-curved', title: 'Unstoppable', desc: 'Reach a 7-day streak.' },
    { id: 'hydration_hero', icon: 'fa-glass-water', title: 'Hydration Hero', desc: 'Score 5/5 on Hydration.' },
    { id: 'zen_master', icon: 'fa-spa', title: 'Zen Master', desc: 'Complete a meditation session.' },
    { id: 'bookworm', icon: 'fa-book-open', title: 'Bookworm', desc: 'Score 5/5 on Knowledge.' },
    // NEW ACHIEVEMENTS
    { id: 'early_bird', icon: 'fa-sun', title: 'Early Bird', desc: 'Log before 9am.' },
    { id: 'night_owl', icon: 'fa-moon', title: 'Night Owl', desc: 'Log after 10pm.' },
    { id: 'balanced', icon: 'fa-scale-balanced', title: 'Balanced', desc: 'Score 4+ in all categories.' },
    { id: 'perfectionist', icon: 'fa-star', title: 'Perfectionist', desc: 'Score 90+ overall.' },
    { id: 'comeback_kid', icon: 'fa-arrow-rotate-left', title: 'Comeback Kid', desc: 'Return after 7+ day break.' },
    { id: 'marathon', icon: 'fa-trophy', title: 'Marathon', desc: 'Reach a 30-day streak.' },
    { id: 'hydration_king', icon: 'fa-droplet', title: 'Hydration King', desc: '7 days of 5/5 hydration.' },
    { id: 'fitness_fanatic', icon: 'fa-dumbbell', title: 'Fitness Fanatic', desc: '7 days of 5/5 active.' },
    { id: 'scholar', icon: 'fa-graduation-cap', title: 'Scholar', desc: '7 days of 5/5 knowledge.' },
    { id: 'zen_streak', icon: 'fa-om', title: 'Zen Streak', desc: 'Meditate 3 days in a row.' }
];

const app = document.getElementById('app');

// --- HELPERS ---

function checkAchievements(result = null) {
    const newBadges = [];
    const currentBadges = new Set(state.unlockedBadges);

    // 1. First Step
    if (state.history.length > 0 && !currentBadges.has('first_step')) {
        newBadges.push('first_step');
    }

    // 2. Streaks
    const streak = calculateStreak();
    if (streak >= 3 && !currentBadges.has('streak_3')) newBadges.push('streak_3');
    if (streak >= 7 && !currentBadges.has('streak_7')) newBadges.push('streak_7');
    if (streak >= 30 && !currentBadges.has('marathon')) newBadges.push('marathon'); // NEW

    // 3. Result based (runs only if we just analyzed)
    if (result) {
        if (result.categories.hydration >= 5 && !currentBadges.has('hydration_hero')) newBadges.push('hydration_hero');
        if (result.categories.knowledge >= 5 && !currentBadges.has('bookworm')) newBadges.push('bookworm');

        // NEW: Perfectionist
        if (result.overall >= 90 && !currentBadges.has('perfectionist')) newBadges.push('perfectionist');

        // NEW: Balanced
        const cats = result.categories;
        if (cats.food >= 4 && cats.hydration >= 4 && cats.screen >= 4 &&
            cats.sleep >= 4 && cats.active >= 4 && cats.mindset >= 4 &&
            cats.knowledge >= 4 && !currentBadges.has('balanced')) {
            newBadges.push('balanced');
        }

        // NEW: Early Bird / Night Owl (check current time)
        const now = new Date();
        const hour = now.getHours();
        if (hour < 9 && !currentBadges.has('early_bird')) newBadges.push('early_bird');
        if (hour >= 22 && !currentBadges.has('night_owl')) newBadges.push('night_owl');
    }

    // 4. NEW: Comeback Kid (return after 7+ day break)
    if (state.history.length >= 2 && !currentBadges.has('comeback_kid')) {
        const sortedHistory = [...state.history].sort((a, b) => new Date(b.date) - new Date(a.date));
        if (sortedHistory.length >= 2) {
            const lastEntry = new Date(sortedHistory[0].date);
            const secondLastEntry = new Date(sortedHistory[1].date);
            const daysDiff = Math.floor((lastEntry - secondLastEntry) / (1000 * 60 * 60 * 24));
            if (daysDiff >= 7) newBadges.push('comeback_kid');
        }
    }

    // 5. NEW: 7-day category streaks (Hydration King, Fitness Fanatic, Scholar)
    if (!currentBadges.has('hydration_king') || !currentBadges.has('fitness_fanatic') || !currentBadges.has('scholar')) {
        const last7Days = state.history.slice(-7);
        if (last7Days.length >= 7) {
            // Hydration King
            if (!currentBadges.has('hydration_king') && last7Days.every(e => e.result.categories.hydration >= 5)) {
                newBadges.push('hydration_king');
            }
            // Fitness Fanatic
            if (!currentBadges.has('fitness_fanatic') && last7Days.every(e => e.result.categories.active >= 5)) {
                newBadges.push('fitness_fanatic');
            }
            // Scholar
            if (!currentBadges.has('scholar') && last7Days.every(e => e.result.categories.knowledge >= 5)) {
                newBadges.push('scholar');
            }
        }
    }

    // 6. NEW: Zen Streak (meditate 3 days in a row)
    if (!currentBadges.has('zen_streak') && state.meditationDates.length >= 3) {
        const sortedDates = [...state.meditationDates].sort((a, b) => new Date(b) - new Date(a));
        let consecutiveDays = 1;
        for (let i = 0; i < sortedDates.length - 1; i++) {
            const current = new Date(sortedDates[i]).setHours(0, 0, 0, 0);
            const next = new Date(sortedDates[i + 1]).setHours(0, 0, 0, 0);
            const dayDiff = (current - next) / (1000 * 60 * 60 * 24);
            if (dayDiff === 1) {
                consecutiveDays++;
                if (consecutiveDays >= 3) {
                    newBadges.push('zen_streak');
                    break;
                }
            } else {
                break;
            }
        }
    }

    if (newBadges.length > 0) {
        state.unlockedBadges = [...state.unlockedBadges, ...newBadges];
        localStorage.setItem('health_badges', JSON.stringify(state.unlockedBadges));

        // Show achievement with confetti animation
        newBadges.forEach(badgeId => {
            const achievement = ACHIEVEMENTS.find(a => a.id === badgeId);
            if (achievement) {
                showAchievementUnlock(achievement);
            }
        });
    }
}

// --- NEW: CELEBRATION ANIMATIONS ---

function showAchievementUnlock(achievement) {
    // Play success sound
    if (window.soundEngine) window.soundEngine.playSuccess();

    // Create confetti
    createConfetti();

    // Show achievement popup
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-content">
            <i class="fa-solid ${achievement.icon}" style="font-size: 48px; color: #fbbf24; margin-bottom: 16px;"></i>
            <h2>Achievement Unlocked!</h2>
            <h3>${achievement.title}</h3>
            <p>${achievement.desc}</p>
        </div>
    `;
    document.body.appendChild(popup);

    // Remove after 4 seconds
    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 4000);
}

function createConfetti() {
    const colors = ['#60a5fa', '#34d399', '#fbbf24', '#f87171', '#c4b5fd'];
    const confettiCount = 50;

    for (let i = 0; i < confettiCount; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        document.body.appendChild(confetti);

        setTimeout(() => confetti.remove(), 4000);
    }
}

function showLevelUpAnimation(newLevel) {
    const popup = document.createElement('div');
    popup.className = 'level-up-popup';
    popup.innerHTML = `
        <div class="level-up-content">
            <h1 style="font-size: 72px; margin: 0;">⬆️</h1>
            <h2>LEVEL UP!</h2>
            <p style="font-size: 36px; font-weight: bold; color: var(--accent);">Level ${newLevel}</p>
        </div>
    `;
    document.body.appendChild(popup);

    createConfetti();
    if (window.soundEngine) window.soundEngine.playSuccess();

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 3000);
}

function showStreakCelebration(streak) {
    if (streak === 3 || streak === 7 || streak === 14 || streak === 30) {
        const popup = document.createElement('div');
        popup.className = 'streak-popup';
        popup.innerHTML = `
            <div class="streak-content">
                <h1 style="font-size: 72px; margin: 0;">🔥</h1>
                <h2>${streak}-Day Streak!</h2>
                <p>You're on fire! Keep it going!</p>
            </div>
        `;
        document.body.appendChild(popup);

        createConfetti();
        if (window.soundEngine) window.soundEngine.playSuccess();

        setTimeout(() => {
            popup.style.opacity = '0';
            setTimeout(() => popup.remove(), 500);
        }, 3000);
    }
}

// --- NEW: TREND ANALYSIS ---

function calculateTrends() {
    if (state.history.length < 2) return null;

    const last7Days = state.history.slice(-7);
    const previous7Days = state.history.slice(-14, -7);

    if (last7Days.length < 2) return null;

    const trends = {};
    const categories = ['food', 'hydration', 'screen', 'sleep', 'active', 'mindset', 'knowledge'];

    categories.forEach(cat => {
        const recentAvg = last7Days.reduce((sum, e) => sum + (e.result.categories[cat] || 0), 0) / last7Days.length;
        const previousAvg = previous7Days.length > 0
            ? previous7Days.reduce((sum, e) => sum + (e.result.categories[cat] || 0), 0) / previous7Days.length
            : recentAvg;

        const change = recentAvg - previousAvg;
        const changePercent = previousAvg > 0 ? ((change / previousAvg) * 100).toFixed(0) : 0;

        trends[cat] = {
            current: recentAvg.toFixed(1),
            change: change.toFixed(1),
            changePercent: changePercent,
            direction: change > 0.3 ? 'up' : change < -0.3 ? 'down' : 'stable'
        };
    });

    return trends;
}

// --- NEW: MONTHLY SUMMARY ---

function getMonthlySummary() {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    const thisMonthEntries = state.history.filter(e => {
        const entryDate = new Date(e.date);
        return entryDate.getMonth() === currentMonth && entryDate.getFullYear() === currentYear;
    });

    if (thisMonthEntries.length === 0) return null;

    const categories = ['food', 'hydration', 'screen', 'sleep', 'active', 'mindset', 'knowledge'];
    const averages = {};

    categories.forEach(cat => {
        const avg = thisMonthEntries.reduce((sum, e) => sum + (e.result.categories[cat] || 0), 0) / thisMonthEntries.length;
        averages[cat] = avg.toFixed(1);
    });

    const overallAvg = thisMonthEntries.reduce((sum, e) => sum + e.result.overall, 0) / thisMonthEntries.length;
    const totalXP = thisMonthEntries.reduce((sum, e) => sum + (e.lockedXP || e.result.overall), 0);

    const bestDay = thisMonthEntries.reduce((best, e) =>
        (e.result.overall > best.result.overall) ? e : best
    );
    const worstDay = thisMonthEntries.reduce((worst, e) =>
        (e.result.overall < worst.result.overall) ? e : worst
    );

    return {
        daysLogged: thisMonthEntries.length,
        overallAvg: overallAvg.toFixed(0),
        totalXP: totalXP,
        averages: averages,
        bestDay: { date: bestDay.date, score: bestDay.result.overall },
        worstDay: { date: worstDay.date, score: worstDay.result.overall }
    };
}

function getMotivationalQuote(score) {

    if (score >= 90) return "You are CRUSHING it! Keep this momentum going! 🔥";
    if (score >= 70) return "Great job! You're making healthy choices. 💪";
    if (score >= 40) return "Good effort. Small steps every day lead to big changes. 🌱";
    return "Tomorrow is a new start. Focus on sleep and water first! 💙";
}

function normalizeDate(dateStr) {
    return new Date(dateStr).setHours(0, 0, 0, 0);
}

function calculateStreak() {
    if (state.history.length === 0) return 0;

    // Check reset date
    const resetTime = state.streakResetDate ? new Date(state.streakResetDate).getTime() : 0;

    // Filter history to only include entries AFTER the reset
    const validHistory = state.history.filter(entry => {
        // Robust Check: Use timestamp if available
        if (entry.timestamp) {
            return entry.timestamp > resetTime;
        }
        // Fallback for old entries (Compare End of Day)
        const entryEndDay = new Date(entry.date).setHours(23, 59, 59);
        return entryEndDay > resetTime;
    });

    if (validHistory.length === 0) return 0;

    const uniqueDays = [];
    const seen = new Set();
    const sortedHistory = [...validHistory].sort((a, b) => new Date(b.date) - new Date(a.date));

    for (const entry of sortedHistory) {
        const normed = normalizeDate(entry.date);
        if (!seen.has(normed)) {
            uniqueDays.push(normed);
            seen.add(normed);
        }
    }

    if (uniqueDays.length === 0) return 0;

    const todayNorm = normalizeDate(new Date());
    const yesterdayNorm = todayNorm - 86400000;
    const lastEntryDate = uniqueDays[0];

    // If latest valid entry is neither today nor yesterday, streak is broken.
    if (lastEntryDate !== todayNorm && lastEntryDate !== yesterdayNorm) return 0;

    let streak = 0;
    let currentCheck = lastEntryDate;

    for (let i = 0; i < uniqueDays.length; i++) {
        if (uniqueDays[i] === currentCheck) {
            streak++;
            currentCheck -= 86400000;
        } else break;
    }
    return streak;
}

// XP SYSTEM
function calculateXP() {
    // Sum of all LOCKED scores (first entry of the day)
    return state.history.reduce((total, entry) => {
        // Fallback to result.overall for old entries before this update
        const xp = entry.lockedXP !== undefined ? entry.lockedXP : entry.result.overall;
        return total + xp;
    }, 0);
}

function getLevelInfo() {
    const totalXP = calculateXP();
    const xpPerLevel = 500;

    // Level 1 starts at 0 XP. 
    // Level = floor(XP / 500) + 1
    const level = Math.floor(totalXP / xpPerLevel) + 1;

    // XP towards next level
    const currentLevelXP = totalXP % xpPerLevel;
    const percent = Math.round((currentLevelXP / xpPerLevel) * 100);

    return {
        level: level,
        totalXP: totalXP,
        currentXP: currentLevelXP,
        nextLevelXP: xpPerLevel,
        percent: percent
    };
}

// --- VIEWS ---

const ViewOnboarding = () => `
    <div class="screen active">
        <h1>Welcome to Health AI</h1>
        <p>Choose your style to get started.</p>
        <div class="theme-grid">
            <div class="theme-option t-light" data-theme="theme-light">Light</div>
            <div class="theme-option t-dark" data-theme="theme-dark">Dark</div>
            <div class="theme-option t-tokyo" data-theme="theme-tokyo">Tokyo Night</div>
            <div class="theme-option t-tan" data-theme="theme-tan">Tan</div>
        </div>
        <button class="btn" id="btn-finish-setup" style="margin-top: 24px;">Start Journaling</button>
    </div>
`;

const ViewEntry = () => {
    const existingEntry = state.history.find(e => e.date === state.today);
    const lvl = getLevelInfo();

    const statusHeader = existingEntry ?
        `<p style="color:var(--success); font-weight:bold;"><i class="fa-solid fa-lock"></i> XP Locked for Today</p>`
        :
        `<p style="color:var(--accent); font-weight:bold;"><i class="fa-solid fa-lock-open"></i> XP Unlocked</p>`;

    const textAreaVal = existingEntry ? existingEntry.text : '';
    const placeHolder = existingEntry ? "" : "Tap chips above or type here... Example: I hiked for 2 hours...";

    const entryContent = `
        ${statusHeader}
        
        <!-- Smart Chips - Organized by Category -->
        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">🍎 Food & Nutrition</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'food').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">💪 Exercise & Activity</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'active').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">😴 Sleep & Rest</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'sleep').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">📚 Learning & Productivity</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'knowledge').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">❤️ Mindset & Social</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'mindset').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">📵 Screen Time</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'screen').map(chip => `
                    <div class="chip" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <!-- Negative Chips Section -->
        <div style="margin-top: 24px; margin-bottom: 16px;">
            <h4 style="color: var(--danger); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">⚠️ Things to Avoid</h4>
            <div class="chip-container">
                ${NEGATIVE_CHIPS.map(chip => `
                    <div class="chip negative" data-text="${chip.text}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <textarea id="journal-input" placeholder="${placeHolder}">${textAreaVal}</textarea>
    `;

    return `
    <div class="screen active">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
            <h2>Daily Journal</h2>
            <div style="display:flex; gap:10px; align-items:center;">
                <div class="streak-badge">
                    <i class="fa-solid fa-fire"></i> ${calculateStreak()}
                    <i id="btn-reset-streak" class="fa-solid fa-trash" style="margin-left:8px; cursor:pointer; color:var(--text-muted); font-size:12px;"></i>
                </div>
                <button id="btn-settings-small" style="background:none; border:none; color:var(--text-muted); font-size:20px;"><i class="fa-solid fa-gear"></i></button>
            </div>
        </div>

        <!-- Level Banner -->
        <div class="level-container">
            <div class="level-header">
                <span>Level ${lvl.level}</span>
                <span style="font-size:14px; color:var(--text-muted);">${lvl.totalXP} XP</span>
            </div>
            <div class="xp-bar-bg">
                <div class="xp-bar-fill" style="width: ${lvl.percent}%"></div>
            </div>
            <div class="xp-text">${lvl.currentXP} / ${lvl.nextLevelXP} XP to Level ${lvl.level + 1}</div>
        </div>
        
        <div class="card">
            <p style="color:var(--text-muted); font-size:14px;">${state.today}</p>
            ${entryContent}
        </div>
        <div style="display:flex; gap:10px; margin-bottom:12px;">
            <button class="btn" id="btn-analyze" style="flex:2;">${existingEntry ? 'Update Entry (XP Locked 🔒)' : 'Analyze Day'}</button>
            <button class="btn" id="btn-meditate-view" style="flex:1; background-color:var(--success);"><i class="fa-solid fa-spa"></i></button>
        </div>
        <div style="display:flex; gap:10px; margin-bottom:12px;">
            <button class="btn" id="btn-history" style="flex:1; background-color:var(--bg-input); color:var(--text-main);">View History</button>
            <button class="btn" id="btn-monthly" style="flex:1; background-color:var(--bg-input); color:var(--text-main);">📊 Monthly</button>
        </div>
    </div>
    `;
};

const ViewDashboard = (result) => {
    // Check if locked
    const entry = state.history.find(e => e.date === state.today);
    const xpLocked = entry && entry.lockedXP !== undefined;
    const finalXP = xpLocked ? entry.lockedXP : result.overall; // Fallback

    return `
    <div class="screen active">
        <h2>Results</h2>
        <div class="card" style="text-align:center;">
            <p>Overall Health Score</p>
            <div class="score-big">${result.overall}%</div>
            
            <div style="margin-bottom:16px; color:var(--accent); font-weight:bold; animation: fadeIn 1s;">
                ${xpLocked
            ? `<span style="color:var(--text-muted); font-size:14px;">(Daily XP Locked: ${finalXP})</span>`
            : `+ ${finalXP} XP Earned!`}
            </div>

            <div class="quote-box">"${getMotivationalQuote(result.overall)}"</div>
            <div class="progress-container"><div class="progress-fill" style="width: ${result.overall}%"></div></div>
            ${result.overall < 50 ? '<p style="font-size:12px; color:var(--text-muted); margin-top:10px;">(Include more details for a higher score!)</p>' : ''}
        </div>
        <div class="card">
            <h3>Breakdown</h3>
            ${renderCategory('Food & Diet', result.categories.food, 'fa-utensils', result.mentions.food)}
            ${renderCategory('Hydration', result.categories.hydration, 'fa-glass-water', result.mentions.hydration)}
            ${renderCategory('Screen Time', result.categories.screen, 'fa-mobile-screen', result.mentions.screen)}
            ${renderCategory('Sleep Quality', result.categories.sleep, 'fa-bed', result.mentions.sleep)}
            ${renderCategory('Active Time', result.categories.active, 'fa-person-running', result.mentions.active)}
            ${renderCategory('Mindset', result.categories.mindset, 'fa-brain', result.mentions.mindset)}
            ${renderCategory('Knowledge', result.categories.knowledge, 'fa-book-open', result.mentions.knowledge)}
        </div>
        ${renderTrends()}
        <button class="btn" id="btn-home" style="background-color: var(--bg-input); color: var(--text-main);">Back to Journal</button>
    </div>
    `;
};

const ViewMeditation = () => `
    <div class="screen active meditation-theme">
        <div style="display:flex; justify-content:space-between; align-items:center;">
             <h2>Meditation</h2>
             <button id="btn-close-meditation" style="background:none; border:none; font-size:24px; color:var(--text-muted); cursor:pointer;">&times;</button>
        </div>
        
        <div class="meditation-container">
            <div class="meditation-timer" id="timer-display">01:00</div>
            
            <div class="breathing-circle" id="breath-circle">
                <i class="fa-solid fa-spa" style="font-size: 64px; color: white; opacity:0.8;"></i>
            </div>
            
            <div class="breath-text" id="breath-instruction">Tap Start</div>
            
            <div style="margin-top:40px; width:100%; display:flex; gap:10px;">
                <button class="btn" id="btn-start-meditation">Start</button>
            </div>
             <p style="margin-top:20px; color:var(--text-muted); font-size:14px;">Follow the circle. Breathe in as it expands, out as it shrinks.</p>
        </div>
    </div>
`;

const ViewHistory = () => {
    const uniqueDays = {};
    state.history.forEach(entry => uniqueDays[entry.date] = entry);
    const entries = Object.values(uniqueDays).sort((a, b) => new Date(a.date) - new Date(b.date)).slice(-7);
    const barsHtml = entries.map(entry => {
        const d = new Date(entry.date);
        const dayName = d.toLocaleDateString('en-US', { weekday: 'short' });
        // FIXED: Use Locked XP if available, so history doesn't fluctuate
        const score = entry.lockedXP !== undefined ? entry.lockedXP : entry.result.overall;
        const isToday = entry.date === state.today;

        let colorClass = 'high';
        if (score < 40) colorClass = 'low';
        else if (score < 70) colorClass = 'mid';

        return `
            <div class="graph-bar-group">
                <div class="graph-score-label">${score}</div>
                <div class="graph-bar ${colorClass}" style="height: ${score}%;"></div>
                <div class="graph-label" style="${isToday ? 'font-weight:bold; color:var(--text-main);' : ''}">${dayName}</div>
            </div>
        `;
    }).join('');
    return `
    <div class="screen active">
        <h2>Weekly History</h2>
        <div class="card">
            <p>Last 7 Entries</p>
            <div class="graph-container">${entries.length === 0 ? '<p style="margin:auto; opacity:0.5;">No data yet</p>' : barsHtml}</div>
        </div>
        <button class="btn" id="btn-home">Back</button>
    </div>
    `;
};

const ViewSettings = () => {
    return `
    <div class="screen active">
        <h2>Profile & Settings</h2>
        
        <div class="card">
            <h3>Failures & Badges</h3>
            <div class="chip-container" style="justify-content:center;">
                ${ACHIEVEMENTS.map(badge => {
        const isUnlocked = state.unlockedBadges.includes(badge.id);
        const opacity = isUnlocked ? 1 : 0.4;
        const color = isUnlocked ? 'var(--accent)' : 'var(--text-muted)';
        const iconColor = isUnlocked ? '#fbbf24' : 'var(--text-muted)'; // Gold if unlocked

        return `
                    <div style="display:flex; flex-direction:column; align-items:center; width:80px; text-align:center; opacity:${opacity};">
                        <div style="width:50px; height:50px; background:${isUnlocked ? 'var(--bg-card)' : 'var(--bg-input)'}; border:2px solid ${color}; border-radius:50%; display:flex; align-items:center; justify-content:center; margin-bottom:8px; box-shadow:${isUnlocked ? '0 4px 10px rgba(0,0,0,0.1)' : 'none'};">
                            <i class="fa-solid ${badge.icon}" style="font-size:20px; color:${iconColor};"></i>
                        </div>
                        <span style="font-size:11px; font-weight:600; color:${color};">${badge.title}</span>
                    </div>
                    `;
    }).join('')}
            </div>
        </div>

        <p>Change App Theme</p>
        <div class="theme-grid">
            <div class="theme-option t-light" data-theme="theme-light">Light</div>
            <div class="theme-option t-dark" data-theme="theme-dark">Dark</div>
            <div class="theme-option t-tokyo" data-theme="theme-tokyo">Tokyo</div>
            <div class="theme-option t-tan" data-theme="theme-tan">Tan</div>
        </div>
        <br>
        <button class="btn" id="btn-toggle-sound" style="background-color:var(--bg-card); color:var(--text-main); border:1px solid var(--border);">
            <i class="fa-solid fa-volume-high"></i> Toggle Sound (Current: ${window.soundEngine && window.soundEngine.isMuted ? 'OFF' : 'ON'})
        </button>
        <br><br>
        <button class="btn" id="btn-home">Back</button>
    </div>
    `;
};

function renderCategory(name, score, iconClass, isMentioned) {
    if (!isMentioned) {
        return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; opacity:0.4;">
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fa-solid ${iconClass}" style="width:20px; text-align:center;"></i>
                <span>${name}</span>
            </div>
            <span class="star-rating" style="font-size:14px; color:var(--text-muted);">-</span>
        </div>`;
    }
    const fullStars = Math.floor(score);
    const halfStar = score % 1 !== 0;
    let starsHtml = '';
    for (let i = 0; i < 5; i++) {
        if (i < fullStars) starsHtml += '<i class="fa-solid fa-star"></i>';
        else if (i === fullStars && halfStar) starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
        else starsHtml += '<i class="fa-regular fa-star empty"></i>';
    }
    return `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px;">
            <div style="display:flex; align-items:center; gap:10px;">
                <i class="fa-solid ${iconClass}" style="color:var(--accent); width:20px; text-align:center;"></i>
                <span>${name}</span>
            </div>
            <span class="star-rating">${starsHtml}</span>
        </div>`;
}

function renderTrends() {
    const trends = calculateTrends();
    if (!trends) return '';

    const trendIcons = {
        up: '↗️',
        down: '↘️',
        stable: '→'
    };

    const trendColors = {
        up: 'var(--success)',
        down: 'var(--danger)',
        stable: 'var(--text-muted)'
    };

    return `
        <div class="card">
            <h3>7-Day Trends</h3>
            <p style="font-size:12px; color:var(--text-muted); margin-bottom:16px;">Compared to previous week</p>
            ${Object.entries(trends).map(([cat, data]) => `
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:10px;">
                    <span style="text-transform:capitalize;">${cat}</span>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span style="font-weight:600;">${data.current}/5</span>
                        <span style="color:${trendColors[data.direction]}; font-size:20px;">${trendIcons[data.direction]}</span>
                        <span style="color:${trendColors[data.direction]}; font-size:12px; min-width:40px; text-align:right;">
                            ${data.direction !== 'stable' ? (data.changePercent > 0 ? '+' : '') + data.changePercent + '%' : ''}
                        </span>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

const ViewMonthlySummary = () => {
    const summary = getMonthlySummary();

    if (!summary) {
        return `
            <div class="screen active">
                <h2>Monthly Summary</h2>
                <div class="card" style="text-align:center; padding:40px;">
                    <p style="color:var(--text-muted);">No entries this month yet. Start journaling to see your monthly stats!</p>
                </div>
                <button class="btn" id="btn-home">Back to Journal</button>
            </div>
        `;
    }

    const monthName = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

    return `
        <div class="screen active">
            <h2>Monthly Summary</h2>
            <p style="color:var(--text-muted); margin-bottom:20px;">${monthName}</p>
            
            <div class="card" style="text-align:center;">
                <h3>Overall Performance</h3>
                <div class="score-big" style="font-size:64px;">${summary.overallAvg}%</div>
                <p style="color:var(--text-muted);">Average Score</p>
                <div style="margin-top:20px; display:flex; justify-content:space-around;">
                    <div>
                        <div style="font-size:24px; font-weight:bold; color:var(--accent);">${summary.daysLogged}</div>
                        <div style="font-size:12px; color:var(--text-muted);">Days Logged</div>
                    </div>
                    <div>
                        <div style="font-size:24px; font-weight:bold; color:var(--success);">${summary.totalXP}</div>
                        <div style="font-size:12px; color:var(--text-muted);">Total XP</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3>Category Averages</h3>
                ${Object.entries(summary.averages).map(([cat, avg]) => `
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="text-transform:capitalize;">${cat}</span>
                        <span style="font-weight:600;">${avg}/5</span>
                    </div>
                `).join('')}
            </div>
            
            <div class="card">
                <h3>Best & Worst Days</h3>
                <div style="margin-bottom:16px;">
                    <div style="color:var(--success); font-weight:600;">🏆 Best Day</div>
                    <div style="display:flex; justify-content:space-between; margin-top:4px;">
                        <span>${summary.bestDay.date}</span>
                        <span>${summary.bestDay.score}%</span>
                    </div>
                </div>
                <div>
                    <div style="color:var(--text-muted); font-weight:600;">📉 Needs Improvement</div>
                    <div style="display:flex; justify-content:space-between; margin-top:4px;">
                        <span>${summary.worstDay.date}</span>
                        <span>${summary.worstDay.score}%</span>
                    </div>
                </div>
            </div>
            
            <button class="btn" id="btn-home" style="background-color:var(--bg-input); color:var(--text-main);">Back to Journal</button>
        </div>
    `;
};

function applyTheme(themeName) {
    document.body.className = themeName;
    localStorage.setItem('health_theme', themeName);
    state.theme = themeName;
}

function render(viewName, data = null) {
    app.innerHTML = '';
    if (viewName === 'onboarding') app.innerHTML = ViewOnboarding();
    else if (viewName === 'entry') app.innerHTML = ViewEntry();
    else if (viewName === 'dashboard') app.innerHTML = ViewDashboard(data);
    else if (viewName === 'settings') app.innerHTML = ViewSettings();
    else if (viewName === 'history') app.innerHTML = ViewHistory();
    else if (viewName === 'meditation') app.innerHTML = ViewMeditation();
    else if (viewName === 'monthly') app.innerHTML = ViewMonthlySummary(); // NEW
}

function startBreathingCycle() {
    const textEl = document.getElementById('breath-instruction');
    const circleEl = document.getElementById('breath-circle');

    if (!textEl || !circleEl) return;

    // Initial State
    textEl.innerText = "Breathe In...";
    circleEl.classList.add('inhale');
    circleEl.classList.remove('exhale');

    breathingInterval = setInterval(() => {
        const isInhaling = circleEl.classList.contains('inhale');

        if (isInhaling) {
            // Switch to Exhale
            textEl.innerText = "Breathe Out...";
            circleEl.classList.remove('inhale');
            circleEl.classList.add('exhale');
        } else {
            // Switch to Inhale
            textEl.innerText = "Breathe In...";
            circleEl.classList.remove('exhale');
            circleEl.classList.add('inhale');
        }
    }, 4000); // 4 Second Cycle

    // Start Audio
    if (window.soundEngine) window.soundEngine.startMeditationAmbience();
}

function stopMeditation() {
    clearInterval(meditationInterval);
    clearInterval(breathingInterval);
    state.meditationActive = false;
    if (window.soundEngine) window.soundEngine.stopMeditationAmbience();
    render('entry');
}

function finishMeditation() {
    stopMeditation();

    // NEW: Track meditation date for Zen Streak achievement
    const today = new Date().toLocaleDateString();
    if (!state.meditationDates.includes(today)) {
        state.meditationDates.push(today);
        localStorage.setItem('health_meditation_dates', JSON.stringify(state.meditationDates));
    }

    // Add to journal
    const textarea = document.getElementById('journal-input');
    if (textarea) {
        textarea.value = textarea.value + " Meditated for 1 minute 🧘 ";
    } else {
        setTimeout(() => {
            const ta = document.getElementById('journal-input');
            if (ta) {
                const currentVal = ta.value;
                const prefix = currentVal.length > 0 && !currentVal.endsWith(' ') ? ' ' : '';
                ta.value += prefix + "Meditated for 1 minute 🧘 ";
            }
        }, 100);
    }

    // Unlock Zen Master
    if (!state.unlockedBadges.includes('zen_master')) {
        state.unlockedBadges.push('zen_master');
        localStorage.setItem('health_badges', JSON.stringify(state.unlockedBadges));
        alert("🏆 Achievement Unlocked: Zen Master!");
        if (window.soundEngine) window.soundEngine.playSuccess();
    }
}

function init() {
    applyTheme(state.theme);
    checkAchievements();

    // Start background music on first click
    document.addEventListener('click', () => {
        if (window.soundEngine && !window.soundEngine.isMuted) {
            window.soundEngine.startBackgroundMusic();
        }
    }, { once: true });

    if (!localStorage.getItem('health_has_visited')) render('onboarding');
    else render('entry');

    app.addEventListener('click', (e) => {
        if (e.target.classList.contains('theme-option')) {
            const newTheme = e.target.getAttribute('data-theme');
            applyTheme(newTheme);
            document.querySelectorAll('.theme-option').forEach(el => el.classList.remove('selected'));
            e.target.classList.add('selected');
        }
        if (e.target.id === 'btn-finish-setup') {
            localStorage.setItem('health_has_visited', 'true');
            render('entry');
        }

        // Handle Chip Clicks
        if (e.target.closest('.chip')) {
            if (window.soundEngine) window.soundEngine.playClick();
            const chip = e.target.closest('.chip');
            const textToAdd = chip.getAttribute('data-text');
            const textarea = document.getElementById('journal-input');

            if (textarea) {
                const currentVal = textarea.value;
                // Add space if needed
                const prefix = currentVal.length > 0 && !currentVal.endsWith(' ') ? ' ' : '';
                textarea.value = currentVal + prefix + textToAdd + ' ';
                // Removed textarea.focus() to prevent auto-scroll - better UX
            }
        }

        if (e.target.id === 'btn-analyze') {
            const text = document.getElementById('journal-input').value;
            if (text.length < 2) { alert("Please write something!"); return; }
            const result = analyzeEntry(text);

            const existingIndex = state.history.findIndex(e => e.date === state.today);
            const oldLevel = getLevelInfo().level; // Track level before adding XP

            if (existingIndex >= 0) {
                // UPDATE: Keep old lockedXP if it exists
                const oldEntry = state.history[existingIndex];
                const xpToKeep = oldEntry.lockedXP !== undefined ? oldEntry.lockedXP : oldEntry.result.overall;

                state.history[existingIndex] = {
                    date: state.today,
                    result: result,
                    text: text,
                    lockedXP: xpToKeep,
                    timestamp: new Date().getTime()
                };
            } else {
                // NEW: Lock XP now
                state.history.push({
                    date: state.today,
                    result: result,
                    text: text,
                    lockedXP: result.overall,
                    timestamp: new Date().getTime()
                });

                // Check for level up
                const newLevel = getLevelInfo().level;
                if (newLevel > oldLevel) {
                    setTimeout(() => showLevelUpAnimation(newLevel), 500);
                }

                // Check for streak celebrations
                const streak = calculateStreak();
                setTimeout(() => showStreakCelebration(streak), 1000);
            }

            localStorage.setItem('health_history', JSON.stringify(state.history));
            checkAchievements(result);

            // Success sound if doing well
            if (result.overall >= 70 && window.soundEngine) window.soundEngine.playSuccess();

            render('dashboard', result);
        }
        if (e.target.id === 'btn-home') render('entry');
        if (e.target.id === 'btn-history') render('history');
        if (e.target.id === 'btn-monthly') render('monthly'); // NEW
        if (e.target.closest('#btn-reset-streak')) {
            if (confirm("Are you sure you want to reset your streak? (XP will remain safe)")) {
                state.streakResetDate = new Date();
                localStorage.setItem('health_streak_reset', state.streakResetDate.toISOString());
                render('entry');
            }
        }
        const settingsBtn = e.target.closest('#btn-settings-small');
        if (settingsBtn) render('settings');

        // Meditation
        if (e.target.closest('#btn-meditate-view')) render('meditation');

        if (e.target.id === 'btn-close-meditation') stopMeditation();

        if (e.target.id === 'btn-start-meditation') {
            const btn = document.getElementById('btn-start-meditation');
            btn.style.display = 'none'; // Hide button

            state.meditationTime = 60;
            state.meditationActive = true;

            startBreathingCycle();

            const timerDisplay = document.getElementById('timer-display');
            meditationInterval = setInterval(() => {
                state.meditationTime--;
                if (state.meditationTime <= 0) {
                    finishMeditation();
                    return;
                }
                const mins = Math.floor(state.meditationTime / 60).toString().padStart(2, '0');
                const secs = (state.meditationTime % 60).toString().padStart(2, '0');
                if (timerDisplay) timerDisplay.innerText = `${mins}:${secs}`;
            }, 1000);
        }

        if (e.target.closest('#btn-toggle-sound')) {
            if (window.soundEngine) {
                // Force Init
                window.soundEngine.init();
                const isMuted = window.soundEngine.toggleMute();

                if (!isMuted) {
                    // Play test sound immediately to confirm volume
                    window.soundEngine.playClick();
                }

                render('settings');
            }
        }
    });
}

// --- PWA SERVICE WORKER REGISTRATION ---
let deferredPrompt;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });
}

// Capture the install prompt event
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent the default mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e;
    console.log('💡 Install prompt available');

    // Optionally show a custom install button
    showInstallButton();
});

// Handle successful installation
window.addEventListener('appinstalled', () => {
    console.log('✅ PWA installed successfully');
    deferredPrompt = null;
});

// Function to show install button (optional UI enhancement)
function showInstallButton() {
    // You can add a custom install button to your UI here
    // For now, users can install via browser menu
    console.log('📱 App is installable - users can add to home screen');
}

try {
    init();
} catch (e) {
    alert("CRITICAL ERROR: " + e.message);
    console.error(e);
}
