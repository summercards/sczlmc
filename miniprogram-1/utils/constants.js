const LEVEL_COUNT = 10; 
const LEVEL_TIME = 180; 
const GRID_SIZE = 5;    
const SCORE_PER_GEM = 10;

const TYPE_COLOR_MAP = {
  'A': '#FF0000',  // 红
  'B': '#FF1493',  // 粉
  'C': '#800080',  // 紫
  'D': '#0000FF',  // 蓝
  'E': '#008000',  // 绿
  'F': '#FFA500'   // 橙
};

const ITEM_TYPES = Object.keys(TYPE_COLOR_MAP);

module.exports = {
  LEVEL_COUNT,
  LEVEL_TIME,
  GRID_SIZE,
  SCORE_PER_GEM,
  TYPE_COLOR_MAP,
  ITEM_TYPES
};
