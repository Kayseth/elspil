/**
 * GameConfig.js
 * Central konfiguration for Motherfuga Catch
 */

const GameConfig = {
  /** Spillets interne opløsning (portræt) */
  WIDTH: 400,
  HEIGHT: 800,

  /** Local Storage nøgle til highscore */
  HIGHSCORE_KEY: 'motherfuga_catch_highscore',

  /** Sti til assets (relativ fra spilmappen) */
  ASSETS: {
    background: 'Backgrounds/Background_400x800.png',
    gameBackground: 'Backgrounds/LOGO_BG.png',
    van: 'Game_ikoner/Van_basket.png',
    garanti: 'Game_ikoner/42427_Schneider_MF_Scratcher_basket_van_300x300px-02.png',
    dansk: 'Game_ikoner/42427_Schneider_MF_Scratcher_basket_van_300x300px-03.png',
    losLedning: 'Game_ikoner/42427_Schneider_MF_Scratcher_basket_van_300x300px-05.png'
  },

  /** Faldende objekter med point, spawn-vægt og sprite-nøgle */
  ITEMS: {
    stikkontakt: { points: 10, weight: 35, texture: 'stikkontakt', danger: false },
    afbryder:    { points: 10, weight: 35, texture: 'afbryder', danger: false },
    garanti:     { points: 20, weight: 20, texture: 'garanti', danger: false },
    dansk:       { points: 50, weight: 8,  texture: 'dansk', danger: false },
    losLedning:  { points: 0,  weight: 2,  texture: 'losLedning', danger: true }
  },

  /** Spilletid i sekunder (nedtælling) */
  GAME_DURATION: 60,

  /** Basis faldhastighed (pixels/sekund) */
  BASE_FALL_SPEED: 180,

  /** Spawn-interval i millisekunder */
  SPAWN_MIN: 600,
  SPAWN_MAX: 1400,

  /** Hastighedsmultiplikatorer baseret på overlevet tid */
  SPEED_TIERS: [
    { until: 20, multiplier: 1.0 },
    { until: 40, multiplier: 1.15 },
    { until: 60, multiplier: 1.30 }
  ],

  /** Varebil – maxWidth bevarer aspect ratio */
  VAN: {
    maxWidth: 165,
    bottomMargin: 16
  },

  /** Logo i toppen – maxWidth + padding bevarer aspect ratio */
  LOGO: {
    maxWidth: 118,
    paddingX: 32,
    paddingY: 20,
    y: 46,
    menuY: 72
  },

  /** Tilfældige danske navne til leaderboard */
  DANISH_NAMES: [
    'Mikkel', 'Frederik', 'Sofie', 'Emma', 'Lars', 'Mette', 'Jonas', 'Camilla',
    'Anders', 'Louise', 'Peter', 'Anne', 'Thomas', 'Julie', 'Henrik', 'Maria',
    'Christian', 'Ida', 'Martin', 'Sarah', 'Nikolaj', 'Katrine', 'Rasmus', 'Line',
    'Morten', 'Hanne', 'Jesper', 'Pia', 'Ole', 'Birgitte'
  ],

  /** HUD-højde – spilområde starter herunder */
  HUD_HEIGHT: 178,

  /** Faldende objekters størrelse i pixels */
  ITEM_SIZE: 44
};

/**
 * Vælger et tilfældigt objekt baseret på vægtede sandsynligheder.
 * @returns {string} Objektnøgle (fx 'stikkontakt')
 */
GameConfig.pickRandomItem = function () {
  const entries = Object.entries(this.ITEMS);
  const totalWeight = entries.reduce((sum, [, item]) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const [key, item] of entries) {
    roll -= item.weight;
    if (roll <= 0) return key;
  }
  return 'stikkontakt';
};

/**
 * Beregner hastighedsmultiplikator ud fra spilletid i sekunder.
 * @param {number} elapsedSeconds
 * @returns {number}
 */
GameConfig.getSpeedMultiplier = function (elapsedSeconds) {
  for (const tier of this.SPEED_TIERS) {
    if (elapsedSeconds < tier.until) return tier.multiplier;
  }
  return 1.5;
};

/**
 * Formaterer sekunder til MM:SS.
 * @param {number} totalSeconds
 * @returns {string}
 */
GameConfig.formatTime = function (totalSeconds) {
  const mins = Math.floor(totalSeconds / 60);
  const secs = Math.floor(totalSeconds % 60);
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

/**
 * Henter gemt highscore fra Local Storage.
 * @returns {number}
 */
GameConfig.getHighscore = function () {
  const stored = localStorage.getItem(this.HIGHSCORE_KEY);
  return stored ? parseInt(stored, 10) : 0;
};

/**
 * Gemmer highscore hvis den er højere end den eksisterende.
 * @param {number} score
 * @returns {number} Den nye highscore
 */
GameConfig.saveHighscore = function (score) {
  const current = this.getHighscore();
  if (score > current) {
    localStorage.setItem(this.HIGHSCORE_KEY, String(score));
    return score;
  }
  return current;
};

/**
 * Placerer logo med korrekte proportioner og usynlig luft omkring.
 */
GameConfig.createLogo = function (scene, x, y, depth) {
  const cfg = this.LOGO;
  const targetWidth = Math.min(cfg.maxWidth, this.WIDTH - cfg.paddingX * 2);
  const logo = scene.add.image(x, y, 'logo');
  logo.setScale(targetWidth / logo.width);
  if (depth !== undefined) logo.setDepth(depth);
  return { logo };
};

/**
 * Skalerer varebil med korrekte proportioner.
 */
GameConfig.scaleVan = function (sprite) {
  sprite.setScale(this.VAN.maxWidth / sprite.width);
  return sprite;
};

/**
 * Vælger tilfældige point fra gode ikoner (10, 20 eller 50).
 */
GameConfig.pickRandomGoodPoints = function () {
  const good = Object.values(this.ITEMS).filter((item) => !item.danger);
  const totalWeight = good.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * totalWeight;

  for (const item of good) {
    roll -= item.weight;
    if (roll <= 0) return item.points;
  }
  return 10;
};

/**
 * Simulerer en score baseret på antal opsamlinger med spillets pointværdier.
 * Kun 10, 20 og 50 point er mulige – aldrig 1, 201 osv.
 */
GameConfig.simulateCatchScore = function (numCatches) {
  let total = 0;
  for (let i = 0; i < numCatches; i++) {
    total += this.pickRandomGoodPoints();
  }
  return total;
};

/**
 * Estimerer realistisk antal opsamlinger ud fra en score.
 */
GameConfig.estimateCatchesForScore = function (score) {
  const avgPerCatch = 15;
  return Math.max(4, Math.round(score / avgPerCatch));
};

/**
 * Genererer et leaderboard med tilfældige danske navne + spilleren.
 * Alle scores er realistiske ift. point-systemet (10/20/50).
 */
GameConfig.generateLeaderboard = function (playerScore) {
  const entries = [];
  const usedNames = new Set();
  const usedScores = new Set();

  const pickName = () => {
    let name;
    let attempts = 0;
    do {
      const base = this.DANISH_NAMES[Math.floor(Math.random() * this.DANISH_NAMES.length)];
      const suffix = Math.random() > 0.55
        ? ' ' + String.fromCharCode(65 + Math.floor(Math.random() * 26)) + '.'
        : '';
      name = base + suffix;
      attempts++;
    } while (usedNames.has(name) && attempts < 20);
    usedNames.add(name);
    return name;
  };

  const pickScore = (minCatches, maxCatches) => {
    let score = 0;
    let attempts = 0;
    do {
      const catches = minCatches + Math.floor(Math.random() * (maxCatches - minCatches + 1));
      score = this.simulateCatchScore(catches);
      attempts++;
    } while (usedScores.has(score) && attempts < 20);
    usedScores.add(score);
    return score;
  };

  const playerCatches = this.estimateCatchesForScore(playerScore);

  for (let i = 0; i < 3; i++) {
    const catches = Math.max(4, playerCatches + Math.floor(Math.random() * 14) - 7);
    const score = this.simulateCatchScore(catches);
    if (!usedScores.has(score)) {
      usedScores.add(score);
      entries.push({ name: pickName(), score });
    }
  }

  while (entries.length < 6) {
    entries.push({
      name: pickName(),
      score: pickScore(6, 42)
    });
  }

  usedScores.add(playerScore);
  entries.push({ name: 'Dig', score: playerScore, isPlayer: true });
  entries.sort((a, b) => b.score - a.score);

  return entries.slice(0, 7);
};