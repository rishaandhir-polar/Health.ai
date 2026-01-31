// --- AI LOGIC ---
// Text analysis replaced by Chip-Based Scoring

// NEW: Chip-based analysis - no text parsing!
function analyzeChipSelection() {
    const scores = { food: 0, screen: 0, active: 0, sleep: 0, hydration: 0, mindset: 0, knowledge: 0 };
    const mentions = { food: false, screen: false, active: false, sleep: false, hydration: false, mindset: false, knowledge: false };

    // Combine positive and negative chips
    const allChips = [...SMART_CHIPS, ...NEGATIVE_CHIPS];

    // Calculate scores from selected chips
    state.selectedChips.forEach(chipId => {
        const chip = allChips.find(c => c.id === chipId);
        if (chip) {
            scores[chip.category] += chip.score;
            mentions[chip.category] = true;
        }
    });

    // Clamp scores to 0.5-5 range
    Object.keys(scores).forEach(category => {
        if (!mentions[category]) {
            scores[category] = 0;
        } else {
            scores[category] = Math.max(0.5, Math.min(5, scores[category]));
        }
    });

    // Calculate overall percentage
    const totalPoints = Object.values(scores).reduce((sum, score) => sum + score, 0);
    const maxPossible = 7 * 5; // 7 categories × 5 points
    const overallPercent = Math.round((totalPoints / maxPossible) * 100);

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

// Helper to safely save to localStorage (important for mobile browsers)
function safeSave(key, value) {
    try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        localStorage.setItem(key, stringValue);

        // Verify save (mobile Safari can fail silently)
        const saved = localStorage.getItem(key);
        if (!saved) {
            console.error('localStorage save failed for', key, '- retrying...');
            localStorage.setItem(key, stringValue);
        }
        return true;
    } catch (e) {
        console.error('Failed to save to localStorage:', key, e);
        return false;
    }
}

// Helper to get current date (always returns fresh date)
function getCurrentDate() {
    return new Date().toLocaleDateString();
}

// Get Monday of current week
function getWeekStart() {
    const now = new Date();
    const day = now.getDay();
    const diff = now.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday
    const monday = new Date(now.setDate(diff));
    return monday.toLocaleDateString();
}

// Check if we need to reset weekly quests
function checkWeeklyReset() {
    const currentWeekStart = getWeekStart();
    if (state.weeklyQuests.weekStart !== currentWeekStart) {
        // New week - reset all quests
        state.weeklyQuests = {
            weekStart: currentWeekStart,
            quests: {
                perfect_week: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
                category_master: { completed: false, progress: 0, category: null, xpAwarded: false, lastCountedDates: [] },
                balanced_life: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
                social_butterfly: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
                knowledge_seeker: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] }
            },
            totalBonusXP: 0
        };
        safeSave('health_weekly_quests', state.weeklyQuests);
    }
}


const state = {
    theme: localStorage.getItem('health_theme') || 'theme-light',
    history: safeJSON('health_history', []),
    today: getCurrentDate(),
    streakResetDate: localStorage.getItem('health_streak_reset') ? new Date(localStorage.getItem('health_streak_reset')) : null,
    meditationActive: false,
    meditationPhase: 'ready', // ready, inhale, hold, exhale
    meditationTime: 60, // seconds
    unlockedBadges: safeJSON('health_badges', []),
    goals: safeJSON('health_goals', []), // NEW: Weekly goals
    meditationDates: safeJSON('health_meditation_dates', []), // NEW: Track meditation days for Zen Streak
    selectedChips: [], // NEW: Track selected chips for today
    weeklyQuests: safeJSON('health_weekly_quests', {
        weekStart: getWeekStart(),
        quests: {
            perfect_week: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
            category_master: { completed: false, progress: 0, category: null, xpAwarded: false, lastCountedDates: [] },
            balanced_life: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
            social_butterfly: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] },
            knowledge_seeker: { completed: false, progress: 0, xpAwarded: false, lastCountedDates: [] }
        },
        totalBonusXP: 0
    })
};

// MIGRATION: Add lastCountedDates to old quest data
if (state.weeklyQuests && state.weeklyQuests.quests) {
    Object.keys(state.weeklyQuests.quests).forEach(questId => {
        const quest = state.weeklyQuests.quests[questId];
        if (!quest.lastCountedDates) {
            quest.lastCountedDates = [];
        }
    });
    safeSave('health_weekly_quests', state.weeklyQuests);
}


let meditationInterval = null;
let breathingInterval = null;

// --- CONFIG ---
// SMART CHIPS - Each chip has ID, score value, and category
const SMART_CHIPS = [
    // FOOD & NUTRITION
    { id: 'water', label: "Drank Water", icon: "fa-glass-water", category: "hydration", score: 5.0 },
    { id: 'salad', label: "Ate Salad", icon: "fa-leaf", category: "food", score: 2.5 },
    { id: 'fruit', label: "Fruit", icon: "fa-apple-whole", category: "food", score: 2.5 },
    { id: 'home_cooked', label: "Home Cooked", icon: "fa-utensils", category: "food", score: 2.5 },
    { id: 'protein', label: "Protein", icon: "fa-drumstick-bite", category: "food", score: 2.5 },
    { id: 'breakfast', label: "Breakfast", icon: "fa-mug-saucer", category: "food", score: 2.5 },

    // EXERCISE & ACTIVITY
    { id: 'run_walk', label: "Run/Walk", icon: "fa-person-running", category: "active", score: 4.0 },
    { id: 'gym', label: "Gym", icon: "fa-dumbbell", category: "active", score: 5.0 },
    { id: 'yoga', label: "Yoga", icon: "fa-spa", category: "active", score: 4.0 },
    { id: 'sports', label: "Sports", icon: "fa-basketball", category: "active", score: 4.0 },
    { id: 'bike', label: "Bike Ride", icon: "fa-bicycle", category: "active", score: 4.0 },
    { id: 'stretching', label: "Stretching", icon: "fa-person-walking", category: "active", score: 3.0 },

    // SLEEP & REST
    { id: 'good_sleep', label: "Good Sleep", icon: "fa-bed", category: "sleep", score: 5.0 },
    { id: 'early_bed', label: "Early Bedtime", icon: "fa-moon", category: "sleep", score: 3.0 },
    { id: 'nap', label: "Nap", icon: "fa-bed-pulse", category: "sleep", score: 2.0 },

    // LEARNING & PRODUCTIVITY
    { id: 'read', label: "Read Book", icon: "fa-book", category: "knowledge", score: 4.0 },
    { id: 'studied', label: "Studied", icon: "fa-graduation-cap", category: "knowledge", score: 4.0 },
    { id: 'learned', label: "Learned Skill", icon: "fa-lightbulb", category: "knowledge", score: 4.0 },
    { id: 'productive', label: "Productive Work", icon: "fa-laptop", category: "knowledge", score: 3.0 },
    { id: 'creative', label: "Creative", icon: "fa-palette", category: "knowledge", score: 3.0 },

    // MINDSET & SOCIAL
    { id: 'meditated', label: "Meditated", icon: "fa-om", category: "mindset", score: 4.0 },
    { id: 'grateful', label: "Grateful", icon: "fa-heart", category: "mindset", score: 3.0 },
    { id: 'friends', label: "Friends", icon: "fa-user-group", category: "mindset", score: 4.0 },
    { id: 'family', label: "Family Time", icon: "fa-house-heart", category: "mindset", score: 4.0 },
    { id: 'helped', label: "Helped Someone", icon: "fa-hand-holding-heart", category: "mindset", score: 3.0 },
    { id: 'journaled', label: "Journaled", icon: "fa-pen", category: "mindset", score: 2.0 },

    // SCREEN TIME (positive = less screen)
    { id: 'no_phone', label: "No Phone", icon: "fa-mobile-screen-button", category: "screen", score: 5.0 },
    { id: 'screen_break', label: "Screen Break", icon: "fa-eye-slash", category: "screen", score: 3.0 },
    { id: 'outside', label: "Outside Time", icon: "fa-tree", category: "screen", score: 3.0 }
];

const NEGATIVE_CHIPS = [
    // FOOD
    { id: 'junk_food', label: "Junk Food", icon: "fa-burger", category: "food", score: -2.0 },
    { id: 'soda_sugar', label: "Soda/Sugar", icon: "fa-candy-cane", category: "food", score: -1.5 },
    { id: 'skipped_meal', label: "Skipped Meal", icon: "fa-ban", category: "food", score: -1.5 },

    // SCREEN TIME
    { id: 'too_much_tv', label: "Too Much TV", icon: "fa-tv", category: "screen", score: -3.0 },
    { id: 'phone_scroll', label: "Phone Scroll", icon: "fa-mobile", category: "screen", score: -2.5 },
    { id: 'video_games', label: "Video Games", icon: "fa-gamepad", category: "screen", score: -2.0 },

    // ACTIVITY
    { id: 'lazy', label: "Lazy", icon: "fa-couch", category: "active", score: -2.0 },
    { id: 'no_exercise', label: "No Exercise", icon: "fa-person-walking-dashed-line-arrow-right", category: "active", score: -1.5 },

    // SLEEP
    { id: 'bad_sleep', label: "Bad Sleep", icon: "fa-face-dizzy", category: "sleep", score: -2.0 },
    { id: 'up_late', label: "Up Late", icon: "fa-clock", category: "sleep", score: -1.5 },

    // MINDSET
    { id: 'stressed', label: "Stressed", icon: "fa-face-frown", category: "mindset", score: -1.5 },
    { id: 'procrastinated', label: "Procrastinated", icon: "fa-hourglass-end", category: "mindset", score: -1.0 }
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

const WEEKLY_QUESTS = [
    {
        id: 'perfect_week',
        icon: 'fa-star',
        title: 'Perfect Week',
        desc: 'Score 80%+ for 7 days',
        reward: 150,
        maxProgress: 7
    },
    {
        id: 'category_master',
        icon: 'fa-crown',
        title: 'Category Master',
        desc: 'Get 5/5 in one category for 7 days',
        reward: 150,
        maxProgress: 7
    },
    {
        id: 'balanced_life',
        icon: 'fa-scale-balanced',
        title: 'Balanced Life',
        desc: 'Score 4+ in all categories for 5 days',
        reward: 150,
        maxProgress: 5
    },
    {
        id: 'social_butterfly',
        icon: 'fa-user-group',
        title: 'Social Butterfly',
        desc: 'Mention friends/family 5 times',
        reward: 150,
        maxProgress: 5
    },
    {
        id: 'knowledge_seeker',
        icon: 'fa-graduation-cap',
        title: 'Knowledge Seeker',
        desc: 'Learn something new for 7 days',
        reward: 150,
        maxProgress: 7
    }
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

// --- WEEKLY QUEST SYSTEM ---

function updateWeeklyQuests(result) {
    checkWeeklyReset();

    const quests = state.weeklyQuests.quests;
    const today = getCurrentDate();
    let questsUpdated = false;

    // 1. Perfect Week - 80%+ for 7 days (count once per day)
    if (!quests.perfect_week.completed && result.overall >= 80) {
        if (!quests.perfect_week.lastCountedDates.includes(today)) {
            quests.perfect_week.progress++;
            quests.perfect_week.lastCountedDates.push(today);
            if (quests.perfect_week.progress >= 7 && !quests.perfect_week.xpAwarded) {
                completeQuest('perfect_week');
            }
            questsUpdated = true;
        }
    }

    // 2. Category Master - 5/5 in one category for 7 days (count once per day)
    if (!quests.category_master.completed) {
        const cats = result.categories;
        const perfectCat = Object.keys(cats).find(cat => cats[cat] >= 5);
        if (perfectCat) {
            if (!quests.category_master.category) {
                quests.category_master.category = perfectCat;
            }
            if (quests.category_master.category === perfectCat && !quests.category_master.lastCountedDates.includes(today)) {
                quests.category_master.progress++;
                quests.category_master.lastCountedDates.push(today);
                if (quests.category_master.progress >= 7 && !quests.category_master.xpAwarded) {
                    completeQuest('category_master');
                }
                questsUpdated = true;
            }
        }
    }

    // 3. Balanced Life - 4+ in all categories for 5 days (count once per day)
    if (!quests.balanced_life.completed) {
        const cats = result.categories;
        const allBalanced = Object.values(cats).every(score => score >= 4);
        if (allBalanced && !quests.balanced_life.lastCountedDates.includes(today)) {
            quests.balanced_life.progress++;
            quests.balanced_life.lastCountedDates.push(today);
            if (quests.balanced_life.progress >= 5 && !quests.balanced_life.xpAwarded) {
                completeQuest('balanced_life');
            }
            questsUpdated = true;
        }
    }

    // 4. Social Butterfly - mention friends/family (use chips, count once per day)
    if (!quests.social_butterfly.completed) {
        const hasSocialChip = state.selectedChips.includes('friends') || state.selectedChips.includes('family');
        if (hasSocialChip && !quests.social_butterfly.lastCountedDates.includes(today)) {
            quests.social_butterfly.progress++;
            quests.social_butterfly.lastCountedDates.push(today);
            if (quests.social_butterfly.progress >= 5 && !quests.social_butterfly.xpAwarded) {
                completeQuest('social_butterfly');
            }
            questsUpdated = true;
        }
    }

    // 5. Knowledge Seeker - learn something new for 7 days (count once per day)
    if (!quests.knowledge_seeker.completed && result.categories.knowledge >= 4) {
        if (!quests.knowledge_seeker.lastCountedDates.includes(today)) {
            quests.knowledge_seeker.progress++;
            quests.knowledge_seeker.lastCountedDates.push(today);
            if (quests.knowledge_seeker.progress >= 7 && !quests.knowledge_seeker.xpAwarded) {
                completeQuest('knowledge_seeker');
            }
            questsUpdated = true;
        }
    }

    if (questsUpdated) {
        safeSave('health_weekly_quests', state.weeklyQuests);
    }
}

function completeQuest(questId) {
    const quest = WEEKLY_QUESTS.find(q => q.id === questId);
    if (!quest) return;

    state.weeklyQuests.quests[questId].completed = true;
    state.weeklyQuests.quests[questId].xpAwarded = true;
    state.weeklyQuests.totalBonusXP += quest.reward;

    // CRITICAL: Add quest XP to today's entry so it counts toward total XP
    const todayEntry = state.history.find(e => e.date === state.today);
    if (todayEntry) {
        // Add quest XP to locked XP
        todayEntry.lockedXP = (todayEntry.lockedXP || todayEntry.result.overall) + quest.reward;
        safeSave('health_history', state.history);
    }

    // Show celebration
    showQuestComplete(quest);

    safeSave('health_weekly_quests', state.weeklyQuests);
}

function showQuestComplete(quest) {
    const popup = document.createElement('div');
    popup.className = 'achievement-popup';
    popup.innerHTML = `
        <div class="achievement-content">
            <i class="fa-solid ${quest.icon}" style="font-size: 48px; color: #fbbf24; margin-bottom: 16px;"></i>
            <h2>Quest Complete!</h2>
            <h3>${quest.title}</h3>
            <p>+${quest.reward} Bonus XP!</p>
        </div>
    `;
    document.body.appendChild(popup);

    createConfetti();
    if (window.soundEngine) window.soundEngine.playSuccess();

    setTimeout(() => {
        popup.style.opacity = '0';
        setTimeout(() => popup.remove(), 500);
    }, 4000);
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
    // Update today's date to ensure it's current
    state.today = getCurrentDate();

    const existingEntry = state.history.find(e => e.date === state.today);

    // Load selected chips from history if they exist
    if (existingEntry && existingEntry.selectedChips) {
        state.selectedChips = [...existingEntry.selectedChips];
    } else {
        // Clear selection for a new entry or if no chips saved
        state.selectedChips = [];
    }

    const lvl = getLevelInfo();

    const statusHeader = existingEntry ?
        `<p style="color:var(--success); font-weight:bold;"><i class="fa-solid fa-lock"></i> XP Locked for Today</p>`
        :
        `<p style="color:var(--accent); font-weight:bold;"><i class="fa-solid fa-lock-open"></i> XP Unlocked</p>`;

    const placeHolder = "Tap chips to select what you did today...";

    const entryContent = `
        ${statusHeader}
        
        <p style="color:var(--text-muted); margin-bottom:16px;">${placeHolder}</p>

        <!-- Smart Chips - Organized by Category -->
        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">🍎 Food & Nutrition</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'food' || c.category === 'hydration').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">💪 Exercise & Activity</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'active').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">😴 Sleep & Rest</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'sleep').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">📚 Learning & Productivity</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'knowledge').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">❤️ Mindset & Social</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'mindset').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>

        <div style="margin-bottom: 16px;">
            <h4 style="color: var(--text-muted); font-size: 12px; text-transform: uppercase; margin-bottom: 8px; font-weight: 600;">📵 Screen Time</h4>
            <div class="chip-container">
                ${SMART_CHIPS.filter(c => c.category === 'screen').map(chip => `
                    <div class="chip ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
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
                    <div class="chip negative ${state.selectedChips.includes(chip.id) ? 'selected' : ''}" data-id="${chip.id}">
                        <i class="fa-solid ${chip.icon}"></i> ${chip.label}
                    </div>
                `).join('')}
            </div>
        </div>
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
            <button class="btn" id="btn-quests" style="flex:1; background-color:var(--bg-input); color:var(--text-main);">🏆 Quests</button>
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
    // Create day labels in order: Mon, Tue, Wed, Thu, Fri, Sat, Sun
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Get today's day of week (0 = Sunday, 6 = Saturday)
    const today = new Date();
    const todayDayOfWeek = today.getDay();

    // Calculate which day is Monday of this week
    const mondayOffset = todayDayOfWeek === 0 ? -6 : 1 - todayDayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    // Create array of last 7 days starting from Monday
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
        const date = new Date(monday);
        date.setDate(monday.getDate() + i);
        const dateStr = date.toLocaleDateString();
        const dayName = dayNames[date.getDay()];

        // Find entry for this day
        const entry = state.history.find(e => e.date === dateStr);
        const score = entry ? (entry.lockedXP !== undefined ? entry.lockedXP : entry.result.overall) : 0;

        weekDays.push({
            dayName,
            score,
            hasEntry: !!entry,
            isToday: dateStr === state.today
        });
    }

    const barsHtml = weekDays.map(day => {
        const height = day.hasEntry ? day.score : 0;
        let colorClass = 'low';
        if (height >= 70) colorClass = 'high';
        else if (height >= 50) colorClass = 'mid';

        return `
            <div class="graph-bar-group">
                <div class="graph-score-label">${day.hasEntry ? Math.round(height) : '-'}</div>
                <div class="graph-bar ${colorClass}" style="height: ${height}%;"></div>
                <div class="graph-label" style="${day.isToday ? 'font-weight:bold; color:var(--text-main);' : ''}">${day.dayName}</div>
            </div>
        `;
    }).join('');

    const streak = calculateStreak();
    const totalXP = calculateXP();

    return `
    <div class="screen active">
        <h2>Your Week</h2>
        <div class="card">
            <div style="display: flex; justify-content: space-between; margin-bottom: 16px;">
                <div>
                    <p style="margin: 0; color: var(--text-muted);">Current Streak</p>
                    <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: #fca5a5;">🔥 ${streak} days</p>
                </div>
                <div style="text-align: right;">
                    <p style="margin: 0; color: var(--text-muted);">Total XP</p>
                    <p style="margin: 4px 0 0 0; font-size: 24px; font-weight: bold; color: var(--accent);">${totalXP}</p>
                </div>
            </div>
        </div>
        
        <div class="card">
            <h3 style="margin-bottom: 16px;">Weekly Progress</h3>
            <div class="graph-container">${barsHtml}</div>
        </div>
        
        <button class="btn" id="btn-home">Back to Journal</button>
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

const ViewWeeklyQuests = () => {
    checkWeeklyReset();

    const questsHTML = WEEKLY_QUESTS.map(quest => {
        const questData = state.weeklyQuests.quests[quest.id];
        const progress = questData.progress || 0;
        const percent = Math.round((progress / quest.maxProgress) * 100);
        const isComplete = questData.completed;

        return `
            <div class="quest-card ${isComplete ? 'complete' : ''}">
                <div style="display: flex; align-items: center; gap: 12px;">
                    <i class="fa-solid ${quest.icon}" style="font-size: 32px; color: ${isComplete ? 'var(--success)' : 'var(--accent)'}"></i>
                    <div style="flex: 1;">
                        <h3 style="margin: 0;">${quest.title}</h3>
                        <p style="margin: 4px 0; color: var(--text-muted); font-size: 14px;">${quest.desc}</p>
                        <div style="display: flex; align-items: center; gap: 8px; margin-top: 8px;">
                            <div class="xp-bar-bg" style="flex: 1; height: 8px;">
                                <div class="xp-bar-fill" style="width: ${percent}%; height: 8px;"></div>
                            </div>
                            <span style="font-size: 12px; color: var(--text-muted);">${progress}/${quest.maxProgress}</span>
                        </div>
                    </div>
                    <div style="text-align: center;">
                        ${isComplete
                ? '<i class="fa-solid fa-check-circle" style="font-size: 24px; color: var(--success);"></i>'
                : `<span style="font-weight: bold; color: var(--accent);">+${quest.reward} XP</span>`
            }
                    </div>
                </div>
            </div>
        `;
    }).join('');

    const weekEnd = new Date(state.weeklyQuests.weekStart);
    weekEnd.setDate(weekEnd.getDate() + 6);

    return `
        <div class="screen active">
            <h2>Weekly Quests</h2>
            <div class="card">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                    <div>
                        <p style="margin: 0; color: var(--text-muted);">Week of ${state.weeklyQuests.weekStart}</p>
                        <p style="margin: 4px 0 0 0; font-size: 14px; color: var(--text-muted);">Resets every Monday</p>
                    </div>
                    <div style="text-align: right;">
                        <p style="margin: 0; font-size: 24px; font-weight: bold; color: var(--accent);">${state.weeklyQuests.totalBonusXP} XP</p>
                        <p style="margin: 4px 0 0 0; font-size: 12px; color: var(--text-muted);">Bonus Earned</p>
                    </div>
                </div>
            </div>
            
            ${questsHTML}
            
            <button class="btn" id="btn-home" style="margin-top: 16px;">Back to Journal</button>
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
    else if (viewName === 'quests') app.innerHTML = ViewWeeklyQuests(); // NEW
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
    // Check if localStorage is available (important for mobile/private browsing)
    try {
        const test = '__storage_test__';
        localStorage.setItem(test, test);
        localStorage.removeItem(test);
    } catch (e) {
        alert('⚠️ Warning: Your browser storage is disabled or full. Your data will not be saved. Please check your browser settings or free up space.');
        console.error('localStorage not available:', e);
    }

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

        // Handle Chip Clicks - TOGGLE SELECTION
        if (e.target.closest('.chip')) {
            if (window.soundEngine) window.soundEngine.playClick();
            const chip = e.target.closest('.chip');
            const chipId = chip.getAttribute('data-id');

            if (state.selectedChips.includes(chipId)) {
                // Deselect
                state.selectedChips = state.selectedChips.filter(id => id !== chipId);
                chip.classList.remove('selected');
            } else {
                // Select
                state.selectedChips.push(chipId);
                chip.classList.add('selected');
            }
        }

        if (e.target.id === 'btn-analyze') {
            try {
                // Update today's date to ensure it's current before saving
                state.today = getCurrentDate();

                if (state.selectedChips.length === 0) { alert("Please select at least one chip!"); return; }

                // USE NEW ANALYSIS
                const result = analyzeChipSelection(); // no args needed, uses state.selectedChips

                const existingIndex = state.history.findIndex(e => e.date === state.today);
                const oldLevel = getLevelInfo().level; // Track level before adding XP

                if (existingIndex >= 0) {
                    // UPDATE: Keep old lockedXP if it exists
                    const oldEntry = state.history[existingIndex];
                    const xpToKeep = oldEntry.lockedXP !== undefined ? oldEntry.lockedXP : oldEntry.result.overall;

                    state.history[existingIndex] = {
                        date: state.today,
                        result: result,
                        text: "", // No text anymore
                        selectedChips: [...state.selectedChips], // Save selected chips
                        lockedXP: xpToKeep,
                        timestamp: new Date().getTime()
                    };
                } else {
                    // NEW: Lock XP now
                    state.history.push({
                        date: state.today,
                        result: result,
                        text: "", // No text
                        selectedChips: [...state.selectedChips], // Save selected chips
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

                // Save to localStorage
                if (!safeSave('health_history', state.history)) {
                    alert('⚠️ Warning: Your entry may not be saved. Please check your browser storage settings.');
                }

                checkAchievements(result);

                // Update weekly quests
                updateWeeklyQuests(result);

                // Success sound if doing well
                if (result.overall >= 70 && window.soundEngine) window.soundEngine.playSuccess();

                render('dashboard', result);
            } catch (err) {
                console.error("ANALYSIS ERROR:", err);
                alert("Oops! Something went wrong while analyzing your day. Please try again or refresh the page.");
            }
        }
        if (e.target.id === 'btn-home') {
            render('entry');
        }
        if (e.target.id === 'btn-history') render('history');
        if (e.target.id === 'btn-monthly') render('monthly'); // NEW
        if (e.target.id === 'btn-quests') render('quests'); // NEW
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
let refreshing = false;

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./service-worker.js')
            .then((registration) => {
                console.log('✅ Service Worker registered successfully:', registration.scope);

                // Check for updates periodically
                registration.update();

                // Handle updates
                registration.onupdatefound = () => {
                    const installingWorker = registration.installing;
                    installingWorker.onstatechange = () => {
                        if (installingWorker.state === 'installed') {
                            if (navigator.serviceWorker.controller) {
                                // New content is available; please refresh.
                                console.log('💡 New content available, auto-refreshing...');
                                // The skipWaiting() in the service worker will trigger controllerchange
                            }
                        }
                    };
                };
            })
            .catch((error) => {
                console.log('❌ Service Worker registration failed:', error);
            });
    });

    // The event listener that actually reloads the page
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
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
