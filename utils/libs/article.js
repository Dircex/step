//载入核心处理文件
import tools from '../core/tools.js';
import request from '../core/request.js';
import conf from '../core/conf.js';

module.exports = {
  info: (api) => {
    return tools.login().then(r => {
      wx.setStorageSync(conf.tmp.code, r.code);
      return tools.getUserInfo();
    }).then(r => {
      let o = {
        code: wx.getStorageSync(conf.tmp.code)
      };
      wx.removeStorageSync(conf.tmp.code);
      return request.basePost('access/getAccessToken', Object.assign(o, {
        encryptedData: r.encryptedData,
        iv: r.iv,
        item: conf.request.item
      }));
    }).then(r => {
      wx.setStorageSync(conf.storage.token, r.access_token);
      return request.itemPost(api, { access_token: r.access_token });
    });
  }
}