App({
  globalData: {
    userInfo: null,
    sessionKey: null
  },

  onLaunch() {
    // 初始化云开发（如果需要排行榜存储和分数上传）
    if (!wx.cloud) {
      console.error("请使用2.2.3或以上基础库以使用云能力")
    } else {
      wx.cloud.init({
        env: 'your-env-id'
      })
    }

    // 可在这里进行登录态获取或用户信息获取
  }
})
