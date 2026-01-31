// --- ULTRA-PREMIUM TOWER DRAWINGS (ALL 18 TYPES) ---
const metalGrad = (ctx, x1, y1, x2, y2, type = 'steel') => {
    const g = ctx.createLinearGradient(x1, y1, x2, y2);
    if (type === 'steel') {
        g.addColorStop(0, '#444'); g.addColorStop(0.3, '#888'); g.addColorStop(0.5, '#AAA'); g.addColorStop(0.7, '#888'); g.addColorStop(1, '#444');
    } else if (type === 'chrome') {
        g.addColorStop(0, '#222'); g.addColorStop(0.2, '#DDD'); g.addColorStop(0.5, '#FFF'); g.addColorStop(0.8, '#DDD'); g.addColorStop(1, '#222');
    } else if (type === 'iron') {
        g.addColorStop(0, '#111'); g.addColorStop(0.5, '#333'); g.addColorStop(1, '#111');
    }
    return g;
};

const drawBase = (ctx, lvl) => {
    ctx.fillStyle = metalGrad(ctx, -22, -22, 22, 22, 'steel');
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const a = i * Math.PI / 3;
        ctx.lineTo(Math.cos(a) * 22, Math.sin(a) * 22);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = metalGrad(ctx, -18, -18, 18, 18, 'iron');
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const pulse = (Math.sin(Date.now() / 250) + 1) / 2;
    ctx.fillStyle = `rgba(0, 255, 0, ${0.4 + pulse * 0.6})`;
    ctx.fillRect(-12, -12, 4, 3);
};

TOWER_TYPES.turret.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -12, -12, 12, 12, 'steel');
    ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const bLen = 22 + lvl * 6;
    ctx.fillStyle = metalGrad(ctx, 0, -6, 0, 6, 'steel');
    if (lvl === 1) {
        ctx.fillRect(0, -5, bLen, 10); ctx.strokeRect(0, -5, bLen, 10);
    } else if (lvl === 2) {
        ctx.fillRect(0, -11, bLen, 8); ctx.strokeRect(0, -11, bLen, 8);
        ctx.fillRect(0, 3, bLen, 8); ctx.strokeRect(0, 3, bLen, 8);
    } else {
        ctx.fillRect(0, -15, bLen, 7); ctx.strokeRect(0, -15, bLen, 7);
        ctx.fillRect(0, -3.5, bLen, 7); ctx.strokeRect(0, -3.5, bLen, 7);
        ctx.fillRect(0, 8, bLen, 7); ctx.strokeRect(0, 8, bLen, 7);
    }
};

TOWER_TYPES.sniper.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -15, -15, 15, 15, 'iron');
    ctx.beginPath(); ctx.moveTo(-18, -12); ctx.lineTo(18, 0); ctx.lineTo(-18, 12); ctx.closePath(); ctx.fill(); ctx.stroke();
    const bLen = 50 + lvl * 10;
    ctx.fillStyle = metalGrad(ctx, 0, -4, 0, 4, 'steel');
    ctx.fillRect(0, -4, bLen, 8); ctx.strokeRect(0, -4, bLen, 8);
    ctx.fillStyle = '#111'; ctx.fillRect(10, -9, 15, 5);
    if (lvl >= 2) {
        ctx.strokeStyle = '#F00'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(bLen, 0); ctx.lineTo(bLen + 100, 0); ctx.stroke();
    }
};

TOWER_TYPES.minigun.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    const rot = (Date.now() / 40) % (Math.PI * 2);
    drawBase(ctx, lvl);
    ctx.save(); ctx.rotate(rot);
    const bLen = 30 + lvl * 5;
    for (let i = 0; i < 6; i++) {
        ctx.rotate(Math.PI / 3);
        ctx.fillStyle = metalGrad(ctx, 4, -2, 4, 2, 'steel');
        ctx.fillRect(4, -2, bLen, 4); ctx.strokeRect(4, -2, bLen, 4);
    }
    ctx.restore();
};

TOWER_TYPES.cannon.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -18, -18, 18, 18, 'iron');
    ctx.fillRect(-18, -16, 30, 32); ctx.strokeRect(-18, -16, 30, 32);
    const bWidth = 20 + lvl * 4;
    const bLen = 30 + lvl * 6;
    ctx.fillStyle = metalGrad(ctx, 0, -bWidth / 2, 0, bWidth / 2, 'steel');
    ctx.fillRect(0, -bWidth / 2, bLen, bWidth); ctx.strokeRect(0, -bWidth / 2, bLen, bWidth);
};

TOWER_TYPES.missile.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -20, -20, 20, 20, 'iron');
    ctx.fillRect(-18, -18, 36, 36); ctx.strokeRect(-18, -18, 36, 36);
    for (let x = -10; x <= 10; x += 20) {
        for (let y = -10; y <= 10; y += 20) {
            ctx.fillStyle = '#D32F2F'; ctx.beginPath(); ctx.arc(x, y, 2 + lvl, 0, Math.PI * 2); ctx.fill();
        }
    }
};

TOWER_TYPES.flame.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -15, -15, 15, 15, 'iron');
    ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const nLen = 25 + lvl * 5;
    ctx.fillStyle = metalGrad(ctx, 0, -8, 0, 8, 'steel');
    ctx.fillRect(0, -8, nLen, 16); ctx.strokeRect(0, -8, nLen, 16);
};

TOWER_TYPES.poison.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -18, -18, 18, 18, 'iron');
    ctx.fillRect(-18, -18, 36, 36);
    ctx.fillStyle = 'rgba(0, 255, 0, 0.4)';
    ctx.fillRect(-12, -12, 10, 24);
};

TOWER_TYPES.ice.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -16, -16, 16, 16, 'steel');
    ctx.beginPath(); ctx.roundRect(-16, -16, 32, 32, 8); ctx.fill(); ctx.stroke();
    ctx.shadowBlur = 10; ctx.shadowColor = '#00E5FF';
    ctx.fillStyle = '#E0F7FA'; ctx.beginPath(); ctx.moveTo(0, -12); ctx.lineTo(10, 0); ctx.lineTo(0, 12); ctx.lineTo(-10, 0); ctx.closePath(); ctx.fill();
    ctx.shadowBlur = 0;
};

TOWER_TYPES.volcano.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = '#1A0F0E'; ctx.beginPath();
    for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4; const r = 18 + lvl * 4;
        ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.strokeStyle = '#FF5722'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(-10, -10); ctx.lineTo(10, 10); ctx.moveTo(10, -10); ctx.lineTo(-10, 10); ctx.stroke();
};

TOWER_TYPES.tesla.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = '#263238'; ctx.fillRect(-10, -18, 20, 36);
    for (let i = 0; i < 2 + lvl; i++) {
        const y = 10 - i * 10;
        ctx.fillStyle = metalGrad(ctx, -15, y, 15, y, 'steel');
        ctx.beginPath(); ctx.ellipse(0, y, 15 - i * 2, 5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    }
};

TOWER_TYPES.laser.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -15, -15, 15, 15, 'iron');
    ctx.beginPath(); ctx.moveTo(18, 0); ctx.lineTo(-15, 15); ctx.lineTo(-15, -15); ctx.closePath(); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#F44336'; ctx.beginPath(); ctx.arc(5, 0, 4 + lvl, 0, Math.PI * 2); ctx.fill();
};

TOWER_TYPES.voidray.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.strokeStyle = metalGrad(ctx, -20, -20, 20, 20, 'chrome'); ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, 18, 0.5, 2.5); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 18, 3.5, 5.5); ctx.stroke();
    ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(0, 0, 8 + lvl, 0, Math.PI * 2); ctx.fill();
};

TOWER_TYPES.railgun.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -18, -12, 18, 12, 'iron');
    ctx.fillRect(-22, -14, 30, 28);
    const rLen = 50 + lvl * 10;
    ctx.fillStyle = metalGrad(ctx, 0, -8, 0, 8, 'steel');
    ctx.fillRect(0, -9, rLen, 4); ctx.fillRect(0, 5, rLen, 4);
};

TOWER_TYPES.shockwave.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -15, -15, 15, 15, 'iron');
    ctx.beginPath(); ctx.roundRect(-16, -16, 32, 32, 10); ctx.fill(); ctx.stroke();
};

TOWER_TYPES.radar.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    const rot = (Date.now() / 600) % (Math.PI * 2);
    drawBase(ctx, lvl);
    ctx.save(); ctx.rotate(rot);
    ctx.fillStyle = metalGrad(ctx, -20, -20, 0, 0, 'steel');
    ctx.beginPath(); ctx.arc(0, 0, 18, Math.PI, 0); ctx.fill(); ctx.stroke();
    ctx.restore();
};

TOWER_TYPES.bank.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -18, -18, 18, 18, 'iron');
    ctx.beginPath(); ctx.roundRect(-20, -18, 40, 36, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#0F0'; ctx.font = 'bold 12px monospace';
    ctx.fillText('$' + (50 * lvl), -12, -4);
};

TOWER_TYPES.grenade.draw = (ctx, tower) => {
    const lvl = tower ? tower.level : 1;
    drawBase(ctx, lvl);
    ctx.fillStyle = metalGrad(ctx, -18, -18, 18, 18, 'iron');
    ctx.beginPath(); ctx.arc(0, 0, 18, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    const bWidth = 16 + lvl * 2;
    ctx.fillStyle = metalGrad(ctx, 0, -bWidth / 2, 0, bWidth / 2, 'steel');
    ctx.fillRect(0, -bWidth / 2, 22, bWidth); ctx.strokeRect(0, -bWidth / 2, 22, bWidth);
};
