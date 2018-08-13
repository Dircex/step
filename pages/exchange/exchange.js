// pages/exchange/exchange.js
const app = getApp()
const utils = app.utils;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    lampList: [],
    imgUrls: [{ // 轮播图列表
      url: '../../images/ex2.png'
    }, {
      url: '../../images/ex3.png'
    }],
    giftList_seven: [], //礼品列表
    giftList_thir: [], //礼品列表
    giftList_share: [], //礼品列表
    exInfo: [], // 是否可兑换状态 
    invited: wx.getStorageSync('userinfo').share_count, // 已邀请人数
    signday_7: wx.getStorageSync('userinfo').signday_7,
    signday_30: wx.getStorageSync('userinfo').signday_30,
    confirm: false, //确认信息弹层
    curGoodId: '', //当前兑换商品id.
    showShare: wx.getStorageSync('close_share_button'),
    numStep: false, //兑换步数不足弹框
    numStepInfo: {}, //兑换步数不足显示info
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    if (wx.getStorageSync(utils.conf.storage.token)) { // 已授权
      utils.http.itemPost('step/getGoodsList', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        type: 'ex'
      }).then(r => {
        let infoTemp = [];
        for (var i = 0; i < r.goods.length; i++) {
          let temp = r.goods[i].list;
          for (let j = 0; j < temp.length; j++) {
            if (temp[j].buy_type == '1') { // 步数
              temp[j].buy_price = temp[j].buy_price / 10000 + '万步';
            } else {
              // 步步币
              temp[j].buy_price = parseInt(temp[j].buy_price)
            }
          }
          infoTemp.push(r.goods[i].exchange)
          if (r.goods[i].name == "30日特权") {
            this.setData({
              giftList_thir: {
                list: temp,
                status: r.goods[i].exchange
              },
              signday_30: r.goods[i].desc,
            })
          } else if (r.goods[i].name == '7日特权') {
            this.setData({
              giftList_seven: {
                list: temp,
                status: r.goods[i].exchange
              },
              signday_7: r.goods[i].desc
            })
          } else if (r.goods[i].name == '分享专区') {
            this.setData({
              giftList_share: {
                list: temp,
                status: r.goods[i].exchange
              },
              invited: r.goods[i].desc, // 已邀请人数
            })
          }
        }
        return utils.http.itemPost('step/showHorse', {
          access_token: wx.getStorageSync(utils.conf.storage.token),
        })
      }).then(r => {
        this.setData({
          lampList: r
        })
      })
    }
  },
  // 关闭弹层
  comClose: function() {
    this.setData({
      confirm: false
    })
  },
  // 兑换确认信息弹层
  exchange: function(e) {
    if (e.currentTarget.dataset.status == 'true') { // 有库存
      if (e.currentTarget.dataset.sign == 'seven') { // 7日
        if (this.data.giftList_seven.status == false) {
          wx.showToast({
            title: '未获得特权',
            image: '../../images/x.png',
            duration: 1000
          })
          return;
        } else { // 条件满足
          if (e.currentTarget.dataset.check == false) { // 步步币不足
            wx.showToast({
              title: '步步币不足',
              image: '../../images/x.png',
              duration: 1000
            })
            this.setData({
              numStep: true,
              numStepInfo: {
                'title': e.currentTarget.dataset.title,
                'step': Number(e.currentTarget.dataset.step) / 10000 + '万步',
                'img': e.currentTarget.dataset.img,
                'myStep': (this.data.myStep > 10000) ? this.data.myStep / 10000 + '万步' : +this.data.myStep + '步'
              }
            })
            return;
          }
        }
      } else if (e.currentTarget.dataset.sign == 'thir') { // 30日
        if (this.data.giftList_thir.status == false) {
          wx.showToast({
            title: '未获得特权',
            image: '../../images/x.png',
            duration: 1000
          })
          return;
        } else {
          if (e.currentTarget.dataset.check == false) { // 
            wx.showToast({
              title: '步步币不足',
              image: '../../images/x.png',
              duration: 1000
            })
            return;
          }
        }
      } else if (e.currentTarget.dataset.sign == 'share') { // 分享
        if (this.data.giftList_share.status == false) {
          wx.showToast({
            title: '未获得特权',
            image: '../../images/x.png',
            duration: 1000
          })
          return;
        } else {
          if (e.currentTarget.dataset.check == false) { // 
            wx.showToast({
              title: '步步币不足',
              image: '../../images/x.png',
              duration: 1000
            })
            return;
          }
        }
      }
      this.setData({
        curGoodId: e.currentTarget.dataset.id,
        confirm: true
      })
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
        this.refresh(); // 刷新商品信息
      } else {
        if (r.message.length > 7) {
          wx.showModal({
            title: '提示',
            content: r.message,
            showCancel: false
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
  },
  //关闭兑换不足提示
  stepClose: function() {
    this.setData({
      numStep: false
    })
  },
  // 刷新列表
  refresh: function() {
    utils.http.itemPost('step/getGoodsList', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: 'ex'
    }).then(r => {
      for (var i = 0; i < r.length; i++) {
        let temp = r[i].list;
        for (let j = 0; j < temp.length; j++) {
          if (temp[j].buy_type == '1') { // 步数
            temp[j].buy_price = temp[j].buy_price / 10000 + '万步';
          } else {
            // 步步币
            temp[j].buy_price = parseInt(temp[j].buy_price)
          }
        }
        if (r[i].name == "30日特权") {
          this.setData({
            giftList_thir: temp,
            signday_30: r[i].desc,
          })
        } else if (r[i].name == '7日特权') {
          this.setData({
            giftList_seven: temp,
            signday_7: r[i].desc
          })
        } else if (r[i].name == '分享专区') {
          this.setData({
            giftList_share: temp,
            invited: r[i].desc, // 已邀请人数
          })
        }
      }
    })
  },
  // 发送模板消息
  formSubmit: function(e) {
    if (e.currentTarget.dataset.type == "exchange") { // 兑换奖品
      utils.http.itemPost('step/setFromId', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        type: 'goods', // 
        from_id: e.detail.formId,
        gid: this.data.curGoodId
      })
    }
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