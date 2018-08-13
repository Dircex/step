const app = getApp()
const utils = app.utils
var ingPage = 1,
  endPage = 1;

Page({

  /**
   * 页面的初始数据
   */
  data: {
    ingList: [], // 进行中列表
    overList: [], // 已结束列表
    status: 'ing',
    haveIng: '', // 是否有进行中列表
    haveOver: '', //是否有已结束列表
    endPage: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    ingPage = 1;
    // endPage = 1;
    this.getIngList();

  },
  // 获取我参与的进行中的列表
  getIngList: function() {
    var that = this;
    utils.http.itemPost('user/changeRecord', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: '1',
      page: ingPage,
      size: 10
    }).then(r => {
      if (r.length == 0) {
        that.setData({
          haveIng: false
        });
      } else {
        that.setData({
          haveIng: true
        });
        var ingArr = r;
        for (var i = 0; i < ingArr.length; i++) {
          var temp = ingArr[i].end_time.split(' ');
          var date = temp[0].split('-');
          var time = date[1] + '月' + date[2] + '日'
          ingArr[i].end_time = time;
          if (ingArr[i].title.length > 30) {
            ingArr[i].title = ingArr[i].title.slice(0, 28) + '...';
          }
        }
        that.setData({
          ingList: ingArr
        });
        ingPage++;
      }
    }).catch(fail => {
      // access_token过期  重新获取
      utils.user.token().then(() => {
        that.getIngList();
      });
    });
  },
  // 进行中
  ing: function() {
    this.setData({
      status: 'ing'
    });
    ingPage = 1;
    this.getIngList();
  },
  // 已结束
  over: function() {
    this.setData({
      status: 'over'
    });
    this.getOverList();
  },
  getOverList: function() {
    var that = this;
    console.log('that.data.endPage',that.data.endPage)
    utils.http.itemPost('user/changeRecord', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: '2',
      page: that.data.endPage,
      size: 10
    }).then(r => {
      if (r.length == 0&&that.data.endPage==1) {
        that.setData({
          haveOver: false
        });
      } else {
        var overArr = r;
        for (var i = 0; i < overArr.length; i++) {
          var temp = overArr[i].end_time.split(' ');
          var date = temp[0].split('-');
          var time = date[1] + '月' + date[2] + '日'
          overArr[i].end_time = time;
          if (overArr[i].title.length > 30) {
            overArr[i].title = overArr[i].title.slice(0, 28) + '...';
          }
        }
        that.setData({
          overList: this.data.overList.concat(overArr),
          haveOver: true,
          endPage: that.data.endPage+1
        });
       
      }
    });
  },
  // 活动详情
  adetail: function(e) {
    wx.navigateTo({
      url: '../lotteryDetail/lotteryDetail?id=' + e.currentTarget.dataset.id,
    });
  },
  // 查看结束详情
  viewOver: function(e) {
    wx.navigateTo({
      url: '../lotteryDetail/lotteryDetail?id=' + e.currentTarget.dataset.id + '&sign=2',
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
    wx.showNavigationBarLoading(); //在标题栏中显示加载
    if (this.data.status == 'ing') {
      ingPage = 1;
      this.getIngList();
      wx.hideNavigationBarLoading(); // 停止标题栏中加载
      wx.stopPullDownRefresh(); //完成停止加载
    } else if (this.data.status == 'over') {
      endPage = 1;
      this.getOverList();
      wx.hideNavigationBarLoading(); // 停止标题栏中加载
      wx.stopPullDownRefresh(); //完成停止加载
    }
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {
    var that = this;
    if (that.data.status == 'ing') { // 进行中
      utils.http.itemPost('user/changeRecord', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        type: '1',
        page: ingPage,
        size: 10
      }).then(r => {
        if (r.length != 0) {
          that.setData({
            haveOver: true
          });
          var ingArr = r;
          for (var i = 0; i < ingArr.length; i++) {
            if (ingArr[i].title.length > 30) {
              ingArr[i].title = ingArr[i].title.slice(0, 28) + '...';
            }
          }
          var oldList = that.data.ingList;
          var newList = oldList.concat(ingArr);
          that.setData({
            ingList: newList
          });
          ingPage++;
        }
      });
    } else if (that.data.status == 'end') { // 已结束
      utils.http.itemPost('user/changeRecord', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        type: '2',
        page: that.data.endPage,
        size: 10
      }).then(r => {
        if (r.length != 0) {
          var overArr = r;
          for (var i = 0; i < overArr.length; i++) {
            if (overArr[i].title.length > 30) {
              overArr[i].title = overArr[i].title.slice(0, 28) + '...';
            }
          }
          var oldList = that.data.overList;
          var newList = oldList.concat(overArr);
          that.setData({
            overList: newList,
            endPage:that.data.endPage+1
          });
        }
      });
    }
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function() {

  }
})