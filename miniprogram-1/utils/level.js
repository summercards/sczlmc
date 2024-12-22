const { GRID_SIZE, ITEM_TYPES, TYPE_COLOR_MAP } = require('./constants');

function initLevel() {
  let gridData = [];
  for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    const randType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
    gridData.push({
      type: randType,
      color: TYPE_COLOR_MAP[randType],
      row,
      col,
      scale: 1,
      top: 0,
      left: 0
    });
  }
  return gridData;
}

module.exports = {
  initLevel
};
