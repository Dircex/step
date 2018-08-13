//index.js
//获取应用实例
const app = getApp()
const utils = app.utils;
var timer = null
var timer1 = null
var timer2 = null
var tempPhone = '';
var fir = 19, sec = 21, thr = 23; // 秒杀活动时间
Page({

  /**
   * 页面的初始数据
   */
  data: {
    stepNumber: 0, // 总步数
    daily: null, // 签到奖励 
    myStep: 0, // 我的步数
    friendStep: 0, // 好友赞助
    imgUrls: [], // 轮播图列表
    giftList: [], //礼品列表
    dailyBol: false, // 签到按钮，默认未签到
    confirm: false, //确认信息弹层
    signin: false, // 签到成功弹窗
    signinData: [], // 签到成功弹层数据
    ruleDec: false, // 规则说明
    ruleDecData: [{
      detail: [{
        title: '规则说明',
        data: ['1. "我的步数"每日有效步数为30000步（如果您当日走了60000步，小程序只认定30000步有效）', '2. "好友赞助"步数每日没有上限，全部计入总步数', '3. 每日总步数可直接兑换礼品，如果没有兑换次日0点会转换为步步币给您', '4. 每10000步=10步步币（不满10000步不予转换，可转赠给好友拼步）']
      }, {
        title: '违规说明',
        data: ['步步赢礼提倡健康运动！', '为了保障公平的兑换环境，您在使用步步赢礼过程中如有违规获取步数的行为，步步赢礼有权判定您的部分或所有兑换无效，并对您做出暂时或永久性的封号。', '情节严重者将移交有关部门给与处罚。', '违规行为包括但不限于：使用摇步器、外挂程序、宠物代步……']
      }]
    }], // 规则
    loginBol: null, //是否登录，默认登录
    userinfo: null,
    bot: '', // 波浪bottom
    options: {},
    curGoodId: '', //当前兑换的商品id
    exInfo: {}, //是否可兑换信息
    showShare: wx.getStorageSync('close_share_button'), // 
    sta: 'load',
    advFlag: false, //广告弹窗
    advFirst: true, //广告首次弹出
    advRandom: 0, //广告随机数
    loadOk: false, //页面加载完成
    numStep: false, //兑换步数不足弹框
    numStepInfo: {}, //兑换步数不足显示info
    id: "", //活动id
    checkUserPhoneFlag: null, //检查用户是否绑定手机
    confirmBandPhone: false, //绑定手机弹层
    sencods: 60, //验证码倒计时
    sencodsFlag: false, //验证码倒计时隐藏
    tips: true, //绑定手机提示信息
    tipsCenter: false, //绑定手机提示信息center
    phoneTips: false, //验证正则错误提示
    codeTips: false, //验证正则错误提示

    ///////////
    // DQH ++//
    ///////////
    timechange: [
      { type: 0, time: 19, showtime: 0},
      { type: 0, time: 20, showtime: 0},
      { type: 0, time: 23, showtime: 0}
    ], // 步数限时秒杀

    timeEnd: {}, // 步数秒杀倒计时
    timeEndkey: 1, // 秒杀是否在时间内 
    timestart: 0, // 秒杀活动是否开启
    clickshow: false,

    allchangeList: [{}], // 所有秒杀列表
    changesList: [], // 步数秒杀展示列表   

    callFriends: '', // 邀请好友
    awardkey: false, // 每日领奖
    index: '',
    showChangeList: 1,
    arr: [],
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      options: options
    })
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
    // wx.showLoading({
    //   title: '登录中',
    //   success: function() {}
    // });
  },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    var that = this
    // 更新步数
    // if (wx.getStorageSync(utils.conf.storage.token)) { // 如果授权 
    //   this.setData({
    //     loginBol: true
    //   })
    // }
    // if (wx.getStorageSync(utils.conf.storage.token).length==0) { // 如果授权 
    // }
    this.auth() // 登录
    //广告弹窗处理
    if (that.data.advFirst) {
      timer2 = setInterval(function() {
        if (that.data.advFirst && that.data.loadOk) {
          that.showAdv()
        }
      }, 3000)
    }
    that.gettimeEnd();
    that.gettime = setInterval(that.gettimeEnd, 1000);
    // console.log(wx.getStorageSync(utils.conf.storage.token))
    that.AdvertisinTask()
    that._secondsdata(that.data.index, 'showone'); // 获取秒杀列表
  },
  // 领奖 
  AdvertisinTask: function () {
    var that = this;
    utils.http.itemPost('step/receiveTime', {   // 是否可领奖
      access_token: wx.getStorageSync(utils.conf.storage.token),
    }).then(r => {
      // console.log(r)
      if (r.type == 1) {
        wx.setStorageSync('awardkey', true)
        // console.log(1)
        this.setData({
          awardkey: wx.getStorageSync('awardkey'),
        })
      } else if (r.type == 2) {
        var nowTime = new Date().getTime() / 1000
        var end_receive = new Date(r.end_time).getTime() / 1000
        // console.log(nowTime - end_receive)
        if (nowTime > end_receive) {
          wx.setStorageSync('awardkey', true)
        } else {
          wx.setStorageSync('awardkey', false)
        }
        this.setData({
          awardkey: wx.getStorageSync('awardkey'),
        })
      }
    })
  },
  // 步数秒杀 倒计时
  gettimeEnd: function() {
    var that = this;
    var now = new Date();
    var nowday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    var seconds = Math.floor((now.getTime() - nowday.getTime()) / 1000);
    var f = fir * 3600, g = sec * 3600, h = thr * 3600;
    var second = 0;
    if (seconds >= f && seconds < g) {
      second = f + (sec - fir)*3600 - seconds;
    } else if (seconds >= g && seconds < h) {
      second = g + (thr - sec)*3600 - seconds;
    } else if (seconds >= h) {
      second = h + (24 - thr)*3600 - seconds;
    }
    that.time(second);
    that.strTime()
  },
  time: function (second) {
    var that = this;
    if (that.data.arr[0] == 3 && that.data.arr[1] == 2) {
      that.setData({
        timeEndkey: 2
      })
    } else {
      if (second > 0) {
        var a = that.checkTime(second % 60);
        var b = that.checkTime(((second - a) / 60) % 60);
        var c = that.checkTime((second - a - 60 * b) / 3600);
        that.setData({
          timeEnd: { c: c, b: b, a: a },
          timeEndkey: 1
        })
      } else {
        that.setData({
          timeEndkey: 0
        })
      }
    } 
  },
  checkTime: function (n) {
    return n >= 0 && n < 10 ? '0' + n : '' + n;
  },
  strTime: function() {
    var that = this;
      var now = new Date().getHours();
      for (var i = 0; i < that.data.timechange.length; i++) {
        if (now >= fir && now < sec) {
          if (!that.data.arr[1]) {
            that.setthisdata(1, 0, 0, 1);
          } else {
            that.setthisdata(2, 0, 0, 1);
          }
        } else if (now >= sec && now < thr) {
          if (!that.data.arr[1]) {
            that.setthisdata(2, 1, 0, 2);
          } else {
            that.setthisdata(2, 2, 0, 2);
          }
        } else if (now >= thr) {
          if (!that.data.arr[1]) {
            that.setthisdata(2, 2, 1, 3);
          } else {
            that.setthisdata(2, 2, 2, 3);
          }
        } else {
          that.setthisdata();
        }
      }
  },
  // 设置状态 以及显示列表
  setthisdata: function (a,b,c,d) {
    var that = this;
    for (var i = 0; i < that.data.timechange.length; i++) {    
      var strTime = 'timechange[' + i + '].type', strTime1 = 'timechange[0].type', strTime2 = 'timechange[1].type', strTime3 = 'timechange[2].type', strarr = 'timechange[' + that.data.arr[0] + '].type';
      if (d) {
        that.setData({
          [strTime1]: a,
          [strTime2]: b,
          [strTime3]: c,
          index: d,
        })
      } else {
        var strShow = 'timechange[0].showtime';
        that.setData({
          [strTime]: 0,
          index: 1,
          showChangeList: 0,
          [strShow]: 1
        })
        clearInterval(that.gettime)
      }
    }
  },  
  // 步数秒杀 列表切换
  TimeChangeShow: function(e) {
    var that = this;
    var showindex = Number(e.currentTarget.dataset.text)
    that._secondsdata(showindex + 1);
    that.setData({
      showChangeList: e.currentTarget.dataset.type,
    })
    for (var i = 0; i < that.data.timechange.length; i++) {
      var strTime = 'timechange[' + i + '].showtime';
      that.setData({
        [strTime]: 0
      })
    }
    var strShow = 'timechange[' + showindex + '].showtime';
    that.setData({
      [strShow]: 1,
      clickshow: true
    })
  },
  // 获取每日步数秒杀商品
  _secondsdata(a,b) {
    let that = this;
    utils.http.itemPost('step/getSecondGoods', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
      type: a
    }).then(r => {
      if (b) {
        var num_stock = 0;
        for (var i in r) {
          num_stock += Number(r[i].stock)
        }
        if (num_stock > 0) {
          that.setData({
            changesList: r,
          })
        } else {
          if (a==3) {
            // that._secondsdata(1);
            that.setData({
              changesList: r,
              showChangeList: 2,
              timeEndkey: 2,
              arr: [a, 2]
            })
          } else {
            var strinchan = 'timechange[' + a + '].type'
            that._secondsdata(a + 1);
            that.setData({
              showChangeList: 0,
              timestart: 1,
              arr: [a,2]
            })
          }      
        }
      } else {
        that.setData({
          changesList: r,
        })
      }
    }).catch(r => {
      console.log('秒杀列表')
      wx.showModal({
        title: '提示',
        content: '服务器异常，请稍后再试！',
        showCancel: false
      })
    })
  },
  // 提醒秒杀开始
  remind_ms: function() {
    wx.showModal({
      title: '提醒设置',
      content: '设置成功',
    })
  },
  // 每日领取
  award: function() {
    wx.navigateTo({
      url: "../AdvertisingTasks/AdvertisingTasks"
    });
  },
  // 登录
  login: function(e) {
    wx.showLoading({
      title: '登录中',
      success: function() {}
    });
    let that = this;
    if (e.detail.userInfo) {
      if (wx.getStorageSync(utils.conf.storage.token)) { // 已获取access_token
        // 获取微信运动信息
        that.runData();
        that._secondsdata(that.data.index, 'showone'); // 获取秒杀列表
        that.AdvertisinTask() // 是否可领奖
      } else {
        // 获取 access_token
        that.auth();
      }
    } else {
      wx.showModal({
        title: '提示',
        content: '该小程序需要授权才能更好的使用！',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
            wx.openSetting({})
          } else if (res.cancel) {
            console.log('用户点击取消')
            return;
          }
        }
      })
    }
  },
  auth: function(sign) { // 授权登录 
    var that = this;
    let obj = that.data.options ? that.data.options : {};
    // 登录
    utils.user.info('user/getUserInfo', obj).then(r => {
      // console.log( r)
      wx.hideLoading();
      wx.setStorageSync('userinfo', r)
      that.setData({
        daily: r.sign_get_gold,
        dailyBol: true
      })
      // 签到是否显示
      let date = new Date();
      let nowDate = date.getFullYear() + '-' + ((date.getMonth() + 1) < 10 ? ('0' + (date.getMonth() + 1)) : (date.getMonth() + 1)) + '-' + (date.getDate() < 10 ? ('0' + date.getDate()) : date.getDate());
      if (r.signed_time) {
        let lastSign = r.signed_time.split(' ')[0];
        if (lastSign == nowDate) { // 上次签到日期==当前日期
          // 签到不显示 
          that.setData({
            dailyBol: false
          })
        }
      }
      // 获取运动信息
      that.runData(sign) 
      that._secondsdata(that.data.index, 'showone'); // 获取秒杀列表
      that.AdvertisinTask() // 是否可领奖
    }) 
  },
  // 获取轮播图+商品列表
  _pagedata() {
    let that = this;
    utils.http.itemPost('step/getBannerList', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
    }).then(r => {
      that.setData({
        imgUrls: r
      })
      // 获取商品列表
      return utils.http.itemPost('step/getGoodsList', {
        access_token: wx.getStorageSync(utils.conf.storage.token),
      })
    }).then(r => {
      // console.log(r.goods)
      if (r.goods.length != 0) {
        let temp = r.goods[0].list;
        let temparr = []
        for (var i in temp) {
          temp[i].buy_price = Number(temp[i].buy_price)
          let key = 'step';
          let value = temp[i].buy_price / 10000 + '万步'
          temp[i][key] = value
        }
        that.setData({
          giftList: temp,
          exInfo: r.userinfo
        })
      }
    }).catch(r => {
      console.log(1);
      wx.showModal({
        title: '提示',
        content: '服务器异常，请稍后再试！',
        showCancel: false
      })
    })
  },

  // 微信运动 
  runData: function(sign) {
    var that = this;
    // console.log('--------runData--------',wx.getWeRunData)
    if (wx.getWeRunData) {
      wx.getWeRunData({
        success(res) {
          wx.login({
            success: function(r) {
              // 获取微信步数
              utils.http.itemPost('step/setUserStep', {
                access_token: wx.getStorageSync(utils.conf.storage.token),
                code: r.code,
                item: utils.conf.request.item,
                encryptedData: res.encryptedData,
                iv: res.iv
              }).then(data => {
                wx.hideLoading();
                that.setData({
                  stepNumber: data.step_total, // 总步数
                  myStep: data.step, // 我的步数
                  friendStep: Number(data.step_total) - Number(data.step), // 好友赞助
                  loginBol: true,
                  loadOk: true
                })
                // 波浪显示高度
                that.wave();
                if (sign != 'refresh') { // 不是刷新请求
                  if (that.data.options.uid) { // 分享进入
                    if (that.data.options.uid != wx.getStorageSync('userinfo').uid) { // 不是我本人打开 
                      if (that.data.sta == 'load') { // load,不是show
                        that.setData({
                          sta: 'show'
                        })
                        if (!that.data.options.mold) {
                          wx.navigateTo({
                            url: '../present/present?uid=' + that.data.options.uid,
                          })
                        }
                      }
                    }
                  }
                  if (that.data.options.id) { // 分享抽奖进入
                    if (that.data.options.share != wx.getStorageSync('userinfo').uid) { // 不是我本人打开 
                      if (that.data.sta == 'load') { // load,不是show
                        that.setData({
                          sta: 'show'
                        })
                        wx.navigateTo({
                          url: '../lotteryDetail/lotteryDetail?id=' + that.data.options.id + '&share=' + that.data.options.share + ' &timestamp=' + wx.getStorageSync('shareTime')
                        })
                      }
                    }
                  }
                  if (wx.getStorageSync('shareUid') == 'FromPublic') { //公众号进入
                    if (that.data.sta == 'load') { // load,不是show
                      that.setData({
                        sta: 'show'
                      })
                      wx.switchTab({
                        url: '../lottery/lottery'
                      })
                    }
                  }
                }
                wx.hideNavigationBarLoading(); // 隐藏顶部导航栏加载状态 
                wx.stopPullDownRefresh(); // 刷新完成后停止刷新
                that._pagedata(); // 获取轮播图+商品列表
              }).catch(r => {
                console.log(1);
                wx.showModal({
                  title: '提示',
                  content: '服务器异常，请稍后再试！',
                  showCancel: false
                })
              })
            }
          })
        },
        fail: function(fail) {
          wx.showModal({
            title: '提示',
            content: '小程序未能获得您的运动信息，需要您在微信中开启"微信运动"功能并在小程序授权微信运动步数！',
            success: function(res) {
              if (res.confirm) {
                // console.log('用户点击确定')
                wx.openSetting({})
              } else if (res.cancel) {
                // console.log('用户点击取消')
                return;
              }
            }
          })
        }
      })
    } else {
      // 不支持微信运动
      wx.showModal({
        title: '提示',
        content: '当前版本暂不支持微信运动！',
        showCancel: false
      })
    }
  },
  // 波浪显示高度
  wave: function() {
    var that = this;
    let query = wx.createSelectorQuery();
    query.select('.ballBox').boundingClientRect();
    query.exec(function(res) {
      // console.log(res)
      let total = res[0].height + 20;
      that.setData({
        bot: (that.data.myStep / 30000 * total) + (-total)
      })
    });
  },
  // 签到
  daily: function() {
    if (wx.getStorageSync(utils.conf.storage.token)) {
      utils.http.itemPost('step/todaySign', {
        access_token: wx.getStorageSync(utils.conf.storage.token)
      }).then(r => {
        this.setData({
          signinData: [{
            money: r.get_way, // 今日得
            tom: r.tomorrow, // 明日签到可获得
            checked: true, //提醒签到默认选中
          }],
          signin: true // 签成功弹层
        })
      }).catch(r => {
        console.log(1);

        wx.showModal({
          title: '提示',
          content: '服务器异常，请稍后再试！',
          showCancel: false
        })
      })
    } else {
      wx.showToast({
        title: '登录签到!',
        icon: 'none',
        duration: 1000
      });
    }
  },
  // 提醒签到
  remind: function() {
    let checked = 'signinData[0].checked'
    this.setData({
      [checked]: !this.data.signinData[0].checked
    })
  },
  // 签到完成
  signin_com: function() {
    this.setData({
      signin: false,
      dailyBol: false
    })
  },
  // 分享打卡
  share: function() {
    if (wx.getStorageSync(utils.conf.storage.token)) {
      wx.navigateTo({
        url: '../punch/punch',
      })
    } else {
      wx.showToast({
        title: '登录打卡!',
        icon: 'none',
        duration: 1000
      });
    }
  },
  // 规则说明 
  clickRule: function(e) {
    this.setData({
      ruleDec: true
    })
  },
  // 关闭弹层
  ruleClose: function() {
    this.setData({
      ruleDec: false
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
  // 发送模板消息
  formSubmit: function(e) {
    if (e.detail.formId != 'the formId is a mock one') {
      if (e.currentTarget.dataset.type == "exchange") { // 兑换奖品
        utils.http.itemPost('step/setFromId', {
          access_token: wx.getStorageSync(utils.conf.storage.token),
          type: 'goods', // 
          from_id: e.detail.formId,
          gid: this.data.curGoodId
        })
      } else if (e.currentTarget.dataset.type == "sign") { // 签到
        this.setData({
          signin: false, // 关闭签到成功弹层
          dailyBol: false, // 隐藏签到按钮
        })
        if (this.data.signinData[0].checked) { // 选中提醒
          //  发送模板消息
          utils.http.itemPost('step/setFromId', {
            access_token: wx.getStorageSync(utils.conf.storage.token),
            type: 'sign', // 签到
            from_id: e.detail.formId,
          })
        }
      } else if (e.currentTarget.dataset.type == 'ms') {
        utils.http.itemPost('step/setFromId', {
          access_token: wx.getStorageSync(utils.conf.storage.token),
          type: 'ms', // 秒杀
          from_id: e.detail.formId,
          gid: e.currentTarget.dataset.text+1
        })
      }
    }
  },
  // 立即兑换
  exchange: function(e) {
    clearInterval(timer1)
    if (this.data.showChangeList == 2) {
      wx.showToast({
        title: '活动已结束，明天再来吧',
        duration: 2000,
        icon: 'none'
      })
    } else {
      if (e.currentTarget.dataset.type==0) {
        wx.showToast({
          title: '商品已抢光',
          duration: 2000,
          icon: 'none'
        })
      } else {
        if (e.currentTarget.dataset.status == 'true') {
          // console.log(typeof this.data.exInfo.step_total)
          // console.log(this.data.exInfo.step_total)
          // console.log(typeof e.currentTarget.dataset.step)
          // console.log(e.currentTarget.dataset.step)
          if ((Number(this.data.exInfo.step_total) < Number(e.currentTarget.dataset.step)) || Number(e.currentTarget.dataset.show_stock) < 0) {
            this.setData({
              numStep: true,
              numStepInfo: {
                'title': e.currentTarget.dataset.title,
                'step': (Number(e.currentTarget.dataset.step) > 10000) ? Number(e.currentTarget.dataset.step) / 10000 + '万步' : Number(e.currentTarget.dataset.step) + '步',
                'img': e.currentTarget.dataset.img,
                'myStep': (this.data.myStep > 10000) ? this.data.myStep / 10000 + '万步' : +this.data.myStep + '步'
              }
            })
          } else {
            //检查用户是否绑定手机
            utils.http.itemPost('step/checkUserPhone', {
              access_token: wx.getStorageSync(utils.conf.storage.token)
            }).then(r => {
              console.log('--then--', r)
              if (r.message == "未绑定") {
                //未绑定弹出绑定框
                this.setData({
                  confirmBandPhone: true
                });
              } else {
                //已绑定显示选择地址兑换框
                this.setData({
                  curGoodId: e.currentTarget.dataset.id,
                  confirm: true
                })
              }
            }).catch(r => {
              console.log(1)
              wx.showModal({
                title: '提示',
                content: r.note,
                showCancel: false
              })
            })
          }
        }
      }
    }
  },
  // 确认兑换
  exchange_com: function() {
    let that = this;
    utils.http.itemPost('user/checkAddress', {
      access_token: wx.getStorageSync(utils.conf.storage.token),
    }).then(r => {
      if (r == true) {
        this._dh();
      } else { // 没有收货地址
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
                  that._dh();
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
      }
    })

  },
  //关闭兑换不足提示
  stepClose: function() {
    this.setData({
      numStep: false,
      advFlag: false
    })
  },
  _dh: function() {
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
        // 更新步数
        this.runData();
        // this.setData({

        // })
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
  // 点击轮播图
  detail: function(e) {
    if (e.currentTarget.dataset.type == '2') { // 弹层
      wx.showModal({
        title: '提示',
        content: e.currentTarget.dataset.path,
        showCancel: false
      })
    } else if (e.currentTarget.dataset.type == '1') { // 跳转赚步攻略
      if (e.currentTarget.dataset.path == '../lottery/lottery') {
        wx.switchTab({
          url: e.currentTarget.dataset.path,
        })
      } else {
        wx.navigateTo({
          url: e.currentTarget.dataset.path,
        })
      }
    }
  },
  //判断是否首次登陆
  isFirstLogin: function() {
    let lastimestr = wx.getStorageSync('userinfo').last_login_time.split(" ")[0].split('-').join('/')
    let now = new Date().getDate()
    if (now != new Date(lastimestr).getDate()) {
      return true
    } else {
      return false
    }
  },
  //首次登陆弹框随机广告advFlag
  showAdv: function() {
    var that = this
    if (this.isFirstLogin()) {
      that.setData({
        advFlag: true,
        advFirst: false,
        advRandom: Math.round(Math.random() * 10) % 4
      })
      clearInterval(timer2);
    } else {
      clearInterval(timer2);
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
    // clearInterval(timer);
    clearInterval(timer2);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    // clearInterval(timer);
    clearInterval(timer2);
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {
    wx.showNavigationBarLoading(); //显示顶部导航栏加载状态
    // 重新请求步数

    this.auth('refresh');

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
  inputCode: function(str) {
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