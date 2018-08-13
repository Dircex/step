// pages/lotteryDraw/lotteryDraw.js
const app = getApp();
const utils = app.utils;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    detail: {}, // 活动详情
    spread: true, //默认为未展开状态（活动内容）
    num: 0, // 参与人数
    rankList: [], // 排行榜
    status: null, // 控制出现的是哪种状态下的弹层 0:参与 1：提升 
    code: [{ // 参与得到的抽奖码
      codeNumber: '',
      close_share_bth: true,
      img: null
    }],
    shareType: true, // 分享方式
    shareImgBol: true, // 生成分享图
    myCode: false, //我的抽奖码弹层
    myCodeList: [], // 我的抽奖码列表
    imgUrl: '../../images/shareImg.png',
    productImg: 'http://images.zunyuapp.cn/resource/prize/74d0bc0b882ec38e4b8fbfd00d4bb014.jpg',
    follow: false, // 关注公众号弹层 显示隐藏
    noCode: true, // 默认没有抽奖码
    id: null, // 活动id
    shareUid: '', // 分享或公众号进入标志
    shareTime: '', // 分享活动的链接 过期时间
    public_icon: [{
      img: null
    }], // 关注公众号图片
    sign: '', // 从已结束页面跳转来
    friendHelp: [],
    winningList: [], //中奖名单 
    winningBol: false, //中奖名单 弹层
    numStep: false, //抽奖步数不足弹框
    botList: [], //bot
    rankPage: 1 // 排行榜分页
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    //初始化时间戳
    this.setData({
      shareTime: Number(this.makeTimestamp()) + 86400000
    })
    wx.setStorageSync('shareTime', Number(this.makeTimestamp()) + 86400000)
    //  通过小程序码进行
    if (options.scene) {
      var scene = decodeURIComponent(options.scene);
      var sceneArr = scene.split(',');
      this.setData({
        id: sceneArr[0],
      });
      wx.setStorageSync('shareUid', sceneArr[1]);
      wx.setStorageSync('shareTime', sceneArr[2]);
    }
    // 活动id
    if (options.id) {
      this.setData({
        id: options.id // 分享或公众号进入
      });
    }
    if (options.q) { //兼容公众号进入
      let link = decodeURIComponent(options.q);
      let id = link.split('=')[1];
      this.setData({
        id: options.id
      });
    }
    // 活动结束
    if (options.sign) {
      this.setData({
        sign: options.sign == '2' ? 'over' : ''
      });
    }
    if (options.q) {
      let link = decodeURIComponent(options.q);
      let sign = link.split('=')[1];
      this.setData({
        sign: options.sign
      });
    }
    if (options.share) {
      wx.setStorageSync('shareUid', options.share);
    }
    if (options.q) { //兼容公众号进入
      let link = decodeURIComponent(options.q);
      let share = link.split('=')[1];
      wx.setStorageSync('shareUid', options.share);
    }
    if (options.timestamp) {
      wx.setStorageSync('shareTime', options.timestamp);
    }
    if (options.q) { //兼容公众号进入
      let link = decodeURIComponent(options.q);
      let timestamp = link.split('=')[1];
      wx.setStorageSync('shareTime', options.timestamp);
    }
    this.setData({
      shareUid: wx.getStorageSync('shareUid'),
      shareTime: wx.getStorageSync('shareTime')
    });
    this.getDetail();
    this.fromPublic(); // 从公众号进入 
  },
  getDetail: function() {
    var that = this;
    var str = 'code[0].close_share_bth';
    that.setData({
      [str]: wx.getStorageSync('close_share_button')
    });
    // 获取活动内容详情
    utils.http.itemPost('activity/getActivityDetail', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      id: that.data.id
    }).then(r => {
      console.log(r)
      // 进入页面时 参与状态
      wx.setStorageSync('status', r.status);
      // 标题文字过长处理
      if (r.title.length > 30) {
        r.title = r.title.slice(0, 28) + '...'
      }
      var pub_img = 'public_icon[0].img';
      that.setData({
        detail: r,
        [pub_img]: r.public_icon
      });
      if (r.number.length != 0) {
        that.setData({
          noCode: false,
        });
      }
      for (var i = 0; i < r.number.length; i++) {
        that.data.myCodeList.push({
          code: r.number[i].number,
        });
        that.setData({
          myCodeList: that.data.myCodeList
        });
      }
      // 获取该活动下抽奖码排行榜
      that.getRanking();
      //助力好友
      that._friendHelpList()
    });
  },
  // 获取该活动下抽奖码排行榜
  getRanking: function(sign) {
    var that = this;
    utils.http.itemPost('activity/getRanking', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      id: that.data.id,
      page: that.data.rankPage,
      size: 10,
    }).then(r => {
      if (r.list != '') {
        if (sign == 'loading') { // 排行榜下拉加载
          var oldList = that.data.rankList;
          var newList = r.list;
          for (var i = 0; i < newList.length; i++) {
            // 给对象动态添加属性
            var obj = newList[i];
            var key = 'ranking';
            obj[key] = oldList.length + i + 1;
            if (newList[i].nickname != null) {
              if (newList[i].nickname.length > 4) {
                newList[i].nickname = newList[i].nickname.slice(0, 3) + '*';
              }
            }
          }
          that.setData({
            rankList: oldList.concat(newList),
            num: r.count
          });
        } else {
          var temp = []
          temp[0] = r.bot
          var tempRank = temp.concat(r.list);
          for (var i = 0; i < tempRank.length; i++) {
            // 给对象动态添加属性
            var obj = tempRank[i];
            var key = 'ranking';
            obj[key] = i + 1;
            if (tempRank[i].nickname != null) {
              if (tempRank[i].nickname.length > 5) {
                tempRank[i].nickname = tempRank[i].nickname.slice(0, 4) + '*';
              }
            }
          }
          that.setData({
            rankList: tempRank,
            num: r.count
          });
        }
        that.setData({
          rankPage: that.data.rankPage + 1
        });

      }
    });
  },
  // 从公众号进入
  fromPublic: function() {
    var that = this;
    if (wx.getStorageSync('status')) { // 已参与过活动
      if (this.data.shareUid == 'FromPublic') { // 用户从公众号进入
        if (wx.getStorageSync(utils.conf.storage.token)) { // 已授权
          utils.http.itemPost('activity/fromPublic', {
            access_token: wx.getStorageSync(utils.conf.storage.token),
            id: that.data.id
          }).then(r => {
            if (r.status == 'success') {
              //  直接获得两个抽奖码
              wx.showModal({
                title: '公众号特权礼包',
                content: '获得抽奖码×2！',
                confirmText: '知道了',
                showCancel: false,
                success: function(res) {
                  wx.setStorageSync('shareUid', '')
                  //  重新获取活动信息
                  that.getDetail();
                }
              });
            }
          });
        }
      }
    }
  },
  //查看中奖名单 
  checkList: function() {
    utils.http.itemPost('activity/getPrizeRecord', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      id: this.data.id,
    }).then(r => {
      var temp = r;
      for (var i = 0; i < r.length; i++) {
        if (temp[i].nickname != null) {
          if (temp[i].nickname.length >= 3) {
            temp[i].nickname = temp[i].nickname.slice(0, 2) + '*';
          }
        }
      }
      this.setData({
        winningList: temp,
        winningBol: true
      });
    });
  },
  // 关闭中奖名单 弹层
  closeWin: function() {
    this.setData({
      winningBol: false
    });
  },
  //好友助力列表
  _friendHelpList: function() {
    var that = this
    utils.http.itemPost('activity/getShareRecord', {
      access_token: wx.getStorageSync(utils.conf.storage.token) ? wx.getStorageSync(utils.conf.storage.token) : '',
      id: that.data.id
    }).then(r => {
      that.setData({
        friendHelp: this.makeList(r)
      })
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
  onHide: function() {},

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
  onShareAppMessage: function(e) {
    if (e.from == 'button' && e.target.dataset.pin == "pinbu") {
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
    }

    return {
      title: '人品已攒够，就差你的神助攻了！',
      path: '/pages/index/index?id=' + this.data.detail.id + '&share=' + wx.getStorageSync('userinfo').uid + '&timestamp=' + Number(this.makeTimestamp()) + 86400000,
      imageUrl: this.data.detail.picture,
      success: function(res) {
        wx.showToast({
          title: '分享成功',
          icon: 'success'
        });

      },
      fail: function(res) {
        wx.showToast({
          title: '未分享',
          icon: 'none'
        });
      }
    }
  },
  // 我的抽奖码
  myCode: function() {
    this.setData({
      myCode: true
    });
  },
  // 关闭我的抽奖码
  closeCode: function() {
    this.setData({
      myCode: false
    });
  },
  // 展开活动说明
  spread: function() {
    this.setData({
      spread: !this.data.spread
    });
  },
  // 点击抽奖
  luck_draw: function(e) {
    var that = this;
    if (e.detail.userInfo) { // 授权成功
      if (wx.getStorageSync(utils.conf.storage.token)) { // 获取过
        that._join(); //参与抽奖
      } else {
        utils.user.info('user/getUserInfo', that.data.shareUid).then(r => {
          wx.hideLoading();
          wx.setStorageSync('userinfo', r);
          that.getDetail();
          that.fromPublic(); // 从公众号进入 
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
  _join: function() {
    var that = this;
    //判断步数
    if (Number(wx.getStorageSync('userinfo')).step < Number(that.data.detail.need_step)) {
      // wx.showToast({
      //   title: '您的步数不足!',
      //   image: '../../images/x.png',
      //   duration: 2000
      // });
      that.setData({
        numStep: true
      })

      return
    }

    //  请求参与接口
    utils.http.itemPost('activity/ginsengActivity', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      id: that.data.id,
      share_uid: that.data.shareUid == '' ? wx.getStorageSync('shareUid') : that.data.shareUid,
      share_time: that.data.shareTime == '' ? Number(wx.getStorageSync(shareTime)) : that.data.shareTime
    }).then(r => {
      if (r.status == 'error') {
        that.setData({
          numStep: true
        })
        // wx.showToast({
        //   title: r.message,
        //   icon: 'none'
        // });
        that.getDetail();
      } else {
        if (r.number.length != 0) {
          var temp = that.data.code;
          temp[0].codeList = [];
          for (var i = 0; i < r.number.length; i++) {
            temp[0].codeList.push({
              code: r.number[i]
            });
          }
          that.setData({
            code: temp,
            status: '0'
          });
          // 参与成功后更新页面
          if (wx.getStorageSync('shareUid')) {
            wx.removeStorageSync('shareUid');
            wx.removeStorageSync('shareTime');
          }
          that.setData({
            rankPage: 1
          })
          that.getDetail();
          wx.setStorageSync('aid', that.data.id); // 存储当前活动id
          wx.setStorageSync('astatus', true); // 存储当前活动参加状态
        }
      }
    }).catch(fail => {
      // access_token过期  重新获取
      utils.user.info('user/getUserInfo', that.data.shareUid).then(r => {
        wx.hideLoading();
        wx.setStorageSync('userinfo', r);
        that._join();
      });
    });
  },
  // 已参与，提升中奖率
  promote: function(e) {
    if (wx.getStorageSync('close_share_btn') == false) { // 开启
      this.setData({
        status: '1'
      });
    }
  },
  // 关闭弹层
  closeShare: function() {
    this.setData({
      status: null
    });
  },
  //  关注公众号
  follow: function(e) {
    this.setData({
      status: null,
      follow: true
    });
  },
  closeFollow: function() {
    this.setData({
      follow: false
    });
  },
  // 转发给好友
  share: function(e) {
    this.setData({
      shareType: false,
      status: null
    });
  },
  // 取消 分享
  cancel: function() {
    this.setData({
      shareType: true
    });
  },
  // 生成分享图片
  share_image: function(e) {
    var time = this.data.detail.end_time;
    var aType;
    if (this.data.detail.is_auto == "1") {
      aType = "自动开奖";
    } else {
      aType = "手动开奖";
    }
    var info = time + ' ' + aType;
    var title = this.data.detail.title;
    if (title.length > 11) {
      title = title.slice(0, 11) + '...';
    }
    // title = '活动：' + title;
    wx.navigateTo({
      url: '../generateImg/generateImg?aImg=' + this.data.detail.picture + '&aid=' + this.data.detail.id + '&info=' + info + '&title=' + title + '&uid=' + wx.getStorageSync('userinfo').uid,
    });
  },
  // 用于发 模板消息
  formSubmit: function(e) {
    if (wx.getStorageSync(utils.conf.storage.token)) {
      utils.http.basePost('user/setFromId', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
        formId: e.detail.formId,
        aid: e.detail.target.dataset.id,
        type: 'activity_change'
      });
    }
  },
  // 排行榜分页
  tolower: function(e) {
    this.getRanking('loading');
  },
  //抽奖问题
  question: function() {
    wx.navigateTo({
      url: '/pages/lotteryProblem/lotteryProblem',
    })
  },
  //邀请好友助力
  buttonHelp: function() {

  },
  //添加排行名次、昵称长度处理
  makeList: function(temp) {
    for (let i = 0; i < temp.length; i++) {
      var key = "rankNum";
      var value = i + 1;
      temp[i][key] = value;
      if (temp[i].nickname != null) {
        if (temp[i].nickname.length > 3) {
          temp[i].nickname = temp[i].nickname.slice(0, 2) + '*'
        }
      }
    }
    return temp;
  },
  //关闭抽奖步数不足提示
  stepClose: function() {
    this.setData({
      numStep: false
    })
  },
  //生成时间戳
  makeTimestamp: function() {
    var nowTime = new Date();
    var month = ((nowTime.getMonth() + 1) < 10 ? ('0' + (nowTime.getMonth() + 1)) : (nowTime.getMonth() + 1));
    var day = (nowTime.getDate() < 10 ? ('0' + nowTime.getDate()) : nowTime.getDate());
    var h = nowTime.getHours() < 10 ? ('0' + nowTime.getHours()) : nowTime.getHours();
    var min = nowTime.getMinutes() < 10 ? ('0' + nowTime.getMinutes()) : nowTime.getMinutes();
    var s = nowTime.getSeconds() < 10 ? ('0' + nowTime.getSeconds()) : nowTime.getSeconds();
    var nowDate = nowTime.getFullYear() + '/' + month + '/' + day + ' ' + h + ':' + min + ':' + s;
    var timestamp = new Date(nowDate).getTime();
    return timestamp
  }
});