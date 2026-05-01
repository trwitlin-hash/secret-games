const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

let gameState = 'start';
let gold = 50;
let score = 0;
let wave = 1;
let level = 1;
let comboTimer = 0;
let comboMultiplier = 1;

let projectiles = [];
let enemies = [];
let particles = [];
let stars = [];

for (let i = 0; i < 150; i++) {
    stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speed: Math.random() * 0.5 + 0.1,
        alpha: Math.random() * 0.5 + 0.3
    });
}

function startGame() {
    document.getElementById('startScreen').style.display = 'none';
    gameState = 'playing';
    initTower();
    startWave();
}

function restartGame() {
    document.getElementById('gameOverScreen').style.display = 'none';
    resetGame();
    startGame();
}

function resetGame() {
    initTower();
    gold = 50;
    score = 0;
    wave = 1;
    level = 1;
    comboMultiplier = 1;
    
    projectiles = [];
    enemies = [];
    particles = [];
    
    resetUpgrades();
    updateUpgradeUI();
    updateHUD();
}

function gameOver() {
    gameState = 'gameover';
    document.getElementById('finalScore').textContent = `Score: ${score}`;
    document.getElementById('gameOverScreen').style.display = 'flex';
}

function draw() {
    ctx.fillStyle = '#0a0a1a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, canvas.width / 2);
    gradient.addColorStop(0, '#1a1a3a');
    gradient.addColorStop(1, '#0a0a1a');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    drawStars();
    drawTowerRange();
    drawTower();
    drawEnemies();
    drawProjectiles();
    drawParticles();
}

function drawStars() {
    stars.forEach(star => {
        ctx.beginPath();
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${star.alpha})`;
        ctx.fill();
    });
}

function drawTowerRange() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, tower.range, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    const time = Date.now() * 0.001;
    for (let i = 0; i < 3; i++) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, 30 + Math.sin(time + i) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - i * 0.1})`;
        ctx.lineWidth = 3 - i;
        ctx.stroke();
    }
}

function drawTower() {
    ctx.save();
    ctx.translate(centerX, centerY);
    
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * 35;
        const y = Math.sin(angle) * 35;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = '#1a3a5a';
    ctx.fill();
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.rotate(tower.angle);
    ctx.fillStyle = '#4a9eff';
    ctx.fillRect(-8, -8, 40, 16);
    ctx.beginPath();
    ctx.arc(0, 0, 15, 0, Math.PI * 2);
    ctx.fillStyle = '#00ffff';
    ctx.fill();
    
    ctx.restore();
}

function drawEnemies() {
    enemies.forEach(enemy => {
        ctx.save();
        ctx.translate(enemy.x, enemy.y);
        ctx.rotate(enemy.angle);
        
        ctx.shadowColor = enemy.color;
        ctx.shadowBlur = 15;
        
        if (enemy.sides === 0) {
            ctx.beginPath();
            ctx.arc(0, 0, enemy.size, 0, Math.PI * 2);
            ctx.fillStyle = enemy.color;
            ctx.fill();
        } else {
            ctx.beginPath();
            for (let i = 0; i < enemy.sides; i++) {
                const angle = (i / enemy.sides) * Math.PI * 2 - Math.PI / 2;
                const x = Math.cos(angle) * enemy.size;
                const y = Math.sin(angle) * enemy.size;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.fillStyle = enemy.color;
            ctx.fill();
        }
        
        ctx.shadowBlur = 0;
        ctx.beginPath();
        ctx.arc(0, 0, enemy.size * 0.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        ctx.fill();
        
        ctx.restore();
        
        const hpPercent = enemy.hp / enemy.maxHp;
        if (hpPercent < 1) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40, 5);
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x - 20, enemy.y - enemy.size - 10, 40 * hpPercent, 5);
        }
    });
}

function drawProjectiles() {
    projectiles.forEach(proj => {
        proj.trail.forEach((t, i) => {
            ctx.beginPath();
            ctx.arc(t.x, t.y, 3 * (i / proj.trail.length), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255, 255, 0, ${i / proj.trail.length * 0.5})`;
            ctx.fill();
        });
        
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 20;
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#ffff00';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(proj.x, proj.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.shadowBlur = 0;
    });
}

function drawParticles() {
    particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.fill();
        ctx.globalAlpha = 1;
    });
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tower.x = canvas.width / 2;
    tower.y = canvas.height / 2;
});

gameLoop();