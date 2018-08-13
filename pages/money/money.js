//获取应用实例
const app = getApp()
const utils = app.utils;
var page = 1;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    postList: [],
    empty: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    page = 1;
    utils.http.itemPost('step/profitList', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      page: page,
      size: 10
    }).then(r => {
      if (r.length != 0) {
        this.setData({
          postList: r
        })
        page++;
      } else {
        this.setData({
          empty: false
        })
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    utils.http.itemPost('step/profitList', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      page: page,
      size: 10
    }).then(r => {
      if (r.length != 0) {
        let oldList = this.data.postList
        this.setData({
          postList: oldList.concat(r)
        })
        page++;
      }
    })
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})