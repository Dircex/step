//载入核心处理文件
import tools from '../core/tools.js';
import request from '../core/request.js';
import conf from '../core/conf.js';

module.exports = {
  openGid: (str) => {
    let _code;
    return tools.login().then(r => {
      _code = r.code;
      return tools.getShareInfo({shareTicket:str});
    }).then(r => {
      return request.basePost('access/getOpenGid',{
        code:_code,
        encryptedData: r.encryptedData,
        iv: r.iv,
        item: conf.request.item
      });
    });
  }
}
