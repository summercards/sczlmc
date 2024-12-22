Page({
  data: {
    rankList: []
  },

  onLoad() {
    this.getRankData();
  },

  getRankData() {
    // 从云函数或服务器获取排名数据
    wx.cloud.callFunction({
      name: 'getRankList'
    }).then(res=>{
      this.setData({rankList: res.result.data});
    }).catch(err=>console.error(err));
  },

  goHome(){
    wx.redirectTo({
      url: '/pages/index/index'
    })
  }
})
