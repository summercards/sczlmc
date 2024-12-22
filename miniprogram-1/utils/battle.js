const { GRID_SIZE, SCORE_PER_GEM } = require('./constants');
const { calculateDamage } = require('./hero');

function checkMatches(grid) {
  let removeFlags = new Array(GRID_SIZE * GRID_SIZE).fill(false);
  let hasMatch = false;

  for (let r = 0; r < GRID_SIZE; r++) {
    for (let c = 0; c < GRID_SIZE - 2; c++) {
      const start = r * GRID_SIZE + c;
      const t = grid[start].type;
      if (t && t === grid[start+1].type && t === grid[start+2].type) {
        hasMatch = true;
        let col = c;
        while (col < GRID_SIZE && grid[r*GRID_SIZE + col].type === t) {
          removeFlags[r*GRID_SIZE + col] = true;
          col++;
        }
      }
    }
  }

  for (let c = 0; c < GRID_SIZE; c++) {
    for (let r = 0; r < GRID_SIZE - 2; r++) {
      const start = r * GRID_SIZE + c;
      const t = grid[start].type;
      if (t && t === grid[start+GRID_SIZE].type && t === grid[start+GRID_SIZE*2].type) {
        hasMatch = true;
        let row = r;
        while (row < GRID_SIZE && grid[row*GRID_SIZE + c].type === t) {
          removeFlags[row*GRID_SIZE + c] = true;
          row++;
        }
      }
    }
  }

  return { hasMatch, removeFlags };
}

function applyMatches(grid, removeFlags, player, monster) {
  let removeCount = 0;
  let redCount = 0;
  let purpleCount = 0;
  let overlayData = [];

  for (let i = 0; i < removeFlags.length; i++) {
    if (removeFlags[i]) {
      removeCount++;
      const cell = grid[i];
      if (cell.type === 'A') redCount++;
      if (cell.type === 'C') purpleCount++;

      if (cell.type) {
        overlayData.push({
          top: cell.top,
          left: cell.left,
          color: cell.color,
          scale: 1,
          opacity: 0.8
        });
      }

      grid[i].type = null;
      grid[i].color = '#ccc';
      grid[i].scale = 1;
    }
  }

  let baseDamage = 0;
  if (player && monster) {
    baseDamage = calculateDamage(player, redCount, purpleCount);
  }

  const baseScore = removeCount * SCORE_PER_GEM;

  return {
    overlayData,
    baseScore,
    baseDamage
  };
}

function refillGrid(grid, ITEM_TYPES, TYPE_COLOR_MAP) {
  const size = GRID_SIZE;
  for (let c = 0; c < size; c++) {
    let colCells = [];
    for (let r = 0; r < size; r++) {
      const idx = r * size + c;
      if (grid[idx].type) {
        colCells.push(grid[idx]);
      }
    }
    for (let r = size - 1; r >= 0; r--) {
      const idx = r * size + c;
      if (colCells.length > 0) {
        let cell = colCells.pop();
        grid[idx].type = cell.type;
        grid[idx].color = cell.color;
        grid[idx].scale = 1;
      } else {
        const randType = ITEM_TYPES[Math.floor(Math.random() * ITEM_TYPES.length)];
        grid[idx].type = randType;
        grid[idx].color = TYPE_COLOR_MAP[randType];
        grid[idx].scale = 1;
      }
    }
  }
}

module.exports = {
  checkMatches,
  applyMatches,
  refillGrid
};
