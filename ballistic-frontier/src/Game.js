// Game.js handles the main loop

class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');

        this.width = this.canvas.width;
        this.height = this.canvas.height;

        this.mapManager = new MapManager();
        this.lastTime = 0;
        this.isPlaying = false;

        this.towers = [];
        this.enemies = [];
        this.projectiles = [];

        this.selectedTowerType = null;
        this.selectedTower = null;

        this.mouseX = 0;
        this.mouseY = 0;

        this.cash = 600;
        this.lives = 20;
        this.waveManager = new WaveManager(this);

        this.setupEvents();
        this.resize();

        window.addEventListener('resize', () => this.resize());
        requestAnimationFrame(this.gameLoop.bind(this));
    }

    setupEvents() {
        try {
            // Map Selection Buttons
            document.querySelectorAll('.map-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const mapId = e.target.getAttribute('data-map');
                    this.startGame(mapId);
                });
            });

            // Start Wave Button
            document.getElementById('start-wave-btn').addEventListener('click', () => {
                this.waveManager.startNextWave();
            });

            // Upgrade/Sell Buttons
            document.getElementById('btn-upgrade').addEventListener('click', () => {
                try { this.actionUpgrade(); } catch (e) { alert("Upgrade Error: " + e.message); }
            });
            document.getElementById('btn-sell').addEventListener('click', () => {
                try { this.actionSell(); } catch (e) { alert("Sell Error: " + e.message); }
            });
            document.getElementById('btn-close-panel').addEventListener('click', () => this.deselectTower());

            // Tower Selection (Place Mode)
            document.querySelectorAll('.tower-card').forEach(card => {
                card.addEventListener('click', (e) => {
                    this.deselectTower();
                    document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));
                    e.currentTarget.classList.add('selected');
                    this.selectedTowerType = e.currentTarget.getAttribute('data-type');
                });
            });

            // Canvas Click (Place OR Select)
            this.canvas.addEventListener('mousedown', (e) => {
                try {
                    if (!this.isPlaying) return;
                    if (e.target !== this.canvas) return;

                    const rect = this.canvas.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;

                    // 1. Check if clicking an EXISTING tower
                    const clickedTower = this.towers.find(t => {
                        const dx = t.x - x;
                        const dy = t.y - y;
                        return Math.sqrt(dx * dx + dy * dy) < 20;
                    });

                    if (clickedTower) {
                        this.selectTower(clickedTower);
                    } else if (this.selectedTowerType) {
                        this.placeTower(x, y);
                    } else {
                        this.deselectTower();
                    }
                } catch (err) {
                    alert("Click Error: " + err.message + "\nStack: " + err.stack);
                }
            });

            // Mouse Move
            this.canvas.addEventListener('mousemove', (e) => {
                const rect = this.canvas.getBoundingClientRect();
                this.mouseX = e.clientX - rect.left;
                this.mouseY = e.clientY - rect.top;
            });

        } catch (err) {
            alert("Setup Error: " + err.message);
        }
    }

    // --- SELECTION LOGIC ---
    selectTower(tower) {
        this.selectedTower = tower;
        this.selectedTowerType = null;
        document.querySelectorAll('.tower-card').forEach(c => c.classList.remove('selected'));

        this.updateUpgradePanel();
        document.getElementById('upgrade-panel').style.display = 'flex';
    }

    deselectTower() {
        this.selectedTower = null;
        document.getElementById('upgrade-panel').style.display = 'none';
    }

    updateUpgradePanel() {
        if (!this.selectedTower) return;
        const t = this.selectedTower;

        const lvl = document.getElementById('info-lvl');
        const dmg = document.getElementById('info-dmg');
        const sell = document.getElementById('sell-value');
        const costEl = document.getElementById('upgrade-cost');
        const btnUpgrade = document.getElementById('btn-upgrade');

        if (lvl) lvl.innerText = t.level + (t.level >= t.maxLevel ? " (MAX)" : "");
        if (dmg) dmg.innerText = t.damage;
        if (sell) sell.innerText = '$' + t.getSellValue();

        if (t.canUpgrade()) {
            const cost = t.getUpgradeCost();
            if (costEl) costEl.innerText = '$' + cost;
            btnUpgrade.disabled = false;
            btnUpgrade.style.opacity = 1;
            btnUpgrade.innerText = `UPGRADE ($${cost})`;
        } else {
            btnUpgrade.disabled = true;
            btnUpgrade.style.opacity = 0.5;
            btnUpgrade.innerText = "MAX LEVEL";
        }
    }

    actionUpgrade() {
        if (!this.selectedTower) return;
        const cost = this.selectedTower.getUpgradeCost();

        if (this.cash >= cost && this.selectedTower.canUpgrade()) {
            this.cash -= cost;
            this.selectedTower.upgrade();
            this.updateStats();
            this.updateUpgradePanel();
        }
    }

    actionSell() {
        if (!this.selectedTower) return;

        const value = this.selectedTower.getSellValue();
        this.cash += value;

        const index = this.towers.indexOf(this.selectedTower);
        if (index > -1) {
            this.towers.splice(index, 1);
        }

        this.deselectTower();
        this.updateStats();
    }

    // --- GAME ENGINE ---

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        if (this.isPlaying) this.draw();
    }

    placeTower(x, y) {
        if (!this.selectedTowerType) return;

        let cost = 0;
        if (this.selectedTowerType === 'turret') cost = 100;
        if (this.selectedTowerType === 'sniper') cost = 300;
        if (this.selectedTowerType === 'cannon') cost = 500;

        if (this.cash < cost) return;

        for (let t of this.towers) {
            const dx = t.x - x;
            const dy = t.y - y;
            if (Math.sqrt(dx * dx + dy * dy) < 40) return;
        }

        if (this.mapManager.currentMap) {
            const waypoints = this.mapManager.currentMap.waypoints;
            const pathWidth = 40;
            for (let i = 0; i < waypoints.length - 1; i++) {
                const p1 = { x: waypoints[i].x * this.width, y: waypoints[i].y * this.height };
                const p2 = { x: waypoints[i + 1].x * this.width, y: waypoints[i + 1].y * this.height };
                if (this.distToSegment(x, y, p1.x, p1.y, p2.x, p2.y) < pathWidth) return;
            }
        }

        const tower = new Tower(this.selectedTowerType, x, y);
        this.towers.push(tower);

        this.cash -= cost;
        this.updateStats();
    }

    distToSegment(x, y, x1, y1, x2, y2) {
        const A = x - x1;
        const B = y - y1;
        const C = x2 - x1;
        const D = y2 - y1;
        const dot = A * C + B * D;
        const len_sq = C * C + D * D;
        let param = -1;
        if (len_sq != 0) param = dot / len_sq;
        let xx, yy;
        if (param < 0) { xx = x1; yy = y1; }
        else if (param > 1) { xx = x2; yy = y2; }
        else { xx = x1 + param * C; yy = y1 + param * D; }
        const dx = x - xx;
        const dy = y - yy;
        return Math.sqrt(dx * dx + dy * dy);
    }

    startGame(mapId) {
        this.mapManager.loadMap(mapId);
        this.isPlaying = true;
        this.towers = [];
        this.enemies = [];
        this.projectiles = [];

        this.cash = 600;
        this.lives = 20;
        this.updateStats();

        this.waveManager.waveIndex = 0;
        this.waveManager.isWaveActive = false;
        this.waveManager.queue = [];

        document.getElementById('main-menu').style.display = 'none';
        document.getElementById('game-hud').style.display = 'flex';
        document.getElementById('tower-panel').style.display = 'flex';
        document.getElementById('start-wave-btn').style.display = 'block';
        document.getElementById('upgrade-panel').style.display = 'none';
    }

    updateStats() {
        const cashEl = document.getElementById('cash-display');
        const livesEl = document.getElementById('lives-display');
        if (cashEl) cashEl.innerText = '$' + this.cash;
        if (livesEl) livesEl.innerText = this.lives;
    }

    gameLoop(timestamp) {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        if (this.isPlaying) {
            try {
                this.update(deltaTime);
                this.draw();
            } catch (e) {
                console.error("Game Loop Error:", e);
                this.isPlaying = false;
                alert("Game Loop Error: " + e.message);
            }
        }

        requestAnimationFrame(this.gameLoop.bind(this));
    }

    update(deltaTime) {
        this.waveManager.update(deltaTime);

        // Update Projectiles
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            const hit = p.update(deltaTime, this.width, this.height);

            if (hit) {
                this.cash += 1;
                this.updateStats();
                if (this.selectedTower) this.updateUpgradePanel();
            }

            if (!p.active) this.projectiles.splice(i, 1);
        }

        // Update Enemies
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime, this.width, this.height);

            if (enemy.reachedEnd) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateStats();
                if (this.lives <= 0) {
                    alert("Game Over! Try again.");
                    this.isPlaying = false;
                    location.reload();
                }
            } else if (enemy.health <= 0) {
                this.enemies.splice(i, 1);
            }
        }

        // Update Towers
        this.towers.forEach(tower => {
            const proj = tower.update(deltaTime, this.enemies, this.width, this.height);
            if (proj) {
                this.projectiles.push(proj);
            }
        });
    }

    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.mapManager.draw(this.ctx, this.width, this.height);

        this.towers.forEach(tower => tower.draw(this.ctx));
        this.enemies.forEach(enemy => enemy.draw(this.ctx, this.width, this.height));
        this.projectiles.forEach(p => p.draw(this.ctx));

        if (this.selectedTower) {
            const px = this.selectedTower.x;
            const py = this.selectedTower.y;
            this.ctx.save();
            this.ctx.translate(px, py);

            this.ctx.beginPath();
            this.ctx.arc(0, 0, this.selectedTower.range, 0, Math.PI * 2);
            this.ctx.strokeStyle = "rgba(255, 255, 255, 0.5)";
            this.ctx.lineWidth = 1;
            this.ctx.setLineDash([5, 5]);
            this.ctx.stroke();

            this.ctx.beginPath();
            this.ctx.arc(0, 0, 20, 0, Math.PI * 2);
            this.ctx.strokeStyle = "#FFFF00";
            this.ctx.lineWidth = 3;
            this.ctx.setLineDash([]);
            this.ctx.stroke();

            this.ctx.restore();
        }

        if (this.selectedTowerType) {
            this.ctx.save();
            this.ctx.globalAlpha = 0.5;
            this.ctx.translate(this.mouseX, this.mouseY);

            let valid = true;
            let cost = 0;
            if (this.selectedTowerType === 'turret') cost = 100;
            if (this.selectedTowerType === 'sniper') cost = 300;
            if (this.selectedTowerType === 'cannon') cost = 500;
            if (this.cash < cost) valid = false;

            if (this.mapManager.currentMap) {
                const waypoints = this.mapManager.currentMap.waypoints;
                for (let i = 0; i < waypoints.length - 1; i++) {
                    const p1 = { x: waypoints[i].x * this.width, y: waypoints[i].y * this.height };
                    const p2 = { x: waypoints[i + 1].x * this.width, y: waypoints[i + 1].y * this.height };
                    if (this.distToSegment(this.mouseX, this.mouseY, p1.x, p1.y, p2.x, p2.y) < 40) valid = false;
                }
            }

            this.ctx.fillStyle = valid ? '#fff' : '#f00';
            this.ctx.beginPath();
            this.ctx.arc(0, 0, 15, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.beginPath();
            let range = 100;
            if (this.selectedTowerType === 'turret') range = 150;
            if (this.selectedTowerType === 'sniper') range = 500;
            if (this.selectedTowerType === 'cannon') range = 200;
            this.ctx.arc(0, 0, range, 0, Math.PI * 2);
            this.ctx.lineWidth = 1;
            this.ctx.strokeStyle = valid ? '#fff' : '#f00';
            this.ctx.stroke();
            this.ctx.restore();
        }
    }
}

window.game = new Game();
