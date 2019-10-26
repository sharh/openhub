const request = require('request-promise')
// 云函数入口函数
exports.main = async (event, context) => {
  let { type, qs } = event;
  type = type || 'repositories'
  let body = await request.get(`https://api.github.com/search/${type}`, {
    qs: qs,
    json: true,
    gzip: true,
    // auth: {
    //   'user': '2975293515@qq.com',
    //   'pass': 'hu123456789.@',
    //   'sendImmediately': false
    // },
    headers: {
      "Accept": "application/vnd.github.mercy-preview+json",
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
  });
  return body
}