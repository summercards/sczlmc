function initMonster(level = 1) {
  const bossData = [
    { name: '恶龙巴卡', hp: 600, maxHp: 600 },  // 第一关 Boss
    { name: '冰霜巨兽', hp: 1200, maxHp: 1200 }, // 第二关 Boss
    { name: '地狱炎魔', hp: 2000, maxHp: 2000 }  // 第三关 Boss
  ];

  const defaultBoss = { name: `Boss ${level}`, hp: 1000 * level, maxHp: 1000 * level };

  return bossData[level - 1] || defaultBoss;
}

function reduceMonsterHP(monster, damage) {
  monster.hp -= damage;
  if (monster.hp < 0) monster.hp = 0;
}

function isMonsterDead(monster) {
  return monster.hp <= 0;
}

module.exports = {
  initMonster,
  reduceMonsterHP,
  isMonsterDead
};
