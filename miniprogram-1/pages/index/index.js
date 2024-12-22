Page({
  onShareAppMessage() {
    return {
      title: '一起来玩消消乐小游戏吧！',
      path: '/pages/index/index'
    }
  },
  
  startGame() {
    wx.navigateTo({
      url: '/pages/game/game'
    });
  },

  goRank() {
    wx.navigateTo({
      url: '/pages/rank/rank'
    });
  }
})
