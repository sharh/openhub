const request = require('request-promise')
// 云函数入口函数
exports.main = async (event, context) => {
  let { api, method, data, auth, headers = {} } = event;
  let params = {
    json: true,
    gzip: true,
    headers: {
      ...headers,
      "Accept": "application/vnd.github.mercy-preview+json",
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36'
    }
  }
  if (auth) {
    params.auth = auth;
  }
  if (method && method.toLowerCase() != 'get' && data) {
    params.body = data;
  }
  method = (method || 'get').toLowerCase()

  try {
    let body = await request[method](api, params)
    return body
  } catch (error) {
    return error
  }
}