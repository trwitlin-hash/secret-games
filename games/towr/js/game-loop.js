function updateHUD() {
    document.getElementById('goldDisplay').textContent = gold;
    document.getElementById('scoreDisplay').textContent = score;
    document.getElementById('waveDisplay').textContent = wave;
    document.getElementById('levelDisplay').textContent = level;
    document.getElementById('hpBar').style.width = `${(tower.hp / tower.maxHp) * 100}%`;
}

function update() {
    if (gameState !== 'playing') return;
    
    if (tower.regen > 0 && tower.hp < tower.maxHp) {
        tower.hp = Math.min(tower.maxHp, tower.hp + tower.regen * 0.016);
    }
    
    updateStars();
    spawnWaveEnemies();
    updateProjectiles();
    updateEnemies();
    updateParticles();
    updateCombo();
    
    updateHUD();
    updateUpgradeUI();
}

function updateStars() {
    stars.forEach(star => {
        star.y += star.speed;
        if (star.y > canvas.height) {
            star.y = 0;
            star.x = Math.random() * canvas.width;
        }
    });
}

function updateCombo() {
    if (comboTimer > 0) {
        comboTimer--;
    } else {
        comboMultiplier = 1;
    }
}