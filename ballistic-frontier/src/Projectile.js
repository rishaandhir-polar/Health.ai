class Projectile {
    constructor(x, y, target, damage, speed, color, type) {
        this.x = x;
        this.y = y;
        this.target = target;
        this.damage = damage;
        this.speed = speed;
        this.color = color;
        this.type = type; // 'bullet' or 'missile'

        this.active = true;
        this.radius = 3;
    }

    update(deltaTime, width, height) {
        if (!this.active) return;

        // If target is dead/gone, just continue in last direction? 
        // For simple MVP, we'll just despawn if target is gone or hit target position
        // Better: Projectile homes in on target (guided) or moves to last known pos.
        // Let's do homing for reliability for now.

        if (!this.target || this.target.health <= 0) {
            this.active = false;
            return;
        }

        const tx = this.target.x * width;
        const ty = this.target.y * height;

        const dx = tx - this.x;
        const dy = ty - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 10) { // Hit
            this.active = false;
            this.target.takeDamage(this.damage);
            return true; // Hit successful
        } else {
            // Move
            const moveDist = this.speed * deltaTime;
            this.x += (dx / dist) * moveDist;
            this.y += (dy / dist) * moveDist;
        }
        return false;
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fill();
    }
}
