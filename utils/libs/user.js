//载入核心处理文件
import tools from '../core/tools.js';
import request from '../core/request.js';
import conf from '../core/conf.js';

module.exports = {
  info: (api, obj) => {
    return tools.login().then(r => {
        wx.setStorageSync(conf.tmp.code, r.code);
        return tools.getUserInfo(); // 授权后可以使用此接口获取用户信息
      }).then(r => {
        let o = {
          code: wx.getStorageSync(conf.tmp.code)
        };
        wx.removeStorageSync(conf.tmp.code);
        let uid = obj.uid ? obj.uid : '';
        let mold = obj.mold ? obj.mold : ''
        return request.basePost('access/getAccessToken', Object.assign(o, {
          encryptedData: r.encryptedData,
          iv: r.iv,
          item: conf.request.item,
          version: '2.1.3',
          mold: mold,
          share_uid: uid
        }));
      })
      .then(r => {
        wx.setStorageSync(conf.storage.token, r.access_token);
        wx.setStorageSync('close_share_button', r.close_share_button);
        return request.itemPost(api, {
          access_token: r.access_token
        });
      }).catch(fail => {
        console.log(fail)
        if (fail.code == 600 && fail.note == "IN_BLACK_LIST") {
          wx.showModal({
            title: '异常提醒',
            content: '因违规操作,已被系统列入黑名单',
            showCancel: false
          });
          return;
        }
      });
  },
  token: () => {
    wx.showLoading({
      title: '加载中',
      success: function() {}
    });
    return tools.login().then(r => {
      wx.setStorageSync(conf.tmp.code, r.code);
      return tools.getUserInfo(); // 授权后可以使用此接口获取用户信息
    }).then(r => {
      let o = {
        code: wx.getStorageSync(conf.tmp.code)
      };
      wx.removeStorageSync(conf.tmp.code);
      return request.basePost('access/getAccessToken', Object.assign(o, {
        encryptedData: r.encryptedData,
        iv: r.iv,
        item: conf.request.item,
        version: '1.0',
      }));
    }).then(r => {
      wx.setStorageSync(conf.storage.token, r.access_token);
      wx.setStorageSync('close_share_button', r.close_share_button);
      wx.hideLoading();
    });
  }

}