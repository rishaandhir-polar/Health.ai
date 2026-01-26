// ai.js - The "Local Brain" of the app

const KEYWORDS = {
    food: {
        good: ['salad', 'vegetable', 'fruit', 'water', 'healthy', 'protein', 'chicken', 'fish', 'carrot', 'apple', 'banana', 'home cooked', 'grilled', 'oats'],
        bad: ['sugar', 'candy', 'soda', 'coke', 'fast food', 'burger', 'fries', 'cake', 'chocolate', 'processed', 'grease', 'pizza', 'ice cream']
    },
    screen: {
        good: ['read', 'book', 'off phone', 'no screen', 'meditate', 'focus'],
        bad: ['tv', 'netflix', 'tiktok', 'instagram', 'youtube', 'video game', 'played', 'scrolled', 'watch', 'phone']
    },
    outside: {
        good: ['run', 'walk', 'gym', 'hike', 'bike', 'sport', 'basketball', 'soccer', 'outside', 'park', 'sun', 'exercise', 'workout'],
        bad: ['inside', 'couch', 'bed all day', 'lazy', 'sat']
    },
    sleep: {
        good: ['slept well', 'rested', 'early', '8 hours', '9 hours', '7 hours'],
        bad: ['tired', 'insomnia', 'late', 'all nighter', '4 hours', '5 hours']
    }
};

export function analyzeEntry(text) {
    const lowerText = text.toLowerCase();

    let scores = {
        food: 2.5, // Start at 2.5 stars (middle)
        screen: 2.5,
        outside: 2.5,
        sleep: 2.5
    };

    // 1. Keyword Scanning
    for (const category in KEYWORDS) {
        const catData = KEYWORDS[category];

        // Check Good Words
        catData.good.forEach(word => {
            if (lowerText.includes(word)) {
                scores[category] += 0.5; // Bump up
            }
        });

        // Check Bad Words
        catData.bad.forEach(word => {
            if (lowerText.includes(word)) {
                scores[category] -= 0.5; // Bump down
            }
        });
    }

    // 2. Contextual Logic (regex for numbers)
    // Sleep Hours Detection
    const sleepMatch = lowerText.match(/(\d+)\s*hours?\s*sleep/);
    if (sleepMatch) {
        const hours = parseInt(sleepMatch[1]);
        if (hours >= 7) scores.sleep = 5.0;
        else if (hours >= 5) scores.sleep = 3.0;
        else scores.sleep = 1.0;
    }

    // Screen Time Detection
    const screenMatch = lowerText.match(/(\d+)\s*hours?\s*(game|tv|phone|screen)/);
    if (screenMatch) {
        const hours = parseInt(screenMatch[1]);
        if (hours > 4) scores.screen = 1.0;
        else if (hours > 2) scores.screen = 3.0;
        else scores.screen = 5.0;
    }

    // 3. Clamp scores between 0 and 5
    let totalPoints = 0;
    for (const key in scores) {
        if (scores[key] > 5) scores[key] = 5;
        if (scores[key] < 0) scores[key] = 0;
        totalPoints += scores[key];
    }

    // 4. Calculate Overall Percentage
    // Max total points = 20 (4 categories * 5 stars)
    const overallPercent = Math.round((totalPoints / 20) * 100);

    return {
        overall: overallPercent,
        categories: scores
    };
}
