//index.js
//获取应用实例
const app = getApp()
const utils = app.utils;
Page({
  data: {
    friendList: [],
    page: 1
  },
  onShow: function () {
    // wx.clearStorageSync()
    utils.http.itemPost('step/myshare', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      sign: 20,
      page: this.data.page,
    }).then(r => {
      console.log(r)
      if (r.count>20){
        this.setData({
          friendList: r.list,
        });
      } else {
        this.setData({
          friendList: r.list,
        });
      }
    })
  },
  more: function () {
    utils.http.itemPost('step/myshare', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      sign: 20,
      page: this.data.page + 1,
    }).then(r => {
      this.setData({
        friendList: this.data.friendList.concat(r.list),
      });   
      this.setData({
        page: this.data.page + 1
      }) 
    })
  },
})