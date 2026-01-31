class Tower {
    constructor(type, x, y) {
        this.type = type;
        this.x = x;
        this.y = y;
        this.lastShotTime = 0;
        this.angle = 0;

        // Stats
        this.level = 1;
        this.maxLevel = 3;
        this.costInvested = 0; // Will be set on spawn

        // Define tower stats based on type
        // 'range' is in pixels (approx)
        if (type === 'turret') {
            this.baseRange = 150;
            this.baseDamage = 5;
            this.baseFireRate = 500;
            this.color = '#777';
            this.barrelLength = 20;
            this.costInvested = 100;
        } else if (type === 'sniper') {
            this.baseRange = 500;
            this.baseDamage = 15;
            this.baseFireRate = 3000;
            this.color = '#555';
            this.barrelLength = 40;
            this.costInvested = 300;
        } else if (type === 'cannon') {
            this.baseRange = 200;
            this.baseDamage = 20;
            this.baseFireRate = 2000;
            this.color = '#333';
            this.barrelLength = 25;
            this.width = 20;
            this.costInvested = 500;
        }

        this.range = this.baseRange;
        this.damage = this.baseDamage;
        this.fireRate = this.baseFireRate;
    }

    canUpgrade() {
        return this.level < this.maxLevel;
    }

    getUpgradeCost() {
        // Upgrade cost is 75% of base cost (approx logic)
        // Simplified: 80 for turret, 200 for sniper, 400 for cannon
        if (this.type === 'turret') return 80 * this.level;
        if (this.type === 'sniper') return 250 * this.level;
        if (this.type === 'cannon') return 400 * this.level;
        return 0;
    }

    getSellValue() {
        return Math.floor(this.costInvested / 2);
    }

    upgrade() {
        if (!this.canUpgrade()) return;

        const cost = this.getUpgradeCost();
        this.costInvested += cost;
        this.level++;

        // Boost Stats
        this.damage = Math.floor(this.damage * 1.5);
        this.fireRate = Math.floor(this.fireRate * 0.85); // Faster
        this.range = Math.floor(this.range * 1.1);
    }

    update(deltaTime, enemies, width, height) {
        this.lastShotTime += deltaTime;

        // Find target
        let target = null;
        let closestDist = Infinity;

        for (const enemy of enemies) {
            const dx = enemy.x * width - this.x;
            const dy = enemy.y * height - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < this.range && dist < closestDist) {
                closestDist = dist;
                target = enemy;
            }
        }

        if (target) {
            const dx = target.x * width - this.x;
            const dy = target.y * height - this.y;
            this.angle = Math.atan2(dy, dx);

            // Fire?
            if (this.lastShotTime >= this.fireRate) {
                this.lastShotTime = 0;
                return new Projectile(
                    this.x, this.y, target,
                    this.damage, 0.4, // Bullet speed
                    this.color, 'bullet'
                );
            }
        }
        return null;
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Draw Base
        ctx.fillStyle = '#bbb';
        ctx.beginPath();
        ctx.arc(0, 0, 15, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Level Indicators
        ctx.fillStyle = "#FFD700"; // Gold
        for (let i = 0; i < this.level; i++) {
            ctx.beginPath();
            ctx.arc(-8 + (8 * i), 8, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        // Rotate Turret
        ctx.rotate(this.angle);

        // Draw Barrel
        ctx.fillStyle = this.color;
        ctx.fillRect(0, -5, this.barrelLength, 10);
        ctx.strokeRect(0, -5, this.barrelLength, 10);

        // Draw Turret Top
        ctx.fillStyle = this.color;
        ctx.beginPath();
        if (this.type === 'cannon') {
            ctx.rect(-10, -10, 20, 20);
        } else {
            ctx.arc(0, 0, 10, 0, Math.PI * 2);
        }
        ctx.fill();
        ctx.stroke();

        ctx.restore();
    }
}
