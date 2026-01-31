class Enemy {
    constructor(type, waypoints) {
        this.type = type;
        this.waypoints = waypoints;
        this.waypointIndex = 0;
        this.reachedEnd = false;
        this.angle = 0;

        // Start at first waypoint
        if (waypoints.length > 0) {
            this.x = waypoints[0].x;
            this.y = waypoints[0].y;
        } else {
            this.x = 0; this.y = 0;
        }

        // Stats
        if (type === 'soldier') {
            this.speed = 0.0001;
            this.maxHealth = 40;
            this.reward = 10;
            this.radius = 12;
            this.color = '#4CAF50';
        } else if (type === 'scout') {
            this.speed = 0.00025;
            this.maxHealth = 20;
            this.reward = 15;
            this.radius = 10;
            this.color = '#FF9800';
        } else if (type === 'tank') {
            this.speed = 0.00004;
            this.maxHealth = 200;
            this.reward = 50;
            this.radius = 20;
            this.color = '#607D8B';
        }

        this.health = this.maxHealth;
    }

    takeDamage(amount) {
        this.health -= amount;
    }

    update(deltaTime, width, height) {
        if (this.reachedEnd) return;

        // Move towards next waypoint
        if (this.waypointIndex < this.waypoints.length - 1) {
            const target = this.waypoints[this.waypointIndex + 1];

            const dx = target.x - this.x;
            const dy = target.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 0.005) {
                this.waypointIndex++;
                this.x = target.x;
                this.y = target.y;
            } else {
                const moveDist = this.speed * deltaTime;
                this.x += (dx / dist) * moveDist;
                this.y += (dy / dist) * moveDist;

                // Rotation for drawing
                this.angle = Math.atan2(dy, dx);
            }
        } else {
            this.reachedEnd = true;
        }
    }

    draw(ctx, width, height) {
        const px = this.x * width;
        const py = this.y * height;

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(this.angle); // Rotate to face movement

        // Draw Health Bar
        const healthPct = this.health / this.maxHealth;
        ctx.fillStyle = 'red';
        ctx.fillRect(-12, -this.radius - 12, 24, 4);
        ctx.fillStyle = '#0f0';
        ctx.fillRect(-12, -this.radius - 12, 24 * healthPct, 4);

        if (this.type === 'tank') {
            // Tank Body
            ctx.fillStyle = "#455A64";
            ctx.fillRect(-15, -15, 30, 30);
            // Treads
            ctx.fillStyle = "#000";
            ctx.fillRect(-15, -18, 30, 6); // Top
            ctx.fillRect(-15, 12, 30, 6);  // Bottom
            // Turret
            ctx.fillStyle = "#78909C";
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            // Barrel
            ctx.fillStyle = "#37474F";
            ctx.fillRect(0, -3, 25, 6);
        } else if (this.type === 'soldier') {
            // Body
            ctx.fillStyle = this.color;
            ctx.beginPath(); ctx.arc(0, 0, 10, 0, Math.PI * 2); ctx.fill();
            // Helmet
            ctx.fillStyle = "#1B5E20";
            ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();
            // Gun
            ctx.fillStyle = "#333";
            ctx.fillRect(0, 2, 12, 4);
        } else if (this.type === 'scout') {
            // Body
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.moveTo(10, 0); ctx.lineTo(-8, 8); ctx.lineTo(-8, -8);
            ctx.fill();
            // Visor
            ctx.fillStyle = "#00BCD4";
            ctx.fillRect(0, -3, 6, 6);
        }
        ctx.restore();
    }
}
