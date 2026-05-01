const enemyTypes = [
    { name: 'triangle', sides: 3, color: '#ff4444', speed: 1.5, hp: 15, size: 20, gold: 3 },
    { name: 'square', sides: 4, color: '#ff8800', speed: 1, hp: 30, size: 25, gold: 6 },
    { name: 'pentagon', sides: 5, color: '#aa44ff', speed: 0.8, hp: 50, size: 30, gold: 12 },
    { name: 'hexagon', sides: 6, color: '#44ff88', speed: 0.5, hp: 100, size: 35, gold: 20 },
    { name: 'circle', sides: 0, color: '#ff44aa', speed: 1.2, hp: 25, size: 22, gold: 8, special: 'split' }
];

let waveEnemiesSpawned = 0;
let waveEnemiesTotal = 0;
let waveSpawnTimer = 0;
let waveDelay = false;

function startWave() {
    waveEnemiesTotal = 8 + Math.floor(wave * 4);
    waveEnemiesSpawned = 0;
    waveSpawnTimer = 0;
    waveDelay = false;
    
    showWaveNotification(`WAVE ${wave}`);
}

function showWaveNotification(text) {
    const notif = document.getElementById('waveNotification');
    notif.textContent = text;
    notif.style.opacity = 1;
    setTimeout(() => notif.style.opacity = 0, 2000);
}

function spawnEnemy() {
    if (waveEnemiesSpawned >= waveEnemiesTotal) return;
    
    let typeIndex;
    const rand = Math.random();
    
    if (wave % 10 === 0 && waveEnemiesSpawned === 0) {
        typeIndex = 4;
    } else {
        const weights = [0.4, 0.3, 0.15, 0.1, 0.05];
        let cumWeight = 0;
        for (let i = 0; i < weights.length; i++) {
            cumWeight += weights[i];
            if (rand < cumWeight) {
                typeIndex = i;
                break;
            }
        }
    }
    
    const type = enemyTypes[typeIndex];
    const angle = Math.random() * Math.PI * 2;
    const dist = Math.max(canvas.width, canvas.height) / 2 + 50;
    
    const enemy = {
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        ...type,
        hp: type.hp * (1 + wave * 0.25),
        maxHp: type.hp * (1 + wave * 0.25),
        speed: type.speed * (1 + wave * 0.05),
        angle: 0,
        hitList: []
    };
    
    enemies.push(enemy);
    waveEnemiesSpawned++;
}

function updateEnemies() {
    enemies.forEach(enemy => {
        const dx = centerX - enemy.x;
        const dy = centerY - enemy.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist > 0) {
            enemy.x += (dx / dist) * enemy.speed;
            enemy.y += (dy / dist) * enemy.speed;
        }
        
        enemy.angle += 0.02;
        
        if (dist < 40) {
            tower.hp -= 10;
            createParticles(centerX, centerY, '#ff4444', 15);
            enemies.splice(enemies.indexOf(enemy), 1);
            
            if (tower.hp <= 0) {
                gameOver();
            }
        }
    });
}

function spawnWaveEnemies() {
    if (!waveDelay && waveEnemiesSpawned < waveEnemiesTotal) {
        waveSpawnTimer++;
        if (waveSpawnTimer > 60 - Math.min(40, wave * 2)) {
            spawnEnemy();
            waveSpawnTimer = 0;
        }
    }
    
    if (waveEnemiesSpawned >= waveEnemiesTotal && enemies.length === 0 && !waveDelay) {
        waveDelay = true;
        setTimeout(() => {
            wave++;
            if (wave % 5 === 0) level++;
            startWave();
            waveDelay = false;
        }, 2000);
    }
}