// pages/center/center.js
const app = getApp()
const utils = app.utils;
var timer = null
var timer1 = null
var timer2 = null
var tempPhone = '';
Page({

  /**
   * 页面的初始数据
   */
  data: {
    info: {},
    showShare: wx.getStorageSync('close_share_button'),
    confirmBandPhone: false,
    ttisShow: false,
    sencods: 60, //验证码倒计时
    sencodsFlag: false, //验证码倒计时隐藏
    tips: false, //绑定手机提示信息
    tipsCenter: true, //绑定手机提示信息center
    phoneTips: false, //验证正则错误提示
    codeTips: false, //验证正则错误提示
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    utils.http.itemPost('step/checkUserPhone', {
      access_token: wx.getStorageSync(utils.conf.storage.token)
    }).then(r => {
      if (r.message == "未绑定") {
        //未绑定弹出绑定框
        this.setData({
          ttisShow: true
        });
      } else {
        //已绑定显示选择地址兑换框
        this.setData({
          ttisShow: false
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
    utils.user.info('user/getUserInfo', {}).then(r => {
      wx.hideLoading();
      wx.setStorageSync('userinfo', r)
      this.setData({
        info: {
          bi: wx.getStorageSync('userinfo').gold ? parseInt(wx.getStorageSync('userinfo').gold) : wx.getStorageSync('userinfo').gold,
          continuity: wx.getStorageSync('userinfo').sign_day,
          invite: wx.getStorageSync('userinfo').share_count
        }
      })
    })
  },
  bd_phone: function () {
    clearInterval(timer1)
    this.setData({
      confirmBandPhone: true
    })
  },
  comClose: function () {
    clearInterval(timer1)
    tempPhone = ""
    this.setData({
      confirm: false,
      confirmBandPhone: false,
      sencodsFlag: false,
      sencods: 60,
      tips: false,
      phoneTips: false,
      codeTips: false,
    })
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

  },
  // 我的兌換
  myEx: function(e) {
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync(utils.conf.storage.token)) { // 已获取access_token
        // 直接跳转
        wx.navigateTo({
          url: '../myExchange/myExchange',
        });
      } else {
        wx.showLoading({
          title: '登录中',
          success: function() {}
        });
        // 获取 access_token
        utils.user.info('user/getUserInfo', {}).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          wx.navigateTo({
            url: '../myExchange/myExchange',
          });
        });
      }

    } else { // 拒绝授权
      wx.showToast({
        title: '授权查看!',
        image: '../../images/x.png',
        duration: 2000
      });
    }
  },
  // 运动打卡
  punch: function(e) {
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync(utils.conf.storage.token)) { // 已获取access_token
        // 直接跳转
        wx.navigateTo({
          url: '../punch/punch',
        });
      } else {
        wx.showLoading({
          title: '登录中',
          success: function() {}
        });
        // 获取 access_token
        utils.user.info('user/getUserInfo', {}).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          wx.navigateTo({
            url: '../punch/punch',
          });
        });
      }

    } else { // 拒绝授权
      wx.showToast({
        title: '授权打卡!',
        image: '../../images/x.png',
        duration: 2000
      });
    }
  },
  // 赚步攻略
  strategy: function() {
    wx.navigateTo({
      url: '../strategy/strategy',
    })
  },
  // 步步币记录
  getRecord: function(e) {
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync(utils.conf.storage.token)) { // 已获取access_token
        // 直接跳转
        wx.navigateTo({
          url: '../money/money',
        })
      } else {
        wx.showLoading({
          title: '登录中',
          success: function() {}
        });
        // 获取 access_token
        utils.user.info('user/getUserInfo', {}).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          wx.navigateTo({
            url: '../money/money',
          })
        });
      }

    } else { // 拒绝授权
      wx.showToast({
        title: '授权查看!',
        image: '../../images/x.png',
        duration: 2000
      });
    }

  },
  // 我参与的
  myJoin: function (e) {
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync(utils.conf.storage.token)) {
        wx.navigateTo({
          url: '../involved/involved',
        });
      } else {
        // 获取 access_token
        utils.user.info('user/getUserInfo', {}).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          wx.navigateTo({
            url: '../involved/involved',
          });
        });
      }
    } else {
      wx.showToast({
        title: '授权登录查看!',
        image: '../../images/x.png',
        duration: 2000
      });
    }

  },
  // 调用微信收货地址
  getAddress: function(e) {
    if (e.detail.userInfo) { // 已授权
      if (wx.getStorageSync(utils.conf.storage.token)) {
        wx.authorize({
          scope: 'scope.address',
          success(res) {
            //打开选择地址  
            wx.chooseAddress({
              success: function(r) {
                utils.http.itemPost('user/saveAddress', {
                  access_token: wx.getStorageSync(utils.conf.storage.token),
                  name: r.userName,
                  phone: r.telNumber,
                  country: r.countyName,
                  province: r.provinceName,
                  city: r.cityName,
                  detail: r.detailInfo
                }).then(r => {
                  console.log(r)
                });
              }
            });
          },
          fail(res) {
            //用户拒绝授权后执行  
            wx.getSetting({
              success(res) {
                if (!res.authSetting['scope.address']) {
                  wx.openSetting({});
                }
              },
              fail(res) {
                console.log('调用失败')
              }
            });
          }
        });
      } else {
        wx.showLoading({
          title: '登录中',
          success: function() {}
        });
        // 获取 access_token
        utils.user.info('user/getUserInfo', {}).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
        });
      }
    } else {
      wx.showToast({
        title: '授权获取!',
        image: '../../images/x.png',
        duration: 2000
      });
    }
  },
  // 常见问题
  problem: function() {
    wx.navigateTo({
      url: '../problem/problem',
    });
  },
  // 联系我们
  contact: function() {
    wx.previewImage({
      // 当前显示图片的http链接  
      current: "https://images.zunyuapp.cn/public/qingsongxiuchuhaoshencai.jpg",
      // 需要预览的图片http链接  使用split把字符串转数组。不然会报错 
      urls: ["https://images.zunyuapp.cn/public/qingsongxiuchuhaoshencai.jpg"]
    });
  },
  //绑定手机号
  formSubBP: function (e) {
    var that = this
    if (e.detail.value.phone != "" && that.inputCode(e.detail.value.code)) {
      utils.http.itemPost('step/bindPhone', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        phone: e.detail.value.phone,
        very_code: e.detail.value.code
      }).then(r => {
        wx.showModal({
          title: '提示',
          content: r,
        })
        that.setData({
          confirmBandPhone: false
        })
      }).catch(r => {
        wx.showModal({
          title: '提示',
          content: r.note,
          showCancel: false
        })
      })
    }
  },
  //验证码倒计时
  onCode: function () {
    var that = this
    console.log('验证码倒计时')
    timer1 = setInterval(function () {
      that.setData({
        sencodsFlag: true,
        sencods: Number(that.data.sencods) - 1
      })
      if (that.data.sencods == 0) {
        clearInterval(timer1)
        that.setData({
          sencodsFlag: false,
          sencods: 60
        })
      }
    }, 1000)
  },
  //手机号正则匹配
  inputPhone: function (e) {
    var that = this
    var regPhone = /^[1][3,4,5,6,7,8][0-9]{9}$/
    console.log('inputPhone!', regPhone.test(e.detail.value))
    if (!regPhone.test(e.detail.value)) {
      console.log('请输入正确的手机号!', regPhone.test(e.detail.value))
      that.setData({
        phoneTips: true
      })
    } else {
      that.setData({
        phoneTips: false
      })
      tempPhone = e.detail.value
    }
  },
  //验证码正则匹配
  inputCode: function (str) {
    var that = this
    var regCode = /^\d{6}$/
    if (!regCode.test(str)) {
      console.log('请输入六位验证码!', regCode.test(str))
      that.setData({
        codeTips: true
      })
      return false
    } else {
      that.setData({
        codeTips: false
      })
      return true
    }
  },
  //发送手机验证码
  sendVeryCode: function () {
    var that = this
    if (!that.data.sencodsFlag) {
      if (tempPhone.length != 11) {
        that.setData({
          phoneTips: true
        })
      } ; 
      if (tempPhone.length == 11) {
        that.onCode() //验证码倒计时
        console.log('发送手机验证码', tempPhone)
        utils.http.itemPost('step/sendVeryCode', {
          access_token: wx.getStorageSync(utils.conf.storage.token),
          phone: tempPhone
        }).then(r => { }).catch(r => {
          wx.showModal({
            title: '提示',
            content: r.note,
            showCancel: false
          })
          clearInterval(timer1)
          that.setData({
            sencodsFlag: false,
            sencods: 60
          })
          tempPhone = '';
        })
      } else {
        console.log('请输入手机号', tempPhone)
      }
    }
  }
});
