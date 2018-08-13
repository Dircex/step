//app.js
import utils from './utils/util.js';

App({
  utils: utils,
  onLaunch: function () {
    this.checkForUpdate();
  },
  //检查微信小程序是否最新版本
  checkForUpdate: function () {
    try {
      const updateManager = wx.getUpdateManager()
      updateManager.onUpdateReady(function () {
        wx.showModal({
          title: '更新提示',
          content: '新版本已经准备好，是否重启应用？',
          success: function (res) {
            console.log(res)
            if (res.confirm) {
              updateManager.applyUpdate()
            }
          }
        })
      })
      updateManager.onUpdateFailed(function () { })
    }
    catch (err) {
      console.log('基础库版本低于1.9.90')
    }
  },
})