//index.js
//获取应用实例
const app = getApp()
const utils = app.utils;
var timer1 = null;
var tempPhone =""
Page({

  /**
   * 页面的初始数据
   */
  data: {
    myData: {}, // 我的信息
    friengData: {}, // 分享人的信息
    imgUrls: [], // 轮播图列表
    giftList: [], //礼品列表
    signinData: [{
      money: 10,
      checked: true
    }],
    loginBol: null, //是否登录，默认登录
    userinfo: null,
    presentBol: true, //量少赠送，默认未赠送
    stepNum: '', //赠送的步数
    options: {},
    give_step: '',
    confirm: false,
    exInfo: {}, //是否可兑换信息
    week_count: '', //本周剩余赠送次数
    numStep: false, //兑换步数不足弹框
    numStepInfo: {}, //兑换步数不足显示info
    confirmBandPhone: false, //绑定手机弹层
    sencods: 60, //验证码倒计时
    sencodsFlag: false, //验证码倒计时隐藏
    tips: true, //绑定手机提示信息
    tipsCenter: false, //绑定手机提示信息center
    phoneTips: false, //验证正则错误提示
    codeTips: false, //验证正则错误提示
  },
  // 登录
  _login: function(e) {
    if (e.detail.userInfo) {
      // if (wx.getStorageSync(utils.conf.storage.token)) { // 已获取access_token
      //   // 直接跳转
      //   this.setData({
      //     loginBol:true
      //   })

      // } else {
      //   // 获取 access_token
      //   utils.user.info('user/getUserInfo', '').then(r => {
      //     wx.hideLoading();
      //     wx.setStorageSync('userinfo', r);

      //     this.setData({
      //       loginBol: true
      //     })
      //   });
      // }
      wx.setStorageSync('userinfo', e.detail.userInfo);
      this.setData({
        loginBol: true
      })
    } else {
      wx.showToast({
        title: '授权查看!',
        image: '../../images/x.png',
        duration: 2000
      });
    }
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    this.setData({
      options: options
    })
    if (wx.getStorageSync(utils.conf.storage.token)) { // 已授权
      this.login();
      this.setData({
        loginBol: true
      })
    } else {
      this.login();
    }
  },
  login: function() {
    // 登录
    console.log(this.data.options.uid)
    utils.user.info('user/getUserInfo',{}).then(r => {
      wx.hideLoading();
      wx.setStorageSync('userinfo', r)
      return utils.http.itemPost('step/giveStepInfo', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        share_uid: this.data.options.uid
      })
    }).then(r => {
      this.setData({
        week_count: r.week_count
      })
      var myNick, friendNick;
      if (r.userinfo.nickname.length > 6) {
        myNick = r.userinfo.nickname.slice(0, 5) + '*';
      } else {
        myNick = r.userinfo.nickname;
      }
      if (r.share_userinfo.nickname.length > 4) {
        friendNick = r.share_userinfo.nickname.slice(0, 3) + '*';
      } else {
        friendNick = r.share_userinfo.nickname;
      }
      this.setData({
        myData: {
          myStep: r.userinfo.step,
          nickname: myNick
        },
        friengData: {
          friendStep: r.share_userinfo.step,
          nickname: friendNick
        },
        give_step: r.give_step // 剩余可赠送步数
      })
      return utils.http.itemPost('step/getBannerList', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
      })
    }).then(r => {
      this.setData({
        imgUrls: r
      })
      // 获取商品列表
      return utils.http.itemPost('step/getGoodsList', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
      })
    }).then(r => {
      console.log('ss' + r)
      if (r.goods.length != 0) {
        let temp = r.goods[0].list;
        for (var i = 0; i < temp.length; i++) {
          temp[i].buy_price = Number(temp[i].buy_price)
          let key = 'step';
          let value = temp[i].buy_price / 10000 + '万步'
          temp[i][key] = value
        }
        this.setData({
          giftList: temp,
          exInfo: r.userinfo
        })
      }
    }).catch(fail=>{
      console.log('失败失败')
      console.log(fail)
    })
  },
  inputChange: function(e) {
    this.setData({
      stepNum: e.detail.value
    });
  },
  // 赠送
  presentBtn: function() {
    if (this.data.week_count > 0) { // 剩余赠送次数>0
      if (this.data.stepNum) {
        if (Number(this.data.stepNum) > Number(this.data.myData.myStep)) {
          wx.showToast({
            title: '步数不足！',
            icon: 'none',
            duration: 1000
          })
        } else {
          utils.http.itemPost('step/giveStep', {
            access_token: wx.getStorageSync(utils.conf.storage.token),
            step: this.data.stepNum,
            share_uid: this.data.options.uid
          }).then(r => {
            // 赠送成功
            if (r.status == 'success') {
              this.setData({
                presentBol: false
              })
              wx.setStorageSync('over', 'over') // 赠送完成
            } else if (r.status == 'error') {
              if (r.message == "请绑定手机号后继续操作") {
                // wx.showModal({
                //   title: '提示',
                //   content: r.message,
                //   showCancel: false
                // })
                console.log('请绑定手机号后继续操作')
                this.setData({
                  confirmBandPhone: true,
                  tips: false,
                })
              } else {
                wx.showToast({
                  title: r.message,
                  image: '../../images/x.png',
                  duration: 1000
                })

              }
            }

          })
        }
      }
    } else {
      wx.showToast({
        title: '赠送次数不足！',
        image: '../../images/x.png',
        duration: 1000
      })
    }
  },
  // 我也要换礼
  goIndex: function() {
    wx.switchTab({
      url: '../index/index',
    })
  },
  comClose: function() {
    clearInterval(timer1)
    tempPhone = ""
    this.setData({
      confirm: false,
      confirmBandPhone: false,
      sencodsFlag: false,
      sencods: 60,
      tips: true,
      phoneTips: false,
      codeTips: false,
    })
  },
  // 兑换确认信息弹层
  exchange: function(e) {
    clearInterval(timer1)
    if (e.currentTarget.dataset.status == 'true') {
      if (this.data.exInfo.step_total < e.currentTarget.dataset.step || Number(e.currentTarget.dataset.show_stock) < 0) {
        this.setData({
          numStep: true,
          numStepInfo: {
            'title': e.currentTarget.dataset.title,
            'step': (Number(e.currentTarget.dataset.step) > 10000) ? Number(e.currentTarget.dataset.step) / 10000 + '万步' : Number(e.currentTarget.dataset.step) + '步',
            'img': e.currentTarget.dataset.img,
            'myStep': (this.data.myData.myStep > 10000) ? this.data.myData.myStep / 10000 + '万步' : +this.data.myData.myStep + '步'
          }
        })
      } else {
        //检查用户是否绑定手机
        utils.http.itemPost('step/checkUserPhone', {
          access_token: wx.getStorageSync(utils.conf.storage.token)
        }).then(r => {
          if (r.message == "未绑定") {
            //未绑定弹出绑定框
            this.setData({
              confirmBandPhone: true
            })
          } else {
            //已绑定显示选择地址兑换框
            this.setData({
              curGoodId: e.currentTarget.dataset.id,
              confirm: true
            })
          }
        }).catch(r => {
          wx.showModal({
            title: '提示',
            content: '服务器异常，请稍后再试！',
            showCancel: false
          })
        })
      }
    }
  },
  // 确认兑换
  exchange_com: function() {
    utils.http.itemPost('step/exchangeGoods', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      gid: this.data.curGoodId
    }).then(r => {
      this.setData({
        confirm: false
      })
      if (r.status == 'success') {
        wx.showToast({
          title: '兑换成功',
          icon: 'success',
          duration: 1000
        })
      } else {
        if (r.message == '您的账号已被暂停使用') {
          wx.showModal({
            title: '提示',
            content: '您的账号因违规被冻结，如有问题请联系客服。',
            showCancel: false,
          })
        } else if (r.message == '您今日该商品兑换次数已满') {
          wx.showModal({
            title: '提示',
            content: '今日已兑换该商品，明天再来哦~',
            showCancel: false,
          })
        } else if (r.message == '您本周该商品兑换次数已满') {
          wx.showModal({
            title: '提示',
            content: '本周该商品兑换次数已满，下周再来哦~',
            showCancel: false,
          })
        } else if (r.message == '您本月该商品兑换次数已满') {
          wx.showModal({
            title: '提示',
            content: '您本月该商品兑换次数已满',
            showCancel: false,
          })
        } else {
          wx.showToast({
            title: r.message,
            image: '../../images/x.png',
            duration: 1000
          })
        }
        console.log(r.message)
      }
    })
  },
  //关闭兑换不足提示
  stepClose: function() {
    this.setData({
      numStep: false
    })
  },
  // 发送模板消息
  formSubmit: function(e) {
    if (e.currentTarget.dataset.type == "exchange") { // 兑换奖品
      utils.http.itemPost('step/setFromId', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        type: 'goods', // 
        from_id: e.detail.formId,
      })
    }
  },
  // 点击轮播图
  detail: function(e) {
    if (e.currentTarget.dataset.type == '2') { // 弹层
      wx.showModal({
        title: '拼步',
        content: e.currentTarget.dataset.path,
        showCancel: false
      })
    } else if (e.currentTarget.dataset.type == '1') { // 跳转赚步攻略
      wx.navigateTo({
        url: e.currentTarget.dataset.path,
      })
    }
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
    let that = this
    wx.showShareMenu({
      withShareTicket: true
    })
    return {
      title: '借一"步",换个"礼"呗~',
      path: '/pages/index/index?uid=' + wx.getStorageSync('userinfo').uid,
      imageUrl: '../../images/shareImg.png',
      success: function(res) {
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
          })
        } else { // 分享给个人
          wx.showToast({
            title: '分享成功',
            icon: 'none',
            duration: 1000
          })
        }
      },
      fail: function(res) {
        // 转发失败
        wx.showToast({
          title: '未分享',
          icon: 'none',
          duration: 1000
        })
      }
    }
  },
  //绑定手机号
  formSubBP: function(e) {
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
  onCode: function() {
    var that = this
    console.log('验证码倒计时')
    timer1 = setInterval(function() {
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
  inputPhone: function(e) {
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
      };
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

})