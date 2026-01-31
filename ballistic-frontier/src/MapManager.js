class MapManager {
    constructor() {
        // Define maps with waypoints (normalized 0-1 coordinates) and visual themes
        this.maps = {
            desert: {
                name: "Desert Dunes",
                colors: { background: "#e6c288", path: "#d4a860", decor: "#c2a070", accent: "#a88b5e" },
                waypoints: [
                    { x: 0, y: 0.2 }, { x: 0.3, y: 0.2 }, { x: 0.3, y: 0.7 },
                    { x: 0.7, y: 0.7 }, { x: 0.7, y: 0.3 }, { x: 1.0, y: 0.3 }
                ],
                decorations: 25 // Cacti/Palms
            },
            arctic: {
                name: "Frozen Tundra",
                colors: { background: "#e8f4f8", path: "#b8dbe6", decor: "#d1eefc", accent: "#a3d5eb" },
                waypoints: [
                    { x: 0.1, y: 0 }, { x: 0.1, y: 0.5 }, { x: 0.5, y: 0.5 },
                    { x: 0.5, y: 0.2 }, { x: 0.9, y: 0.2 }, { x: 0.9, y: 1.0 }
                ],
                decorations: 20 // Snowmen/Igloos
            },
            grassland: {
                name: "Green Meadows",
                colors: { background: "#88c96c", path: "#d4b483", decor: "#6ab04c", accent: "#539e3a" },
                waypoints: [
                    { x: 0, y: 0.8 }, { x: 0.2, y: 0.8 }, { x: 0.2, y: 0.4 },
                    { x: 0.5, y: 0.4 }, { x: 0.5, y: 0.8 }, { x: 0.8, y: 0.8 },
                    { x: 0.8, y: 0.2 }, { x: 1.0, y: 0.2 }
                ],
                decorations: 40 // Trees/Flowers
            }
        };

        this.currentMap = null;
        this.staticProps = [];
    }

    loadMap(mapId) {
        if (this.maps[mapId]) {
            this.currentMap = this.maps[mapId];
            this.generateDecorations();
            return this.currentMap;
        }
        return null;
    }

    generateDecorations() {
        this.staticProps = [];
        const count = this.currentMap.decorations;
        for (let i = 0; i < count; i++) {
            this.staticProps.push({
                x: Math.random(),
                y: Math.random(),
                size: Math.random() * 0.5 + 0.5, // Scale 0.5 to 1.0
                type: Math.floor(Math.random() * 3) // Variant
            });
        }
    }

    draw(ctx, width, height) {
        if (!this.currentMap) return;

        const { colors, waypoints } = this.currentMap;

        // 1. Draw Background terrain
        ctx.fillStyle = colors.background;
        ctx.fillRect(0, 0, width, height);

        // Pattern Texture (Subtle dots)
        ctx.fillStyle = "rgba(0,0,0,0.03)";
        for (let i = 0; i < 100; i++) {
            ctx.beginPath();
            ctx.arc(Math.random() * width, Math.random() * height, 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // 2. Draw Decorations (Bottom Layer)
        this.staticProps.forEach(prop => {
            const px = prop.x * width;
            const py = prop.y * height;

            // Only draw if NOT on path (simple check)
            // Ideally we check distance to segment, but for visuals we assume random placement is fine
            // and we rely on 'draw behind path' logic or z-indexing.
            // Actually, let's draw them BEFORE the path, so if they overlap, path covers them (prevent blocking view)

            this.drawProp(ctx, px, py, prop.size, this.currentMap.name, prop.type);
        });

        // 3. Draw Path
        // Outer Shadow/Border
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineWidth = 70;
        ctx.strokeStyle = "rgba(0,0,0,0.15)";
        this.tracePath(ctx, waypoints, width, height);
        ctx.stroke();

        // Main Path
        ctx.lineWidth = 60;
        ctx.strokeStyle = colors.path;
        this.tracePath(ctx, waypoints, width, height);
        ctx.stroke();

        // Path Texture (Tracks)
        ctx.lineWidth = 50;
        ctx.strokeStyle = "rgba(255,255,255,0.1)";
        ctx.setLineDash([20, 20]);
        this.tracePath(ctx, waypoints, width, height);
        ctx.stroke();
        ctx.setLineDash([]); // Reset

        // 4. Start/End Areas
        const start = waypoints[0];
        const end = waypoints[waypoints.length - 1];

        // Start Base
        ctx.fillStyle = "#333";
        ctx.beginPath();
        ctx.arc(start.x * width, start.y * height, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.font = "bold 20px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("START", start.x * width, start.y * height);

        // End Base
        ctx.fillStyle = "#d32f2f";
        ctx.beginPath();
        ctx.arc(end.x * width, end.y * height, 40, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.fillText("BASE", end.x * width, end.y * height);
    }

    drawProp(ctx, x, y, scale, mapName, type) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        if (mapName.includes("Desert")) {
            this.drawPalmTree(ctx);
        } else if (mapName.includes("Frozen")) {
            this.drawSnowProp(ctx, type);
        } else {
            this.drawTree(ctx);
        }

        ctx.restore();
    }

    drawPalmTree(ctx) {
        // Trunk
        ctx.fillStyle = "#8d6e63";
        ctx.beginPath();
        ctx.moveTo(-5, 40);
        ctx.quadraticCurveTo(5, 20, -2, 0);
        ctx.lineTo(2, 0);
        ctx.quadraticCurveTo(10, 20, 5, 40);
        ctx.fill();

        // Leaves
        ctx.fillStyle = "#43a047";
        for (let i = 0; i < 5; i++) {
            ctx.save();
            ctx.rotate((i * 72) * Math.PI / 180);
            ctx.beginPath();
            ctx.ellipse(0, -15, 5, 20, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        }
        // Coconut
        ctx.fillStyle = "#3e2723";
        ctx.beginPath();
        ctx.arc(-3, -3, 4, 0, Math.PI * 2);
        ctx.fill();
    }

    drawTree(ctx) {
        // Trunk
        ctx.fillStyle = "#5d4037";
        ctx.fillRect(-5, 0, 10, 30);

        // Leaves (Bushy)
        ctx.fillStyle = "#2e7d32";
        ctx.beginPath();
        ctx.arc(0, -10, 20, 0, Math.PI * 2);
        ctx.arc(-15, 5, 15, 0, Math.PI * 2);
        ctx.arc(15, 5, 15, 0, Math.PI * 2);
        ctx.fill();

        // Highlight
        ctx.fillStyle = "#66bb6a";
        ctx.beginPath();
        ctx.arc(-5, -15, 8, 0, Math.PI * 2);
        ctx.fill();
    }

    drawSnowProp(ctx, type) {
        if (Math.floor(type) % 2 === 0) {
            // Snowman
            ctx.fillStyle = "#fff";
            // Bottom
            ctx.beginPath(); ctx.arc(0, 20, 15, 0, Math.PI * 2); ctx.fill();
            // Middle
            ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI * 2); ctx.fill();
            // Head
            ctx.beginPath(); ctx.arc(0, -15, 8, 0, Math.PI * 2); ctx.fill();

            // Eyes
            ctx.fillStyle = "#000";
            ctx.beginPath(); ctx.arc(-3, -17, 2, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(3, -17, 2, 0, Math.PI * 2); ctx.fill();
        } else {
            // Pine Tree (Snowy)
            ctx.fillStyle = "#455a64"; // Trunk
            ctx.fillRect(-3, 10, 6, 20);

            ctx.fillStyle = "#37474f"; // Dark Green/Blue
            ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(15, 10); ctx.lineTo(-15, 10); ctx.fill();
            ctx.beginPath(); ctx.moveTo(0, -20); ctx.lineTo(20, 20); ctx.lineTo(-20, 20); ctx.fill();

            // Snow on top
            ctx.fillStyle = "#fff";
            ctx.beginPath(); ctx.moveTo(0, -30); ctx.lineTo(6, -15); ctx.lineTo(-6, -15); ctx.fill();
        }
    }

    tracePath(ctx, waypoints, width, height) {
        ctx.beginPath();
        if (waypoints.length > 0) {
            ctx.moveTo(waypoints[0].x * width, waypoints[0].y * height);
            for (let i = 1; i < waypoints.length; i++) {
                ctx.lineTo(waypoints[i].x * width, waypoints[i].y * height);
            }
        }
    }
}
