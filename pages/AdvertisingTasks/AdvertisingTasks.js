//index.js
//获取应用实例
const app = getApp()
const utils = app.utils;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    friendNum: 0,
    key: '',
    friendList: [],
    temp: false,
    awardkey: true
  },
  /**
   * 生命周期函数--监听页面加载
   */
  
  add: function () {
    this.setData({
      key: 'share',
    });
  },
  onShow: function () {
    
    // wx.clearStorageSync()
    utils.http.itemPost('step/myshare', { // 获取助力好友
      access_token: wx.getStorageSync(utils.conf.storage.token),
      sign: 20,
      page: 1,
    }).then(r => {
      console.log(r)
      this.setData({
        friendList: r.list,
        friendNum: r.count
      })
    })
    this.setData({
      key: 'index',
      awardkey: wx.getStorageSync('awardkey'),
      temp: wx.getStorageSync('temp')
    });
    console.log(this.data.temp)
    if (this.data.temp == true) {
      var that = this
      setTimeout(function () {
        that.setData({
          temp: false
        })
        wx.setStorageSync('temp', false)
      }, 2000);
    }
    
  },
  getall: function () {
    wx.navigateTo({
      url: '../allfriend/allfriend',
    })
    this.setData({
      key: 'friend',
    });
  },

  onHide: function () {
    var that = this;
    if (this.data.key == 'index' && this.data.awardkey) {

      wx.setStorageSync('Advertising', 'index')
      utils.http.itemPost('step/adReward', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
      }).then(r => {
        if (r.status == 'success') {
          wx.setStorageSync('temp', true);          
          wx.setStorageSync('awardkey', false);          
        }    
      })
    } 
  },


  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    let that = this
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '众人拾柴火焰高！快来帮我一把~',
      path: '/pages/index/index?uid=' + wx.getStorageSync('userinfo').uid,
      imageUrl: '../../images/yibupower.png',
      success: function (res) {
        // 转发成功
        var openGid = '';
        if (res.shareTickets != undefined) { // 分享给群
          // 获取群组编号openGid
          utils.group.openGid(res.shareTickets).then(r => {
            openGid = r;
            return utils.http.itemPost('step/shareGroup', {
              access_token: wx.getStorageSync(utils.conf.storage.token),
              opengid: r
            })
          }).then(success => {
            if (success.status == 'success') {
              wx.showToast({
                title: '步数+2000',
                icon: 'success',
                duration: 1000
              })
              that.setData({
                friendStep: Number(that.data.friendStep) + 2000,
                stepNumber: Number(that.data.stepNumber) + 2000
              })
            } else if (success.status == 'error') {
              if (success.message == '您今日已经分享过该群') {
                wx.showToast({
                  title: '该群已分享过~',
                  icon: 'success',
                  duration: 1000
                })
              } else { // 分享10次了
                wx.showToast({
                  title: '分享成功',
                  icon: 'none',
                  duration: 1000
                })
              }
            }
          }).catch(r => {
            console.log(1);
            wx.showModal({
              title: '提示',
              content: '服务器异常，请稍后再试！',
              showCancel: false
            })
          })
        } else { // 分享给个人
          wx.showToast({
            title: '分享成功',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function (res) {
        // 转发失败
        wx.showToast({
          title: '未分享',
          icon: 'none',
          duration: 1000
        })
      }
    }
  }
})