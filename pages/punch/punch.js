// pages/punch/punch.js
//获取应用实例
const app = getApp()
const utils = app.utils;
const ctx = wx.createCanvasContext('shareImg');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    date: {
      day: '',
      month: '',
      week: '',
    },
    mEng: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    wEng: ['Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat', 'Sun'],
    words: ['想要放弃了的时候，想想当初为什么开始？', '我努力过了，不管成功与否我不后悔。', '只要不放弃，你永远都是强者！', '不断奔跑，才能更靠近梦想。', '搏生命之极限，铸青春之辉煌。', '生活从未变得轻松，是你在一点一点变强大。'],
    userinfo: {},
    checked: true, // 提醒签到，默认选中 
    bgImg: [],
    bgIndex: 0,
    canvasInfo: {},
    qrCode: '', //小程序码
    bgPic: '', // 背景图片
    avatar: '', //用户头像
    showShare: wx.getStorageSync('close_share_button') // 
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.showLoading({
      title: '生成中',
    });

    that.setData({
      userinfo: wx.getStorageSync('userinfo')
    })
    // 日期、星期数字-转-英文
    let nowDate = new Date();
    let m = nowDate.getMonth() + 1,
      w = nowDate.getDay();
    let month, week;
    for (var i = 0; i < that.data.mEng.length; i++) {
      if (m == i + 1) {
        month = that.data.mEng[i]
      }
    }
    for (var i = 0; i < that.data.wEng.length; i++) {
      if (w == i + 1) {
        week = that.data.wEng[i]
      }
    }
    this.setData({
      date: {
        day: nowDate.getDate() < 10 ? ('0' + nowDate.getDate()) : (nowDate.getDate()),
        month: month,
        week: week
      }
    });
    let query = wx.createSelectorQuery();
    query.select('.ctx').boundingClientRect();
    query.exec(function(info) {
      that.setData({
        canvasInfo: info
      })
      // 获取背景图
      utils.http.itemPost('step/getPunchIcon', {
        access_token: wx.getStorageSync(utils.conf.storage.token)
      }).then(r => {
        that.setData({
          bgImg: r
        })
        // 获取小程序码
        return utils.http.itemPost('step/shareTpl', {
          access_token: wx.getStorageSync(utils.conf.storage.token)
        })
      }).then(r => {
        // 下载小程序码图片
        console.log('小程序码图片url',r)
        wx.downloadFile({
          url: r,
          success: function(res) {
            that.setData({
              qrCode: res.tempFilePath
            })
            console.log('小程序码图片tempFilePath', res.tempFilePath)
            // 下载背景图
            wx.downloadFile({
              url: that.data.bgImg[that.data.bgIndex],
              success: function(bgPath) {
                that.setData({
                  bgPic: bgPath.tempFilePath
                });
                // 下载头像
                wx.downloadFile({
                  url: that.data.userinfo.avatar,
                  success: function(avatar) {
                    that.setData({
                      avatar: avatar.tempFilePath
                    })
                    // 画图 
                    that.huatu(info, 0);
                  }
                })

              }
            })

          }
        })
      })
    });
  },
  huatu: function(res, index) {
    var that = this;
    var w = res[0].width; // canvas宽度
    var h = res[0].height; // canvas高度
    ctx.drawImage(that.data.bgPic, 0, 0, w, h);
    ctx.fillStyle = 'white';
    // 日期
    ctx.setFontSize(35);
    ctx.fillText(that.data.date.day, w * 0.05, h * 0.12);
    ctx.setFontSize(16);
    ctx.fillText(that.data.date.month, w * 0.18, h * 0.12);
    ctx.fillText(that.data.date.week, w * 0.25, h * 0.12);
    // 配词
    ctx.setFontSize(16);
    ctx.fillText(that.data.words[index], w * 0.05, h * 0.2);
    // 昵称
    ctx.setFontSize(16);
    ctx.fillText(that.data.userinfo.nickname, w * 0.25, h * 0.38);
    ctx.setFontSize(13);
    ctx.fillText('邀请你一起来运动哦~', w * 0.25, h * 0.44);
    // 步数
    ctx.setFontSize(14);
    ctx.fillText('今日步数', w * 0.05, h * 0.62);
    ctx.setFontSize(33);
    ctx.fillText(that.data.userinfo.step, w * 0.23, h * 0.64); //
    // 签到
    ctx.setFontSize(14);
    ctx.fillText('连续运动', w * 0.62, h * 0.62);
    ctx.setFontSize(33);
    ctx.fillText(that.data.userinfo.sign_day, w * 0.8, h * 0.64); //
    // 小程序码
    ctx.setFontSize(23);
    ctx.fillStyle = 'black';
    ctx.fillText('步步赢礼', w * 0.2, h * 0.82);
    ctx.setFontSize(14);
    ctx.fillStyle = '#9b9b9b';
    ctx.fillText('长按小程序码识别', w * 0.17, h * 0.89);
    // 获取小程序码
    ctx.drawImage(that.data.qrCode, w * 0.56, h * 0.75, 75, 75);

    // 头像
    var x = w * 0.075;
    var y = h * 0.34;
    var r = w * 0.13;
    ctx.drawImage(that.data.avatar, x, y, r, r); // 114
    ctx.draw();

    wx.hideLoading()
  },
  // 提醒签到
  remind: function() {
    this.setData({
      checked: !this.data.checked
    })
  },
  // 换一个
  change: function() {
    wx.showLoading({
      title: '切换中',
    })
    var that = this;
    if (that.data.bgIndex == 5) {
      that.setData({
        bgIndex: 0
      })
    } else {
      that.setData({
        bgIndex: that.data.bgIndex + 1
      })
    }

    // 下载背景图
    wx.downloadFile({
      url: that.data.bgImg[that.data.bgIndex],
      success: function(bgPath) {
        that.setData({
          bgPic: bgPath.tempFilePath
        });
        //  清除画布
        ctx.clearRect(0, 0, that.data.canvasInfo[0].width, that.data.canvasInfo[0].height)
        ctx.draw();
        //  重新绘图
        that.huatu(that.data.canvasInfo, that.data.bgIndex);
      }
    })
  },
  // 保存图片
  saveImg: function() {
    var that = this;
    wx.canvasToTempFilePath({
      x: 0,
      y: 0,
      canvasId: 'shareImg',
      success: function(r) {
        wx.getSetting({
          success(res) {
            if (!res.authSetting['scope.writePhotosAlbum']) {
              wx.authorize({
                scope: 'scope.writePhotosAlbum',
                success() {
                  wx.saveImageToPhotosAlbum({
                    filePath: r.tempFilePath,
                    success: function(su) {
                      wx.showToast({
                        title: '保存图片成功',
                        icon: "success",
                      });
                      // 保存后返回上一页
                      setTimeout(function() {
                        wx.navigateBack({
                          delta: 1
                        });
                      }, 500);
                    }
                  });
                },
                fail: function(e) {
                  // 用户拒绝授权
                  wx.openSetting({});
                }
              });
            } else {
              wx.saveImageToPhotosAlbum({
                filePath: r.tempFilePath,
                success: function(su) {
                  wx.showToast({
                    title: '保存图片成功',
                    icon: "success",
                  });
                  // 保存后返回上一页
                  setTimeout(function() {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 500);
                }
              });
            }
          }
        });
      }
    });
  },
  // 发送模板消息
  formSubmit: function(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      if (this.data.checked) {
        // 请求
        utils.http.itemPost('step/setFromId', {
          access_token: wx.getStorageSync(utils.conf.storage.token),
          type: 'yd', // 
          from_id: e.detail.formId,
        })
      }
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

    return {
      title: this.data.words[this.data.bgIndex],
      path: '/pages/index/index?uid=' + wx.getStorageSync('userinfo').uid + '&mold=punch',
      success: function(res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'none',
          duration: 1000
        })
      },
      fail: function(res) {
        // 转发失败
      }
    }
  }
})