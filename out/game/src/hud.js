// HUD system: crosshair, hitmarker, ammo, health, money, round info, bomb status, kill feed, spectator, buy menu, scoreboard
export function createHud() {
  const crosshair = document.getElementById('crosshair');
  const hitmarker = document.getElementById('hitmarker');
  const healthFill = document.getElementById('health-fill');
  const healthValue = document.getElementById('health-value');
  const ammoMag = document.getElementById('ammo-mag');
  const ammoReserve = document.getElementById('ammo-reserve');
  const ammo = document.getElementById('ammo');
  const moneyValue = document.getElementById('money-value');
  const moneyBonus = document.getElementById('money-bonus');
  const roundTimer = document.getElementById('round-timer');
  const roundPhase = document.getElementById('round-phase');
  const roundScoreCt = document.querySelector('#round-score .ct');
  const roundScoreT = document.querySelector('#round-score .t');
  const bombStatus = document.getElementById('bomb-status');
  const bombTimer = document.getElementById('bomb-timer');
  const bombState = document.getElementById('bomb-state');
  const killFeed = document.getElementById('kill-feed');
  const spectator = document.getElementById('spectator');
  const spectatorName = document.getElementById('spectator-name');
  
  // Overlays
  const overlayTeam = document.getElementById('overlay-team');
  const overlayBuy = document.getElementById('overlay-buy');
  const overlayRoundEnd = document.getElementById('overlay-round-end');
  const overlayScoreboard = document.getElementById('overlay-scoreboard');
  const overlayGameOver = document.getElementById('overlay-game-over');
  
  let hitTimer = 0;
  let lastMag = -1, lastReserve = -1, lastWeapon = '';
  let lastHealth = -1, lastArmor = -1;
  let lastMoney = -1;
  let killEntries = [];
  let buyMenuOpen = false;
  let scoreboardOpen = false;
  let selectedTeam = null;
  let currentWeapon = 'glock';
  let weaponDef = null;
  
  // Buy menu elements
  const buyMoney = document.getElementById('buy-money');
  const buyPrimary = document.getElementById('buy-primary');
  const buySecondary = document.getElementById('buy-secondary');
  const buyEquipment = document.getElementById('buy-equipment');
  const buyGrenades = document.getElementById('buy-grenades');
  const buyAuto = document.getElementById('buy-auto');
  const buyClose = document.getElementById('buy-close');
  const teamCards = document.querySelectorAll('.team-card');
  
  // Round end elements
  const roundWinner = document.getElementById('round-winner');
  const roundReason = document.getElementById('round-reason');
  const statKills = document.getElementById('stat-kills');
  const statDamage = document.getElementById('stat-damage');
  const statMoney = document.getElementById('stat-money');
  const roundContinue = document.getElementById('round-continue');
  
  // Scoreboard
  const sbBody = document.getElementById('sb-body');
  const sbClose = document.getElementById('sb-close');
  
  // Game over
  const finalResult = document.getElementById('final-result');
  const finalScore = document.getElementById('final-score');
  const mvpCt = document.getElementById('mvp-ct');
  const mvpT = document.getElementById('mvp-t');
  const goRestart = document.getElementById('go-restart');
  
  // Weapon definitions (imported from weapon.js would be ideal, but inline for now)
  const WEAPONS = {
    glock: { name: 'Glock-18', price: 200, type: 'pistol', mag: 20, reserve: 120, damage: 28, team: 't' },
    usp: { name: 'USP-S', price: 200, type: 'pistol', mag: 12, reserve: 24, damage: 34, team: 'ct' },
    p250: { name: 'P250', price: 300, type: 'pistol', mag: 13, reserve: 26, damage: 38, team: 'both' },
    deagle: { name: 'Desert Eagle', price: 700, type: 'pistol', mag: 7, reserve: 35, damage: 62, team: 'both' },
    mac10: { name: 'MAC-10', price: 1050, type: 'smg', mag: 30, reserve: 100, damage: 23, team: 't' },
    mp9: { name: 'MP9', price: 1250, type: 'smg', mag: 30, reserve: 120, damage: 22, team: 'ct' },
    mp7: { name: 'MP7', price: 1500, type: 'smg', mag: 30, reserve: 120, damage: 25, team: 'ct' },
    ump45: { name: 'UMP-45', price: 1200, type: 'smg', mag: 25, reserve: 75, damage: 30, team: 'both' },
    p90: { name: 'P90', price: 2350, type: 'smg', mag: 50, reserve: 100, damage: 22, team: 'both' },
    ak47: { name: 'AK-47', price: 2700, type: 'rifle', mag: 30, reserve: 90, damage: 36, team: 't' },
    m4a4: { name: 'M4A4', price: 3100, type: 'rifle', mag: 30, reserve: 90, damage: 33, team: 'ct' },
    m4a1s: { name: 'M4A1-S', price: 2900, type: 'rifle', mag: 25, reserve: 75, damage: 32, team: 'ct' },
    galil: { name: 'Galil AR', price: 1800, type: 'rifle', mag: 35, reserve: 90, damage: 30, team: 't' },
    famas: { name: 'FAMAS', price: 2050, type: 'rifle', mag: 25, reserve: 75, damage: 29, team: 'ct' },
    sg553: { name: 'SG 553', price: 3000, type: 'rifle', mag: 30, reserve: 90, damage: 33, team: 't' },
    aug: { name: 'AUG', price: 3300, type: 'rifle', mag: 30, reserve: 90, damage: 32, team: 'ct' },
    awp: { name: 'AWP', price: 4750, type: 'sniper', mag: 10, reserve: 30, damage: 115, team: 'both' },
    ssg08: { name: 'SSG 08', price: 1700, type: 'sniper', mag: 10, reserve: 30, damage: 88, team: 'both' },
    scar20: { name: 'SCAR-20', price: 5000, type: 'sniper', mag: 20, reserve: 60, damage: 80, team: 'ct' },
    g3sg1: { name: 'G3SG1', price: 5000, type: 'sniper', mag: 20, reserve: 60, damage: 80, team: 't' },
    nova: { name: 'Nova', price: 1050, type: 'shotgun', mag: 8, reserve: 32, damage: 26, team: 'both' },
    xm1014: { name: 'XM1014', price: 2000, type: 'shotgun', mag: 7, reserve: 32, damage: 20, team: 'both' },
    mag7: { name: 'MAG-7', price: 1300, type: 'shotgun', mag: 5, reserve: 32, damage: 30, team: 'ct' },
    sawedoff: { name: 'Sawed-Off', price: 1100, type: 'shotgun', mag: 7, reserve: 32, damage: 28, team: 't' },
    m249: { name: 'M249', price: 5200, type: 'lmg', mag: 100, reserve: 200, damage: 32, team: 'both' },
    negev: { name: 'Negev', price: 5700, type: 'lmg', mag: 150, reserve: 300, damage: 30, team: 'both' },
  };
  
  const EQUIPMENT = {
    vest: { name: 'Kevlar Vest', price: 650, type: 'armor' },
    vesthelm: { name: 'Kevlar + Helmet', price: 1000, type: 'armor' },
    defuse: { name: 'Defuse Kit', price: 400, type: 'utility' },
  };
  
  const GRENADES = {
    he: { name: 'HE Grenade', price: 300, type: 'grenade' },
    flash: { name: 'Flashbang', price: 200, type: 'grenade' },
    smoke: { name: 'Smoke Grenade', price: 300, type: 'grenade' },
    molotov: { name: 'Molotov', price: 400, type: 'grenade' },
    inc: { name: 'Incendiary', price: 500, type: 'grenade' },
    decoy: { name: 'Decoy', price: 50, type: 'grenade' },
  };

  function setWeapon(id, def) {
    currentWeapon = id;
    weaponDef = def || WEAPONS[id];
  }

  function setAmmo(mag, reserve, weaponId) {
    if (mag === lastMag && reserve === lastReserve && weaponId === lastWeapon) return;
    lastMag = mag; lastReserve = reserve; lastWeapon = weaponId;
    ammoMag.textContent = String(mag);
    ammoReserve.textContent = `/ ${reserve}`;
    ammo.classList.toggle('empty', mag === 0);
  }

  function setHealth(health, armor) {
    if (health === lastHealth && armor === lastArmor) return;
    lastHealth = health; lastArmor = armor;
    const pct = Math.max(0, health / 100);
    healthFill.style.width = `${pct * 100}%`;
    healthValue.textContent = String(health);
    // Color based on health
    if (health > 70) healthFill.style.background = 'linear-gradient(90deg, #3fb950 0%, #d29922 60%, #f85149 100%)';
    else if (health > 30) healthFill.style.background = 'linear-gradient(90deg, #d29922 0%, #f85149 100%)';
    else healthFill.style.background = 'linear-gradient(90deg, #f85149 0%, #f85149 100%)';
  }

  function setMoney(money, bonus = 0) {
    if (money === lastMoney) return;
    lastMoney = money;
    moneyValue.textContent = String(money);
    if (bonus > 0) {
      moneyBonus.textContent = `+${bonus}`;
      moneyBonus.classList.add('show');
      setTimeout(() => moneyBonus.classList.remove('show'), 1000);
    }
    if (buyMenuOpen) buyMoney.textContent = String(money);
  }

  function setRoundTimer(seconds, phase) {
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    roundTimer.textContent = `${m}:${s}`;
    roundPhase.textContent = phase;
    roundTimer.classList.toggle('warning', seconds < 30 && phase !== 'Buy Phase');
  }

  function setRoundScore(ct, t) {
    roundScoreCt.textContent = String(ct);
    roundScoreT.textContent = String(t);
  }

  function showBombStatus(planted, site, timer) {
    bombStatus.hidden = !planted;
    if (planted) {
      bombTimer.textContent = timer.toFixed(1);
      bombState.textContent = planted === 'defusing' ? 'Defusing' : 'Planted';
    }
  }

  function addKillFeed(killer, victim, weapon, headshot, killerTeam) {
    const entry = document.createElement('div');
    entry.className = `kill-entry ${killerTeam}`;
    entry.innerHTML = `
      <span class="killer">${escapeHtml(killer)}</span>
      <span class="weapon">${escapeHtml(weapon)}</span>
      ${headshot ? '<span class="hs">HEADSHOT</span>' : ''}
      <span class="victim">${escapeHtml(victim)}</span>
    `;
    killFeed.prepend(entry);
    killEntries.unshift(entry);
    if (killEntries.length > 8) {
      const old = killEntries.pop();
      old.classList.add('fade');
      setTimeout(() => old.remove(), 300);
    }
    setTimeout(() => {
      entry.classList.add('fade');
      setTimeout(() => entry.remove(), 300);
    }, 5000);
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function showSpectator(name, team) {
    spectator.hidden = false;
    spectatorName.textContent = name;
    spectatorName.style.color = team === 'ct' ? '#58a6ff' : '#f78166';
  }

  function hideSpectator() {
    spectator.hidden = true;
  }

  function showTeamSelect() {
    overlayTeam.hidden = false;
    selectedTeam = null;
    teamCards.forEach(c => c.classList.remove('selected'));
  }

  function hideTeamSelect() {
    overlayTeam.hidden = true;
  }

  function onTeamSelect(handler) {
    teamCards.forEach(card => {
      card.addEventListener('click', () => {
        teamCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        selectedTeam = card.dataset.team;
        handler(card.dataset.team);
      });
    });
  }

  function openBuyMenu(money, team, ownedWeapons, callback) {
    overlayBuy.hidden = false;
    buyMenuOpen = true;
    buyMoney.textContent = String(money);
    buildBuyMenu(team, money, ownedWeapons, callback);
    buyAuto.onclick = () => callback('auto');
    buyClose.onclick = () => closeBuyMenu();
  }

  function closeBuyMenu() {
    overlayBuy.hidden = true;
    buyMenuOpen = false;
  }

  function buildBuyMenu(team, money, owned, callback) {
    [buyPrimary, buySecondary, buyEquipment, buyGrenades].forEach(el => el.innerHTML = '');
    
    const categories = {
      primary: { rifles: [], smgs: [], snipers: [], shotguns: [], lmgs: [] },
      secondary: { pistols: [] },
      equipment: { armor: [], utility: [] },
      grenades: { grenades: [] },
    };
    
    for (const [id, w] of Object.entries(WEAPONS)) {
      if (w.team !== team && w.team !== 'both') continue;
      const affordable = w.price <= money;
      const ownedWeapon = owned.includes(id);
      const item = createBuyItem(id, w, affordable, ownedWeapon, () => callback(id));
      
      if (w.type === 'pistol') categories.secondary.pistols.push(item);
      else if (w.type === 'rifle') categories.primary.rifles.push(item);
      else if (w.type === 'smg') categories.primary.smgs.push(item);
      else if (w.type === 'sniper') categories.primary.snipers.push(item);
      else if (w.type === 'shotgun') categories.primary.shotguns.push(item);
      else if (w.type === 'lmg') categories.primary.lmgs.push(item);
    }
    
    for (const [id, e] of Object.entries(EQUIPMENT)) {
      if (e.team && e.team !== team) continue;
      const affordable = e.price <= money;
      const item = createBuyItem(id, e, affordable, false, () => callback(id));
      if (e.type === 'armor') categories.equipment.armor.push(item);
      else categories.equipment.utility.push(item);
    }
    
    for (const [id, g] of Object.entries(GRENADES)) {
      if (g.team && g.team !== team) continue;
      const affordable = g.price <= money;
      const item = createBuyItem(id, g, affordable, false, () => callback(id));
      categories.grenades.grenades.push(item);
    }
    
    appendCategory(buyPrimary, 'Rifles', categories.primary.rifles);
    appendCategory(buyPrimary, 'SMGs', categories.primary.smgs);
    appendCategory(buyPrimary, 'Snipers', categories.primary.snipers);
    appendCategory(buyPrimary, 'Shotguns', categories.primary.shotguns);
    appendCategory(buyPrimary, 'LMGs', categories.primary.lmgs);
    appendCategory(buySecondary, 'Pistols', categories.secondary.pistols);
    appendCategory(buyEquipment, 'Armor', categories.equipment.armor);
    appendCategory(buyEquipment, 'Utility', categories.equipment.utility);
    appendCategory(buyGrenades, 'Grenades', categories.grenades.grenades);
  }

  function createBuyItem(id, def, affordable, owned, onClick) {
    const div = document.createElement('div');
    div.className = `buy-item ${owned ? 'owned' : ''} ${!affordable ? 'unaffordable' : ''}`;
    div.tabIndex = 0;
    div.innerHTML = `
      <div class="buy-item-name">${escapeHtml(def.name)}</div>
      <div class="buy-item-price">$${def.price}</div>
      <div class="buy-item-desc">${def.type || 'Equipment'}</div>
      <div class="buy-item-stats">
        ${def.damage ? `<span class="buy-item-stat">DMG: ${def.damage}</span>` : ''}
        ${def.mag ? `<span class="buy-item-stat">MAG: ${def.mag}</span>` : ''}
      </div>
    `;
    div.onclick = () => { if (affordable) onClick(); };
    div.onkeydown = (e) => { if ((e.key === 'Enter' || e.key === ' ') && affordable) { e.preventDefault(); onClick(); } };
    return div;
  }

  function appendCategory(container, title, items) {
    if (items.length === 0) return;
    const header = document.createElement('h3');
    header.style.cssText = 'margin:0 0 8px;font-size:12px;font-weight:600;color:var(--muted);text-transform:uppercase;letter-spacing:0.05em;';
    header.textContent = title;
    container.appendChild(header);
    items.forEach(item => container.appendChild(item));
  }

  function showRoundEnd(winner, reason, stats) {
    overlayRoundEnd.hidden = false;
    roundWinner.textContent = winner === 'ct' ? 'Counter-Terrorists Win' : 'Terrorists Win';
    roundWinner.className = 'winner ' + winner;
    roundReason.textContent = reason;
    statKills.textContent = String(stats.kills);
    statDamage.textContent = String(stats.damage);
    statMoney.textContent = `$${stats.money}`;
  }

  function hideRoundEnd() {
    overlayRoundEnd.hidden = true;
  }

  function onRoundContinue(handler) {
    roundContinue.onclick = handler;
  }

  function openScoreboard(players, localPlayerId) {
    overlayScoreboard.hidden = false;
    scoreboardOpen = true;
    sbBody.innerHTML = '';
    players.forEach(p => {
      const tr = document.createElement('tr');
      if (p.id === localPlayerId) tr.classList.add('you');
      tr.innerHTML = `
        <td><span class="player-tag ${p.team}">${p.team.toUpperCase()}</span><span class="player-name">${escapeHtml(p.name)}</span></td>
        <td class="stat-col kills">${p.kills}</td>
        <td class="stat-col">${p.deaths}</td>
        <td class="stat-col">${p.assists}</td>
        <td class="stat-col">${p.score}</td>
      `;
      sbBody.appendChild(tr);
    });
  }

  function closeScoreboard() {
    overlayScoreboard.hidden = true;
    scoreboardOpen = false;
  }

  function showGameOver(victory, finalScoreText, mvps) {
    overlayGameOver.hidden = false;
    finalResult.textContent = victory ? 'Victory' : 'Defeat';
    finalResult.className = 'final ' + (victory ? 'victory' : 'defeat');
    finalScore.textContent = finalScoreText;
    mvpCt.textContent = mvps.ct;
    mvpT.textContent = mvps.t;
  }

  function hideGameOver() {
    overlayGameOver.hidden = true;
  }

  function onGameRestart(handler) {
    goRestart.onclick = handler;
  }

  function setCrosshairGap(gap) {
    crosshair.classList.toggle('gap', gap);
  }

  return {
    setWeapon,
    setAmmo,
    setHealth,
    setMoney,
    setRoundTimer,
    setRoundScore,
    showBombStatus,
    addKillFeed,
    showSpectator,
    hideSpectator,
    showTeamSelect,
    hideTeamSelect,
    onTeamSelect,
    openBuyMenu,
    closeBuyMenu,
    showRoundEnd,
    hideRoundEnd,
    onRoundContinue,
    openScoreboard,
    closeScoreboard,
    showGameOver,
    hideGameOver,
    onGameRestart,
    setCrosshairGap,
    isBuyMenuOpen: () => buyMenuOpen,
    isScoreboardOpen: () => scoreboardOpen,
  };
}