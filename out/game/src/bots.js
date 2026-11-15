// Bot AI: tactical bots with different behaviors, roles, and team coordination
import * as THREE from 'three';
import { PALETTE } from './palette.js';

const BOT_NAMES_CT = [
  'Viper', 'Raptor', 'Hawkeye', 'Ghost', 'Shadow', 'Phantom', 'Specter', 'Wraith',
  'Sentinel', 'Guardian', 'Paladin', 'Warden', 'Vanguard', 'Bastion', 'Aegis', 'Bulwark'
];

const BOT_NAMES_T = [
  'Reaper', 'Venom', 'Cobra', 'Viper', 'Scorpion', 'Mamba', 'Taipan', 'Krait',
  'Ravager', 'Marauder', 'Raider', 'Plunderer', 'Pirate', 'Corsair', 'Buccaneer', 'Privateer'
];

const BOT_PERSONALITIES = {
  aggressive: { pushChance: 0.7, holdChance: 0.2, flankChance: 0.1, reaction: 0.15, aim: 0.85 },
  balanced: { pushChance: 0.4, holdChance: 0.4, flankChance: 0.2, reaction: 0.2, aim: 0.75 },
  defensive: { pushChance: 0.2, holdChance: 0.6, flankChance: 0.2, reaction: 0.25, aim: 0.7 },
  support: { pushChance: 0.3, holdChance: 0.3, flankChance: 0.4, reaction: 0.2, aim: 0.72 },
  awper: { pushChance: 0.1, holdChance: 0.7, flankChance: 0.2, reaction: 0.1, aim: 0.95 },
  entry: { pushChance: 0.8, holdChance: 0.1, flankChance: 0.1, reaction: 0.12, aim: 0.82 },
};

const ROLES = {
  ct: ['anchor', 'rotator', 'awper', 'entry', 'support'],
  t: ['entry', 'lurker', 'awper', 'support', 'bomb'],
};

function mulberry32(a) {
  return function() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createBots(scene, world, player, weaponSystem, maxBots = 9) {
  const bots = [];
  const botMeshes = [];
  const random = mulberry32(Date.now() & 0xffffffff);
  
  // Navigation nodes for the map
  const navNodes = generateNavNodes(world);
  
  // Bomb sites
  const siteA = new THREE.Vector3(-22, 1, -22);
  const siteB = new THREE.Vector3(22, 1, 22);
  const bombSites = { a: siteA, b: siteB };
  
  // Spawn points
  const ctSpawns = [
    new THREE.Vector3(-30, 1, -30), new THREE.Vector3(-35, 1, -28), new THREE.Vector3(-28, 1, -35),
    new THREE.Vector3(-32, 1, -25), new THREE.Vector3(-25, 1, -32),
  ];
  const tSpawns = [
    new THREE.Vector3(30, 1, 30), new THREE.Vector3(35, 1, 28), new THREE.Vector3(28, 1, 35),
    new THREE.Vector3(32, 1, 25), new THREE.Vector3(25, 1, 32),
  ];

  function createBotMesh(team, personality) {
    const group = new THREE.Group();
    
    // Body
    const bodyMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(team === 'ct' ? PALETTE.ct : PALETTE.t), 
      roughness: 0.6, metalness: 0.1 
    });
    const gearMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color(team === 'ct' ? '#1a3a5c' : '#5c1a1a'), 
      roughness: 0.8, metalness: 0.1 
    });
    const skinMat = new THREE.MeshStandardMaterial({ 
      color: new THREE.Color('#e8c4a0'), 
      roughness: 0.9, metalness: 0.0 
    });
    
    // Torso
    const torso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.25), bodyMat);
    torso.position.y = 1.0;
    torso.castShadow = true;
    torso.receiveShadow = true;
    group.add(torso);
    
    // Head
    const head = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.25, 0.22), skinMat);
    head.position.y = 1.55;
    head.castShadow = true;
    head.receiveShadow = true;
    group.add(head);
    
    // Helmet for CT
    if (team === 'ct') {
      const helmet = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.15, 0.24), bodyMat);
      helmet.position.y = 1.65;
      group.add(helmet);
    }
    
    // Legs
    const legGeo = new THREE.BoxGeometry(0.15, 0.7, 0.15);
    const legL = new THREE.Mesh(legGeo, gearMat);
    legL.position.set(-0.12, 0.35, 0);
    legL.castShadow = true;
    group.add(legL);
    const legR = new THREE.Mesh(legGeo, gearMat);
    legR.position.set(0.12, 0.35, 0);
    legR.castShadow = true;
    group.add(legR);
    
    // Arms
    const armGeo = new THREE.BoxGeometry(0.12, 0.6, 0.12);
    const armL = new THREE.Mesh(armGeo, team === 'ct' ? bodyMat : gearMat);
    armL.position.set(-0.35, 1.0, 0);
    armL.castShadow = true;
    group.add(armL);
    const armR = new THREE.Mesh(armGeo, team === 'ct' ? bodyMat : gearMat);
    armR.position.set(0.35, 1.0, 0);
    armR.castShadow = true;
    group.add(armR);
    
    // Weapon indicator
    const weapGeo = new THREE.BoxGeometry(0.06, 0.06, 0.4);
    const weapMat = new THREE.MeshStandardMaterial({ color: new THREE.Color('#2d2d2d'), roughness: 0.3, metalness: 0.7 });
    const weapon = new THREE.Mesh(weapGeo, weapMat);
    weapon.position.set(0.35, 1.0, -0.2);
    weapon.rotation.z = -0.3;
    group.add(weapon);
    
    group.traverse(m => { if (m.isMesh) { m.castShadow = true; m.receiveShadow = true; } });
    
    return { group, head, torso, weapon, legL, legR, armL, armR };
  }

  function getRandomName(team) {
    const names = team === 'ct' ? BOT_NAMES_CT : BOT_NAMES_T;
    const idx = Math.floor(random() * names.length);
    return names.splice(idx, 1)[0] || (team === 'ct' ? 'CT' : 'T') + Math.floor(random() * 100);
  }

  function getRandomPersonality(role) {
    const personalities = Object.keys(BOT_PERSONALITIES);
    if (role === 'awper') return 'awper';
    if (role === 'entry') return 'entry';
    if (role === 'anchor' || role === 'bomb') return 'defensive';
    if (role === 'support') return 'support';
    if (role === 'lurker') return 'aggressive';
    if (role === 'rotator') return 'balanced';
    return personalities[Math.floor(random() * personalities.length)];
  }

  function findPath(start, goal, avoid = []) {
    // Simple A* on nav nodes
    const openSet = [start];
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startIdx = navNodes.findIndex(n => n.position.distanceTo(start) < 2);
    const goalIdx = navNodes.findIndex(n => n.position.distanceTo(goal) < 2);
    
    if (startIdx === -1 || goalIdx === -1) return null;
    
    gScore.set(startIdx, 0);
    fScore.set(startIdx, navNodes[startIdx].position.distanceTo(navNodes[goalIdx].position));
    
    while (openSet.length > 0) {
      let current = openSet.reduce((a, b) => fScore.get(a) < fScore.get(b) ? a : b);
      if (current === goalIdx) {
        const path = [navNodes[goalIdx].position.clone()];
        while (cameFrom.has(current)) {
          current = cameFrom.get(current);
          path.unshift(navNodes[current].position.clone());
        }
        return path;
      }
      
      openSet.splice(openSet.indexOf(current), 1);
      
      for (const neighbor of navNodes[current].connections) {
        if (avoid.some(a => navNodes[neighbor].position.distanceTo(a) < 3)) continue;
        const tentative = gScore.get(current) + navNodes[current].position.distanceTo(navNodes[neighbor].position);
        if (tentative < (gScore.get(neighbor) || Infinity)) {
          cameFrom.set(neighbor, current);
          gScore.set(neighbor, tentative);
          fScore.set(neighbor, tentative + navNodes[neighbor].position.distanceTo(navNodes[goalIdx].position));
          if (!openSet.includes(neighbor)) openSet.push(neighbor);
        }
      }
    }
    return null;
  }

  function generateNavNodes(world) {
    const nodes = [];
    // Generate nodes around the map
    const positions = [
      // CT spawn area
      [-30, 1, -30], [-35, 1, -28], [-28, 1, -35], [-32, 1, -25], [-25, 1, -32],
      // A site
      [-22, 1, -22], [-28, 1, -20], [-16, 1, -20], [-22, 1, -28], [-26, 1, -15], [-18, 1, -15],
      // A long
      [-22, 1, 8], [-22, 1, -2], [-22, 1, 14], [-18, 1, 8], [-26, 1, 8],
      // A ramp
      [-12, 1, 22], [-9, 1, 22], [-15, 1, 22],
      // Mid
      [0, 1, 0], [-4, 1, 4], [4, 1, 4], [-4, 1, -4], [4, 1, -4], [-10, 1, 0], [10, 1, 0],
      // B tunnels
      [22, 1, -3], [22, 1, 10], [22, 1, -10], [18, 1, -3], [26, 1, -3],
      // B site
      [22, 1, 22], [16, 1, 20], [28, 1, 20], [22, 1, 28], [18, 1, 15], [26, 1, 15],
      // T spawn
      [30, 1, 30], [35, 1, 28], [28, 1, 35], [32, 1, 25], [25, 1, 32],
      // Connectors
      [-12, 1, 8], [12, 1, -8], [-12, 1, -8], [12, 1, 8],
    ];
    
    positions.forEach((pos, i) => {
      nodes.push({
        position: new THREE.Vector3(...pos),
        connections: [],
        index: i,
      });
    });
    
    // Connect nearby nodes
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i !== j && node.position.distanceTo(other.position) < 18) {
          // Check if path is clear (simplified)
          node.connections.push(j);
        }
      });
    });
    
    return nodes;
  }

  // Initialize bots
  for (let i = 0; i < maxBots; i++) {
    const team = i < maxBots / 2 ? 'ct' : 't';
    const role = ROLES[team][Math.floor(random() * ROLES[team].length)];
    const personalityType = getRandomPersonality(role);
    const personality = BOT_PERSONALITIES[personalityType];
    const name = getRandomName(team);
    const spawns = team === 'ct' ? ctSpawns : tSpawns;
    const spawn = spawns[i % spawns.length].clone();
    spawn.y = 1;
    
    const mesh = createBotMesh(team, personalityType);
    mesh.group.position.copy(spawn);
    scene.add(mesh.group);
    
    const bot = {
      id: i,
      name,
      team,
      role,
      personality,
      personalityType,
      position: spawn.clone(),
      velocity: new THREE.Vector3(),
      yaw: team === 'ct' ? 0 : Math.PI,
      pitch: 0,
      health: 100,
      armor: role === 'awper' ? 100 : (random() < 0.5 ? 50 : 0),
      helmet: role === 'awper' || random() < 0.3,
      alive: true,
      money: 800,
      weapon: team === 'ct' ? 'usp' : 'glock',
      weaponDef: weaponSystem.WEAPONS[team === 'ct' ? 'usp' : 'glock'],
      mesh,
      target: null,
      targetPos: null,
      path: [],
      pathIndex: 0,
      state: 'idle', // idle, moving, shooting, reloading, planting, defusing
      lastShot: 0,
      reactionDelay: personality.reaction,
      aimError: (1 - personality.aim) * 0.05,
      buyTime: 0,
      hasBomb: team === 't' && role === 'bomb',
      hasDefuse: team === 'ct' && role === 'support' && random() < 0.5,
      lastSeenEnemy: null,
      lastKnownEnemyPos: null,
      comms: [],
    };
    
    bots.push(bot);
    botMeshes.push(mesh.group);
  }

  function updateBot(bot, dt, gameState) {
    if (!bot.alive) return;
    
    const state = bot.mesh.group;
    bot.position.copy(state.position);
    
    // Update animation
    const time = gameState.time;
    if (bot.state === 'moving') {
      state.rotation.y = Math.sin(time * 8) * 0.1;
      bot.mesh.legL.rotation.x = Math.sin(time * 10) * 0.4;
      bot.mesh.legR.rotation.x = -Math.sin(time * 10) * 0.4;
      bot.mesh.armL.rotation.x = -Math.sin(time * 10) * 0.3;
      bot.mesh.armR.rotation.x = Math.sin(time * 10) * 0.3;
    } else {
      bot.mesh.legL.rotation.x = 0;
      bot.mesh.legR.rotation.x = 0;
      bot.mesh.armL.rotation.x = 0;
      bot.mesh.armR.rotation.x = 0;
    }
    
    // Head bob
    bot.mesh.head.position.y = 1.55 + Math.sin(time * 6) * 0.02;
    
    // Find enemies
    const enemies = bots.filter(b => b.alive && b.team !== bot.team && b.id !== bot.id);
    const playerEnemy = gameState.player.alive && gameState.player.team !== bot.team ? gameState.player : null;
    const allEnemies = enemies.concat(playerEnemy ? [gameState.player] : []);
    
    let closestEnemy = null;
    let closestDist = Infinity;
    
    for (const enemy of allEnemies) {
      const dist = bot.position.distanceTo(enemy.position);
      // Check line of sight (simplified)
      if (dist < closestDist && dist < (bot.weaponDef.range || 60)) {
        // Raycast would go here - simplified for performance
        const canSee = true; // would check raycast against world.colliders
        if (canSee) {
          closestDist = dist;
          closestEnemy = enemy;
        }
      }
    }
    
    if (closestEnemy) {
      bot.lastSeenEnemy = closestEnemy;
      bot.lastKnownEnemyPos = closestEnemy.position.clone();
    }
    
    // State machine
    switch (bot.state) {
      case 'idle':
        if (closestEnemy) {
          bot.state = 'shooting';
          bot.target = closestEnemy;
        } else if (gameState.phase === 'buy') {
          bot.state = 'buying';
        } else if (gameState.phase === 'live') {
          bot.state = 'patrolling';
          pickPatrolTarget(bot, gameState);
        }
        break;
        
      case 'buying':
        buyEquipment(bot, gameState);
        bot.state = 'idle';
        break;
        
      case 'patrolling':
        if (closestEnemy) {
          bot.state = 'shooting';
          bot.target = closestEnemy;
        } else if (bot.targetPos) {
          moveAlongPath(bot, dt);
          if (bot.position.distanceTo(bot.targetPos) < 2) {
            bot.targetPos = null;
            bot.path = [];
            bot.pathIndex = 0;
            // Wait a bit then pick new target
            setTimeout(() => { if (bot.alive && bot.state === 'patrolling') pickPatrolTarget(bot, gameState); }, 2000 + random() * 3000);
          }
        } else {
          pickPatrolTarget(bot, gameState);
        }
        break;
        
      case 'shooting':
        if (!closestEnemy || closestDist > (bot.weaponDef.range || 60) * 1.2) {
          bot.state = 'patrolling';
          bot.target = null;
        } else {
          bot.target = closestEnemy;
          aimAtTarget(bot, closestEnemy.position);
          
          if (gameState.time - bot.lastShot > bot.weaponDef.fireGap) {
            const spread = bot.weaponDef.spreadStill + bot.aimError * (1 - bot.personality.aim);
            const hit = gameState.shoot(bot, closestEnemy, spread);
            bot.lastShot = gameState.time;
            
            if (hit && closestEnemy.health <= 0) {
              bot.money += 300;
              bot.state = 'patrolling';
            }
          }
          
          // Strafe while shooting
          const strafe = (random() - 0.5) * 2;
          bot.velocity.x += Math.sin(bot.yaw + Math.PI/2) * strafe * 5 * dt;
          bot.velocity.z += Math.cos(bot.yaw + Math.PI/2) * strafe * 5 * dt;
        }
        break;
        
      case 'reloading':
        // Handled by weapon system
        bot.state = 'shooting';
        break;
    }
    
    // Apply velocity
    state.position.addScaledVector(bot.velocity, dt);
    bot.velocity.multiplyScalar(0.9);
    
    // Keep on ground
    state.position.y = Math.max(1, state.position.y);
  }

  function pickPatrolTarget(bot, gameState) {
    let targetArea;
    
    if (gameState.bombPlanted) {
      // Go to bomb site
      targetArea = gameState.bombSite === 'a' ? siteA : siteB;
    } else if (bot.team === 't') {
      // T side: go to bomb site or hunt
      if (bot.hasBomb) {
        targetArea = random() < 0.5 ? siteA : siteB;
      } else if (bot.role === 'lurker') {
        targetArea = random() < 0.5 ? new THREE.Vector3(-12, 1, 8) : new THREE.Vector3(12, 1, -8);
      } else {
        targetArea = random() < 0.5 ? siteA : siteB;
      }
    } else {
      // CT side: hold angles or rotate
      if (bot.role === 'anchor') {
        targetArea = random() < 0.5 ? siteA : siteB;
      } else if (bot.role === 'rotator') {
        targetArea = new THREE.Vector3(0, 1, 0); // Mid
      } else if (bot.role === 'awper') {
        targetArea = random() < 0.5 ? new THREE.Vector3(-22, 1, 8) : new THREE.Vector3(22, 1, -3);
      } else {
        targetArea = random() < 0.5 ? siteA : siteB;
      }
    }
    
    // Add some randomness
    targetArea = targetArea.clone().add(new THREE.Vector3(
      (random() - 0.5) * 8, 0, (random() - 0.5) * 8
    ));
    
    bot.targetPos = targetArea;
    bot.path = findPath(bot.position, targetArea) || [];
    bot.pathIndex = 0;
  }

  function moveAlongPath(bot, dt) {
    if (bot.path.length === 0) return;
    
    const target = bot.path[bot.pathIndex];
    if (!target) return;
    
    const dir = new THREE.Vector3().subVectors(target, bot.position).normalize();
    const dist = bot.position.distanceTo(target);
    
    if (dist < 1.5) {
      bot.pathIndex++;
      if (bot.pathIndex >= bot.path.length) {
        bot.path = [];
        bot.pathIndex = 0;
        return;
      }
    }
    
    const speed = bot.personalityType === 'entry' ? 5.5 : 4.5;
    bot.velocity.x = dir.x * speed;
    bot.velocity.z = dir.z * speed;
    
    // Face movement direction
    bot.yaw = Math.atan2(-dir.x, -dir.z);
    bot.mesh.group.rotation.y = bot.yaw;
  }

  function aimAtTarget(bot, targetPos) {
    const dx = targetPos.x - bot.position.x;
    const dy = targetPos.y + 1.0 - (bot.position.y + 1.55); // aim at chest
    const dz = targetPos.z - bot.position.z;
    const dist = Math.hypot(dx, dy, dz);
    
    bot.yaw = Math.atan2(-dx, -dz);
    bot.pitch = Math.asin(Math.max(-1, Math.min(1, dy / dist)));
    
    // Add aim error
    bot.yaw += (random() - 0.5) * bot.aimError;
    bot.pitch += (random() - 0.5) * bot.aimError;
    
    bot.mesh.group.rotation.y = bot.yaw;
  }

  function buyEquipment(bot, gameState) {
    if (bot.money < 200) return;
    
    const defs = weaponSystem.WEAPONS;
    const affordable = Object.entries(defs).filter(([id, w]) => 
      w.price <= bot.money && (w.team === bot.team || w.team === 'both')
    );
    
    if (affordable.length === 0) return;
    
    // Role-based buying preferences
    let preferredTypes = [];
    if (bot.role === 'awper') preferredTypes = ['sniper'];
    else if (bot.role === 'entry') preferredTypes = ['rifle', 'smg'];
    else if (bot.role === 'support') preferredTypes = ['rifle', 'smg'];
    else preferredTypes = ['rifle', 'smg', 'pistol'];
    
    let weapon = affordable.filter(([id, w]) => preferredTypes.includes(w.type))[0];
    if (!weapon) weapon = affordable[affordable.length - 1]; // Most expensive affordable
    
    bot.weapon = weapon[0];
    bot.weaponDef = weapon[1];
    bot.money -= weapon[1].price;
    
    // Buy armor
    if (bot.money >= 1000 && bot.armor < 100) {
      bot.armor = 100;
      bot.helmet = true;
      bot.money -= 1000;
    } else if (bot.money >= 650 && bot.armor < 50) {
      bot.armor = 50;
      bot.money -= 650;
    }
    
    // Buy defuse kit (CT)
    if (bot.team === 'ct' && bot.money >= 400 && !bot.hasDefuse && random() < 0.3) {
      bot.hasDefuse = true;
      bot.money -= 400;
    }
    
    // Buy grenades
    if (bot.money >= 300 && random() < 0.4) {
      bot.money -= 300;
    }
  }

  function respawnBot(bot, team) {
    bot.team = team;
    bot.role = ROLES[team][Math.floor(random() * ROLES[team].length)];
    bot.personalityType = getRandomPersonality(bot.role);
    bot.personality = BOT_PERSONALITIES[bot.personalityType];
    bot.name = getRandomName(team);
    
    const spawns = team === 'ct' ? ctSpawns : tSpawns;
    const spawn = spawns[bot.id % spawns.length].clone();
    spawn.y = 1;
    
    bot.position.copy(spawn);
    bot.mesh.group.position.copy(spawn);
    bot.velocity.set(0, 0, 0);
    bot.yaw = team === 'ct' ? 0 : Math.PI;
    bot.pitch = 0;
    bot.health = 100;
    bot.armor = 0;
    bot.helmet = false;
    bot.alive = true;
    bot.money = 800;
    bot.weapon = team === 'ct' ? 'usp' : 'glock';
    bot.weaponDef = weaponSystem.WEAPONS[bot.weapon];
    bot.hasBomb = team === 't' && bot.role === 'bomb';
    bot.hasDefuse = team === 'ct' && bot.role === 'support' && random() < 0.5;
    bot.state = 'idle';
    bot.target = null;
    bot.targetPos = null;
    bot.path = [];
    bot.pathIndex = 0;
    
    // Update mesh color
    const color = team === 'ct' ? PALETTE.ct : PALETTE.t;
    bot.mesh.torso.material.color.set(color);
    if (bot.mesh.group.children[3]) { // helmet
      bot.mesh.group.children[3].visible = team === 'ct';
    }
  }

  return {
    bots,
    botMeshes,
    update: (dt, gameState) => {
      bots.forEach(bot => updateBot(bot, dt, gameState));
    },
    respawnBot,
    getAlive: (team) => bots.filter(b => b.alive && b.team === team),
    getAll: () => bots,
    findByName: (name) => bots.find(b => b.name === name),
    findBombCarrier: () => bots.find(b => b.alive && b.team === 't' && b.hasBomb),
  };
}