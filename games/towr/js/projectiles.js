function createParticles(x, y, color, count = 10) {
    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4 + 2;
        particles.push({
            x, y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            color,
            size: Math.random() * 4 + 2
        });
    }
}

function showCombo(x, y, multiplier) {
    const comboEl = document.createElement('div');
    comboEl.className = 'combo-text';
    comboEl.textContent = `${multiplier}x COMBO!`;
    comboEl.style.left = `${x}px`;
    comboEl.style.top = `${y}px`;
    document.body.appendChild(comboEl);
    setTimeout(() => comboEl.remove(), 1000);
}

function updateProjectiles() {
    projectiles.forEach((proj, index) => {
        proj.trail.push({ x: proj.x, y: proj.y });
        if (proj.trail.length > 10) proj.trail.shift();
        
        const prevX = proj.x;
        const prevY = proj.y;
        
        proj.x += proj.vx;
        proj.y += proj.vy;
        
        const steps = 12;
        for (let step = 1; step <= steps; step++) {
            const t = step / steps;
            const checkX = prevX + (proj.x - prevX) * t;
            const checkY = prevY + (proj.y - prevY) * t;
            
            for (let eIndex = enemies.length - 1; eIndex >= 0; eIndex--) {
                const enemy = enemies[eIndex];
                if (proj.pierce > 0 && enemy.hitList && enemy.hitList.includes(index)) continue;
                
                const dx = checkX - enemy.x;
                const dy = checkY - enemy.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < enemy.size + 12) {
                    enemy.hp -= proj.damage;
                    proj.pierce--;
                    
                    if (!enemy.hitList) enemy.hitList = [];
                    enemy.hitList.push(index);
                    
                    createParticles(checkX, checkY, '#ffff00', 5);
                    
                    if (enemy.hp <= 0) {
                        const goldReward = Math.floor(enemy.gold * comboMultiplier * 0.6);
                        gold += goldReward;
                        score += Math.floor(enemy.maxHp);
                        
                        comboTimer = 60;
                        comboMultiplier = Math.min(5, comboMultiplier + 0.5);
                        showCombo(enemy.x, enemy.y, Math.floor(comboMultiplier));
                        
                        createParticles(enemy.x, enemy.y, enemy.color, 20);
                        
                        if (enemy.special === 'split') {
                            for (let i = 0; i < 3; i++) {
                                const angle = (i / 3) * Math.PI * 2;
                                enemies.push({
                                    x: enemy.x + Math.cos(angle) * 30,
                                    y: enemy.y + Math.sin(angle) * 30,
                                    sides: 0,
                                    color: '#ff88cc',
                                    speed: 1.2,
                                    hp: 10,
                                    maxHp: 10,
                                    size: 15,
                                    gold: 5,
                                    angle: 0,
                                    hitList: []
                                });
                            }
                        }
                        
                        enemies.splice(eIndex, 1);
                    }
                    
                    if (proj.pierce <= 0) {
                        projectiles.splice(index, 1);
                        return;
                    }
                }
            }
        }
        
        if (proj.x < -50 || proj.x > canvas.width + 50 || proj.y < -50 || proj.y > canvas.height + 50) {
            projectiles.splice(index, 1);
        }
    });
}

function updateParticles() {
    particles.forEach((p, index) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.95;
        p.vy *= 0.95;
        p.life -= 0.02;
        if (p.life <= 0) particles.splice(index, 1);
    });
}