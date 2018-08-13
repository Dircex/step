Page({

  /**
   * 页面的初始数据
   */
  data: {
    problems: [],
    active: null,
  },
  //初始化方法
  _init() {
    this.setData({
      problems: [{
          "title": "1. 为什么显示微信步数获取失败，获取不到步数？",
          "about": ['① 检查手机是否支持微信运动；', '② 检查微信运动是否已授权，如未授权去微信运动授权；', '③ 如仍未解决，请退回微信点击“发现”—“小程序”找到步步赢礼删除，然后搜索步步赢礼重新进入']
        },
        {
          "title": "2. 我邀请了好友，为什么没有获得步步币？",
          "about": ['a. 你邀请的好友不是新用户', 'b. 为规避作弊行为，系统判定你的邀请非有效邀请']
        },
        {
          "title": "3. 步步币有什么作用？",
          "about": ['步步币不支持提现，但可以用于平台礼品兑换']
        },
        {
          "title": "4. 特权礼品怎么兑换？",
          "about": ['a. 7日特权礼品每连续签到7天可以兑换一次', 'b. 30日签到礼品每连续签到30天可以兑换一次','c. 分享特权礼品近7天内邀请达20个用户即可每日兑换一次礼品']
        },
        {
          "title": "5. 兑换礼品什么时间发货呢？",
          "about": ['我们会根据兑换记录在7个工作日内依次发放礼品']
        },
        {
          "title": "6、兑换礼品的地址可以修改吗？",
          "about": ['礼品兑换后在等待发货中的是可以修改地址的，发货后不支持修改地址，不支持多个地址同时发货。']
        },
        {
          "title": "7、礼品支持退换吗？",
          "about": ['兑换后不支持退换处理']
        },
      ]
    })
  },
  onLoad: function(options) {
    this._init();
  },
  bindtap: function(e) {
    if (this.data.active == e.currentTarget.dataset.id) {
      this.setData({
        active: null
      });
    } else {

      this.setData({
        active: e.currentTarget.dataset.id
      });
    }
  }
})