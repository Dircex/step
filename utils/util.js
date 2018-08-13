//载入用户操作API扩展包
import user from './libs/user.js';

//载入群组操作API扩展包
import group from './libs/group.js';

//载入自定义弹层扩展包
import layer from './libs/layer.js';

//载入网络请求扩展包
import request from './core/request.js';

//载入基础配置信息
import conf from './core/conf.js';

module.exports = {
  conf: conf,
  user: user,
  group: group,
  layer: layer,
  http: request
}
