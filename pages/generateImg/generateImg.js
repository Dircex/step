// pages/test/test.js
const app = getApp()
const utils = app.utils;
const ctx = wx.createCanvasContext('shareImg');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    bg: '../../images/poster.png',
    // drawbg:'../../images/drawbg.png',
    aImg: '',
    codeImg: '',
    title: '',
    info: '',
    saveBol: false, // 保存图片按钮
    canvasInfo: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      title: options.title,
      info: options.info
    });
    wx.showLoading({
      title: '生成中',
    })
    let query = wx.createSelectorQuery();
    query.select('.ctx').boundingClientRect();
    query.exec(function(info) {
      that.setData({
        canvasInfo: info
      })
      // console.log('---aImg---',options.aImg)
      // 活动图片
      wx.downloadFile({
        url: options.aImg,
        success: function(res) {
          that.setData({
            aImg: res.tempFilePath
          });
          console.log('----------options.aid-----------',options.aid)
          utils.http.itemPost('step/shareTpl', {
            access_token: wx.getStorageSync(utils.conf.storage.token),
            id: options.aid,
            type: 2
          }).then(r => {
            // 用canvas绘制网络图片,需要先将图片下载至本地
            //  二维码 图片
            console.log('---shareTpl---', r)
            wx.downloadFile({
              url: r,
              success: function(res) {
                that.setData({
                  codeImg: res.tempFilePath
                });
                console.log('---codeImg---',r, res,that.data.codeImg)
                wx: wx.hideLoading();
                that.drawImg(info);
              },
              fail:function(err){
                console.log('---codeImg--err-', err)
              }
              
            });
          });
        }
      });
    });
  },
  drawImg: function(res) {
    var that = this;
    var w = res[0].width; // canvas宽度
    var h = res[0].height; // canvas高度
    // console.log(res)
    ctx.drawImage(that.data.bg, 0, 0, w, h);//背景图
    ctx.draw();
    ctx.drawImage(that.data.aImg, w*0.05, h * 0.43, w * 0.9, h * 0.276);//活动图
    ctx.draw(true);
    ctx.drawImage(that.data.codeImg, w*0.60, h*0.83, w * 0.19, h * 0.13);//小程序码
    ctx.draw(true);
    ctx.setFontSize(16);
    ctx.fillStyle = "#545452";
    ctx.fillText(that.data.title, w * 0.08, h*0.75); // 标题
    ctx.setFontSize(12);
    ctx.fillStyle = "gray";
    ctx.fillText(that.data.info, w * 0.08, h*0.79); // 内容
    ctx.fillText('立即免费抽奖', w*0.18, h*0.88)
    ctx.fillText('长按识别二维码>>', w*0.18, h*0.93)
    ctx.draw(true);
    that.setData({
      saveBol: true
    });
  },
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
                  console.log(su)
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
      title: '抽奖赢好礼',
      path: '/pages/index/index?uid=' + wx.getStorageSync('userinfo').uid + '&mold=generateImg',
      success: function (res) {
        // 转发成功
        wx.showToast({
          title: '分享成功',
          icon: 'none',
          duration: 1000
        })
      },
      fail: function (res) {
        // 转发失败
      }
    }
  }
})