var WxParse = require('./wxParse.js');

module.exports = function comi(md, type='html', scope) {

  WxParse.wxParse('article', type, md, scope, 5);

}