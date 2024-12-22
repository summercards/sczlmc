const { LEVEL_COUNT, LEVEL_TIME, TYPE_COLOR_MAP, ITEM_TYPES } = require('../../utils/constants');
const { initHero, gainExp, calculateDamage } = require('../../utils/hero');
const { initMonster, reduceMonsterHP, isMonsterDead } = require('../../utils/monster');
const { initLevel } = require('../../utils/level');
const { updateCellPositions } = require('../../utils/grid');
const { checkMatches, applyMatches, refillGrid } = require('../../utils/battle');

function testSwapAndCheck(grid, idx1, idx2) {
  const copy = grid.map(g => ({ ...g }));
  [copy[idx1], copy[idx2]] = [copy[idx2], copy[idx1]];
  const { hasMatch } = checkMatches(copy);
  return hasMatch;
}

function checkPossibleMove(grid) {
  const size = grid.length;
  const rowCount = Math.sqrt(size);
  for (let i = 0; i < size; i++) {
    const row = Math.floor(i / rowCount);
    const col = i % rowCount;
    if (col < rowCount - 1 && testSwapAndCheck(grid, i, i + 1)) return true;
    if (row < rowCount - 1 && testSwapAndCheck(grid, i, i + rowCount)) return true;
  }
  return false;
}

function ensurePossibleMove(grid) {
  const size = grid.length;
  let tries = 0;
  while (tries < 10 && !checkPossibleMove(grid)) {
    const i1 = Math.floor(Math.random() * size);
    const i2 = Math.floor(Math.random() * size);
    if (i1 !== i2) {
      [grid[i1], grid[i2]] = [grid[i2], grid[i1]];
    }
    tries++;
  }
  return grid;
}

Page({
  data: {
    currentLevel: 1,
    timeLeft: LEVEL_TIME,
    score: 0,
    currentLevelScore: 0,
    showNextLevelModal: false,
    gridData: [],
    overlayData: [],
    selectedIndex: null,
    swapping: false,
    player: {},
    boss: {},
    battleLog: [],
    chainCount: 0
  },

  onLoad() {
    this.initGame();
  },

  onUnload() {
    clearInterval(this.countdown);
  },

  initGame() {
    let gridData = initLevel();
    updateCellPositions(gridData);
    gridData = ensurePossibleMove(gridData);
    updateCellPositions(gridData);

    this.setData({
      currentLevel: 1,
      timeLeft: LEVEL_TIME,
      score: 0,
      currentLevelScore: 0,
      showNextLevelModal: false,
      selectedIndex: null,
      swapping: false,
      gridData,
      overlayData: [],
      player: initHero(),
      boss: initMonster(1),
      battleLog: [],
      chainCount: 0
    });

    this.startTimer();
  },

  startTimer() {
    clearInterval(this.countdown);
    this.countdown = setInterval(() => {
      let t = this.data.timeLeft;
      t--;
      if (t <= 0) {
        clearInterval(this.countdown);
        this.endLevel();
      } else {
        this.setData({ timeLeft: t });
      }
    }, 1000);
  },

  logEvent(msg) {
    const logs = [msg].concat(this.data.battleLog);
    this.setData({ battleLog: logs });
  },

  handleTap(e) {
    if (this.data.swapping) return;
    const index = e.currentTarget.dataset.index;
    if (this.data.selectedIndex === null) {
      this.setData({ selectedIndex: index });
    } else {
      if (this.isAdjacent(this.data.selectedIndex, index)) {
        this.animateSwap(this.data.selectedIndex, index);
      } else {
        this.setData({ selectedIndex: null });
      }
    }
  },

  isAdjacent(i1, i2) {
    const row1 = Math.floor(i1 / 5);
    const col1 = i1 % 5;
    const row2 = Math.floor(i2 / 5);
    const col2 = i2 % 5;
    return (Math.abs(row1 - row2) + Math.abs(col1 - col2)) === 1;
  },

  animateSwap(i1, i2) {
    const grid = [...this.data.gridData];
    const c1 = grid[i1], c2 = grid[i2];

    const originalPos = {
      i1, i2,
      c1Top: c1.top,
      c1Left: c1.left,
      c2Top: c2.top,
      c2Left: c2.left
    };

    this.setData({ swapping: true });

    c1.top = originalPos.c2Top;
    c1.left = originalPos.c2Left;
    c2.top = originalPos.c1Top;
    c2.left = originalPos.c1Left;

    this.setData({
      gridData: grid,
      selectedIndex: null
    }, () => {
      setTimeout(() => {
        this.tryFormalSwap(originalPos);
      }, 500);
    });
  },

  tryFormalSwap(pos) {
    let grid = [...this.data.gridData];
    [grid[pos.i1], grid[pos.i2]] = [grid[pos.i2], grid[pos.i1]];
    updateCellPositions(grid);

    this.setData({ gridData: grid }, () => {
      const { hasMatch, removeFlags } = checkMatches(this.data.gridData);
      if (hasMatch) {
        this.setData({ chainCount: 1 }, () => {
          this.handleMatchResult(removeFlags);
        });
      } else {
        this.animateSwapBack(pos);
      }
    });
  },

  animateSwapBack(pos) {
    let grid = [...this.data.gridData];
    const c1 = grid[pos.i1], c2 = grid[pos.i2];

    c1.top = pos.c1Top;
    c1.left = pos.c1Left;
    c2.top = pos.c2Top;
    c2.left = pos.c2Left;

    this.setData({ gridData: grid }, () => {
      setTimeout(() => {
        [grid[pos.i1], grid[pos.i2]] = [grid[pos.i2], grid[pos.i1]];
        updateCellPositions(grid);
        this.setData({ gridData: grid, swapping: false });
      }, 500);
    });
  },

  handleMatchResult(removeFlags, nextCallback) {
    const result = applyMatches(this.data.gridData, removeFlags, this.data.player, this.data.boss);

    const chainMultiplier = Math.min(1 + 0.2 * (this.data.chainCount - 1), 2);

    const finalDamage = Math.floor(result.baseDamage * chainMultiplier);
    const finalScore = Math.floor(result.baseScore * chainMultiplier);

    if (finalDamage > 0) {
      reduceMonsterHP(this.data.boss, finalDamage);
      this.logEvent(`对${this.data.boss.name}造成${finalDamage}点伤害（连消加成x${this.data.chainCount}）`);

      // 实时检查 Boss 是否死亡
      if (isMonsterDead(this.data.boss)) {
        this.endLevel();
        return;
      }
    }

    let leveledUp = false;
    if (finalScore > 0) {
      leveledUp = gainExp(this.data.player, finalScore);
      this.logEvent(`获得了${finalScore}点经验值（连消加成x${this.data.chainCount}）`);
      if (leveledUp) {
        this.logEvent(`恭喜你升级了！当前等级：${this.data.player.level}`);
      }
    }

    const newOverlay = [...this.data.overlayData, ...result.overlayData];

    this.setData({
      gridData: this.data.gridData,
      overlayData: newOverlay,
      score: this.data.score + finalScore,
      currentLevelScore: this.data.currentLevelScore + finalScore,
      player: this.data.player,
      boss: this.data.boss
    }, () => {
      setTimeout(() => {
        const shrinking = this.data.overlayData.map(o => ({ ...o, scale: 0 }));
        this.setData({ overlayData: shrinking }, () => {
          setTimeout(() => {
            this.setData({ overlayData: [] }, () => {
              if (nextCallback) nextCallback();
              else this.handleMatches();
            });
          }, 800);
        });
      }, 100);
    });
  },

  handleMatches() {
    let grid = [...this.data.gridData];
    refillGrid(grid, ITEM_TYPES, TYPE_COLOR_MAP);

    grid = ensurePossibleMove(grid);
    updateCellPositions(grid);

    this.setData({ gridData: grid }, () => {
      setTimeout(() => {
        const { hasMatch, removeFlags } = checkMatches(this.data.gridData);
        if (hasMatch) {
          const newChainCount = this.data.chainCount + 1;
          this.setData({ chainCount: newChainCount }, () => {
            this.handleMatchResult(removeFlags, () => {
              this.handleMatches();
            });
          });
        } else {
          this.setData({ swapping: false });
        }
      }, 500);
    });
  },

  endLevel() {
    clearInterval(this.countdown);

    if (this.data.boss.hp <= 0) {
      if (this.data.currentLevel < LEVEL_COUNT) {
        this.setData({ showNextLevelModal: true });
      } else {
        wx.showToast({ title: '通关成功！', icon: 'success' });
        setTimeout(() => {
          wx.redirectTo({ url: '/pages/index/index' });
        }, 2000);
      }
    } else {
      wx.showToast({ title: '时间到！游戏结束', icon: 'none' });
      setTimeout(() => {
        wx.redirectTo({ url: '/pages/index/index' });
      }, 2000);
    }
  },

  nextLevel() {
    const next = this.data.currentLevel + 1;
    if (next > LEVEL_COUNT) {
      this.endGame();
      return;
    }
    let gridData = initLevel();
    updateCellPositions(gridData);
    gridData = ensurePossibleMove(gridData);
    updateCellPositions(gridData);

    this.setData({
      currentLevel: next,
      gridData,
      currentLevelScore: 0,
      timeLeft: LEVEL_TIME,
      showNextLevelModal: false,
      boss: initMonster(next),
      chainCount: 0
    });
    this.startTimer();
  },

  endGame() {
    clearInterval(this.countdown);
    wx.showToast({ title: '游戏结束', icon: 'none' });
    setTimeout(() => {
      wx.redirectTo({ url: '/pages/index/index' });
    }, 1500);
  },

  onShareAppMessage() {
    return {
      title: '经典三消小游戏，一起来挑战吧！',
      path: '/pages/index/index'
    };
  }
});
