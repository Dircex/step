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
      problems: [
        {
          "title": "1.抽奖是如何设计公平公正的抽奖规则？",
          "about": "抽奖根据福彩时时彩或上证收盘指数为计算依据，并算出抽奖号码"
        },
        {
          "title": "2.怎么增加自己的中奖概率？",
          "about": "邀请好友参与，好友通过链接进入获得并参与抽奖，每位好友可增加1个抽奖码；关注公众号进入抽奖活动可获得2个抽奖码"
        },
        {
          "title": "3.我已经关注了公众号为什么没有额外获得抽奖码？",
          "about": "已关注公众号，需要从公众号菜单栏“步步抽奖”进入小程序，才能识别给您新增抽奖码"
        },
        {
          "title": "4.中奖后怎么办？",
          "about": "收到中奖提醒后，请在24小时内绑定手机并在“我的”—“收货地址”填写个人信息，超过时间信息不完善可能会被取消资格"
        },
        {
          "title": "5.为什么抽奖码会减少？",
          "about": "为了保证公平我们会排查小号刷码的情况，发现后会删除对应的抽奖码"
        },
        {
          "title": "6.为什么找不到公众号？",
          "about": "请根据抽奖情况，不是所有的抽奖都会有公众号"
        },
      ]
    })
  },
  onLoad: function (options) {
    this._init();
  },
  bindtap: function (e) {
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