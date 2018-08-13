// pages/myExchange/myExchange.js
//获取应用实例
const app = getApp()
const utils = app.utils;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sign: 'wait',
    waitList: [],
    deliveryList: [],
    waitBol: false,
    deliveryBol: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.getWait();
  },
  // 等待发货
  wait: function() {
    this.setData({
      sign: 'wait',
      waitList: [],
      waitBol: false,
    })
    this.getWait();
  },
  // 已发货
  delivery: function() {
    this.setData({
      sign: 'delivery',
      deliveryList: [],
      deliveryBol: false
    })
    this.getEnd();
  },
  getWait: function() {
    utils.http.itemPost('step/myChange', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: '1'
    }).then(r => {
      if (r.length != 0) {
        this.setData({
          waitList: r
        })
      } else {
        this.setData({
          waitBol: true
        })
      }
    })
  },
  getEnd: function() {
    utils.http.itemPost('step/myChange', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: '2'
    }).then(r => {
      if (r.length != 0) {
        this.setData({
          deliveryList: r
        })
      } else {
        this.setData({
          deliveryBol: true
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})