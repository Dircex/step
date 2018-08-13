//导入MD5加密文件
import md5 from './md5.js';
import tools from './tools.js';
import conf from './conf.js';

var time = new Date().getTime();

module.exports = {
  basePost: function(api = '', params = null, success = null, fail = null, complete = null) {
    return this.HttpHandlePost(conf.request.baseUrl, api, params, success, fail, complete);
  },

  itemPost: function(api = '', params = null, success = null, fail = null, complete = null) {
    return this.HttpHandlePost(conf.request.itemUrl, api, params, success, fail, complete);
  },

  HttpHandlePost: function(url = '', api = '', params = null, success = null, fail = null, complete = null) {
    return tools.request({
      url: url + api + '?_app=' + conf.request._app,
      data: params,
      method: conf.request.method,
      dataType: conf.request.format,
      header: {
        'Content-type': 'application/x-www-form-urlencoded;charset=utf-8',
        pub: conf.request._pub,
        timestamp: time,
        sign: this.mergeSign(api, params)
      }
    });
  },

  //生成签名
  mergeSign: function(api, params) {
    let str = conf.request._key + api + time;

    if (typeof params == 'object') {
      let sortArray = [];
      let sortParams = {};

      for (var i in params) {
        sortArray.push(i);
      }

      sortArray.sort();

      for (var a of sortArray) {
        let sortKey = a;
        sortParams[sortKey] = params[sortKey];
      }
      str += this.__dealParams(sortParams);
    }
    return md5.md5(str);
  },

  //处理传递参数并格式化
  __dealParams: function(params = {}) {
    let str = '';
    for (var i in params) {
      str += '&' + i + '=' + params[i];
    }

    str = str.substr(1);

    return str;
  }
}