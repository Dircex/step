//获取应用实例
const app = getApp()
const utils = app.utils;
var page = 1;
var time1 = null;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    contentList: [], // 活动列表
    empty: true, // 默认不为空
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    page = 1;
    this.init();
    clearInterval(time1)
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (wx.getStorageSync('aid')) {
      for (var i = 0; i < this.data.contentList.length; i++) {
        var is_change = 'contentList[' + i + '].is_change';
        if (this.data.contentList[i].id == wx.getStorageSync('aid')) {
          this.setData({
            [is_change]: wx.getStorageSync('astatus')
          });
        }
      }
    }
    page = 1,
      this.init()
  },
  init: function() {
    var that = this;
    utils.http.itemPost('activity/getActivitys', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      page: page,
      size: 10
    }).then(r => {
      if (r.length == 0) {
        that.setData({
          empty: false //为空
        });
      }
      var array = r;
      for (var i = 0; i < array.length; i++) {
        var temp = array[i].end_time.split(' ');
        var date = temp[0].split('-');
        var time = date[1] + '月' + date[2] + '日' + ' ' + (temp[1].split(':')[0] + ':' + temp[1].split(':')[1])
        var lotteryDate = date.join('/') + " " + ' ' + (temp[1].split(':')[0] + ':' + temp[1].split(':')[1])
        array[i].end_time = time;
        if (array[i].title.length > 30) {
          array[i].title = array[i].title.slice(0, 28) + '...';
        }
        //判断抽奖时间调用定时器
        var currentTime = new Date().getTime()
        var lotteryTime = new Date(lotteryDate).getTime()
        if (currentTime <= lotteryTime + 330000) {
          this.timer(currentTime, lotteryTime + 330000)
        }
      }
      that.setData({
        contentList: array
      });
      page++;
    });
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },



  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(time1)
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(time1)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    page = 1;
    this.init();
    wx.hideNavigationBarLoading(); // 停止标题栏中加载
    wx.stopPullDownRefresh(); //完成停止加载
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    utils.http.itemPost('activity/getActivitys', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      page: page,
      size: 10
    }).then(r => {
      var array = r;
      for (var i = 0; i < array.length; i++) {
        var temp = array[i].end_time.split(' ');
        var date = temp[0].split('-');
        var time = date[1] + '月' + date[2] + '日' + ' ' + (temp[1].split(':')[0] + ':' + temp[1].split(':')[1])
        array[i].end_time = time;
        if (array[i].title.length > 30) {
          array[i].title = array[i].title.slice(0, 28) + '...';
        }
      }
      var oldList = that.data.contentList;
      var newList = oldList.concat(array); // concat/push
      that.setData({
        contentList: newList
      });
      page++;
    });
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  },
  // 活动详情
  bindGetUserInfo: function(e) {
    console.log('活动详情')
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync('_ACCESS_TOKEN')) { // 已获取access_token
        // 直接跳转
        wx.navigateTo({
          url: '../lotteryDetail/lotteryDetail?id=' + e.target.dataset.id + '&sign=' + e.target.dataset.sign_,
        });
      } else {
        // 获取 access_token
        utils.user.info('user/getUserInfo', '').then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          page = 1;
          this.init();
          wx.navigateTo({
            url: '../lotteryDetail/lotteryDetail?id=' + e.target.dataset.id + '&sign=' + e.target.dataset.sign_,
          });
        });
      }
    } else { // 拒绝授权
      wx.showToast({
        title: '授权参加活动!',
        image: '../../images/x.png',
        duration: 2000
      });
    }
  },
  // 用于发 模板消息
  formSubmit: function(e) {
    if (wx.getStorageSync(utils.conf.storage.token)) {
      utils.http.basePost('user/setFormId', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        formId: e.detail.formId
      });
    }
  },
//定时刷新
  timer: function(c, l) {
    var that = this
    var time1 = setInterval(function() {
      let currentTime = new Date().getTime()
      if (currentTime >= l) {
        page = 1;
        that.init();
        clearInterval(time1)
      }
    }, 6000);
  },
});