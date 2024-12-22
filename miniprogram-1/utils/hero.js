function initHero() {
  return {
    level: 1,
    exp: 0,
    attack: 5,
    agility: 0,
    magic: 5
  };
}

function updateHeroAttributes(hero, deltaAttack, deltaAgility, deltaMagic) {
  hero.attack += (deltaAttack || 0);
  hero.agility += (deltaAgility || 0);
  hero.magic += (deltaMagic || 0);
}

function gainExp(hero, expGain) {
  hero.exp += expGain;
  let leveledUp = false;
  while (hero.exp >= hero.level * 100) {
    hero.exp -= hero.level * 100;
    hero.level++;
    hero.attack += 2;
    hero.magic += 2;
    leveledUp = true;
  }
  return leveledUp;
}

function calculateDamage(hero, redCount, purpleCount) {
  const dmgFromRed = redCount * hero.attack;
  const dmgFromPurple = purpleCount * hero.magic;
  return dmgFromRed + dmgFromPurple;
}

module.exports = {
  initHero,
  updateHeroAttributes,
  calculateDamage,
  gainExp
};
