class WaveManager {
    constructor(game) {
        this.game = game;
        this.waveIndex = 0;
        this.isWaveActive = false;

        // Define Waves (More varied)
        this.waves = [
            { count: 5, type: 'soldier', interval: 1000 },
            { count: 8, type: 'scout', interval: 800 },
            { count: 10, type: 'soldier', interval: 600 },
            { count: 3, type: 'tank', interval: 3000 },
            { count: 20, type: 'soldier', interval: 400 }, // Horde
            { count: 10, type: 'scout', interval: 500 }, // Rush
            { count: 5, type: 'tank', interval: 2500 }, // Heavy
            { count: 30, type: 'soldier', interval: 300 }, // Bigger Horde
            { count: 10, type: 'tank', interval: 2000 }, // Armor Column
            { count: 50, type: 'scout', interval: 200 } // Zerg Rush
        ];

        this.queue = [];
        this.spawnTimer = 0;
    }

    startNextWave() {
        if (this.waveIndex >= this.waves.length) {
            console.log("All waves complete!");
            return;
        }

        const waveData = this.waves[this.waveIndex];
        this.queue = [];
        for (let i = 0; i < waveData.count; i++) {
            this.queue.push(waveData.type);
        }

        this.spawnInterval = waveData.interval;
        this.isWaveActive = true;
        this.waveIndex++;

        // Update UI
        document.getElementById('wave-display').innerText = this.waveIndex;
        document.getElementById('start-wave-btn').style.display = 'none'; // Hide button during wave
    }

    update(deltaTime) {
        if (!this.isWaveActive) return;

        if (this.queue.length > 0) {
            this.spawnTimer += deltaTime;
            if (this.spawnTimer >= this.spawnInterval) {
                this.spawnTimer = 0;
                const type = this.queue.shift();

                // Spawn Enemy
                const enemy = new Enemy(type, this.game.mapManager.currentMap.waypoints);
                this.game.enemies.push(enemy);
            }
        } else if (this.game.enemies.length === 0) {
            // Wave Complete
            this.isWaveActive = false;
            document.getElementById('start-wave-btn').style.display = 'block'; // Show button
        }
    }
}
