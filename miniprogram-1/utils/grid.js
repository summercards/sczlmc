const { GRID_SIZE } = require('./constants');
const CELL_SIZE = 100;
const CELL_MARGIN = 5;

function updateCellPositions(grid) {
  for (let i = 0; i < grid.length; i++) {
    const row = Math.floor(i / GRID_SIZE);
    const col = i % GRID_SIZE;
    grid[i].row = row;
    grid[i].col = col;
    grid[i].top = row*(CELL_SIZE+2*CELL_MARGIN);
    grid[i].left = col*(CELL_SIZE+2*CELL_MARGIN);
  }
}

module.exports = {
  updateCellPositions
};
