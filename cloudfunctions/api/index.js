const request = require('request-promise')
// 云函数入口函数
exports.main = async (event, context) => {
  let { api, method, data } = event;
  let params = {
    json: true,
    gzip: true,
    headers: {
      "Accept": "application/vnd.github.mercy-preview+json",
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
  }
  if (method && method.toLowerCase() != 'get' && data) {
    params.body = data;
  }
  let body = await request[method || 'get'](api, params)
  return body
}