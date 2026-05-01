const tower = {
    x: centerX,
    y: centerY,
    angle: 0,
    hp: 100,
    maxHp: 100,
    fireRate: 150,
    damage: 25,
    range: 300,
    multiShot: 1,
    pierce: 1,
    regen: 0,
    lastShot: 0
};

const upgrades = {
    fireRate: { level: 1, maxLevel: 10, cost: 35, costMult: 1.4 },
    damage: { level: 1, maxLevel: 10, cost: 50, costMult: 1.5 },
    range: { level: 1, maxLevel: 10, cost: 30, costMult: 1.3 },
    multiShot: { level: 1, maxLevel: 5, cost: 150, costMult: 1.8 },
    pierce: { level: 1, maxLevel: 5, cost: 100, costMult: 1.7 },
    regen: { level: 1, maxLevel: 10, cost: 75, costMult: 1.3 }
};

function initTower() {
    tower.hp = 100;
    tower.maxHp = 100;
    tower.fireRate = 150;
    tower.damage = 25;
    tower.range = 300;
    tower.multiShot = 1;
    tower.pierce = 1;
    tower.regen = 0;
    tower.lastShot = 0;
    tower.x = centerX;
    tower.y = centerY;
}

function resetUpgrades() {
    upgrades.fireRate.level = 1; upgrades.fireRate.cost = 35;
    upgrades.damage.level = 1; upgrades.damage.cost = 50;
    upgrades.range.level = 1; upgrades.range.cost = 30;
    upgrades.multiShot.level = 1; upgrades.multiShot.cost = 150;
    upgrades.pierce.level = 1; upgrades.pierce.cost = 100;
    upgrades.regen.level = 1; upgrades.regen.cost = 75;
}

function purchaseUpgrade(type) {
    const up = upgrades[type];
    if (up.level >= up.maxLevel || gold < up.cost) return;
    
    gold -= up.cost;
    up.level++;
    up.cost = Math.floor(up.cost * up.costMult);
    
    applyUpgrade(type);
    updateUpgradeUI();
    updateHUD();
}

function applyUpgrade(type) {
    switch(type) {
        case 'fireRate':
            tower.fireRate = Math.max(50, 150 - upgrades.fireRate.level * 15);
            break;
        case 'damage':
            tower.damage = 25 + upgrades.damage.level * 8;
            break;
        case 'range':
            tower.range = 300 + upgrades.range.level * 30;
            break;
        case 'multiShot':
            tower.multiShot = upgrades.multiShot.level;
            break;
        case 'pierce':
            tower.pierce = upgrades.pierce.level;
            break;
        case 'regen':
            tower.regen = upgrades.regen.level * 0.5;
            break;
    }
}

function updateUpgradeUI() {
    for (let key in upgrades) {
        const up = upgrades[key];
        const card = document.querySelector(`[data-upgrade="${key}"]`);
        const levelEl = document.getElementById(`${key}Level`);
        const costEl = document.getElementById(`${key}Cost`);
        
        levelEl.textContent = `Lv.${up.level}`;
        costEl.textContent = up.level >= up.maxLevel ? 'MAX' : `${up.cost}g`;
        
        if (up.level >= up.maxLevel || gold < up.cost) {
            card.classList.add('disabled');
        } else {
            card.classList.remove('disabled');
        }
    }
}

canvas.addEventListener('click', (e) => {
    if (gameState !== 'playing') return;
    
    const now = Date.now();
    if (now - tower.lastShot < tower.fireRate) return;
    
    tower.lastShot = now;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
    tower.angle = angle;
    
    const spread = 0.15;
    for (let i = 0; i < tower.multiShot; i++) {
        const shotAngle = angle + (i - (tower.multiShot - 1) / 2) * spread;
        projectiles.push({
            x: centerX + Math.cos(angle) * 40,
            y: centerY + Math.sin(angle) * 40,
            vx: Math.cos(shotAngle) * 8,
            vy: Math.sin(shotAngle) * 8,
            damage: tower.damage,
            pierce: tower.pierce,
            trail: []
        });
    }
});

document.addEventListener('keydown', (e) => {
    if (gameState !== 'playing') return;
    
    const keyMap = { '1': 'fireRate', '2': 'damage', '3': 'range', '4': 'multiShot', '5': 'pierce', '6': 'regen' };
    if (keyMap[e.key]) {
        purchaseUpgrade(keyMap[e.key]);
    }
    if (e.key === ' ') {
        const panel = document.getElementById('upgradePanel');
        panel.style.transform = panel.style.transform === 'translateX(120%)' ? '' : 'translateX(120%)';
    }
});