const appid = 'wxb68677648b92a99e'
const secret = '4ef4dabbfe7df07893bab8af053693ab'
const env = 'mwing-c79ba0'

const fs = require('fs')
const request = require('request-promise')
let token;
if (typeof token) {
  try {
    token = fs.readFileSync('token')
    token = JSON.parse(token)
  } catch (e) {
    
  }
}
/**
 * 获取小程序token
 */
async function getToken () {
  if (token && token.date > Date.now()) {
    return token.access_token
  }
  let body = await request.get(`https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`, {
    json: true
  })
  console.log('access_token', body)
  let {access_token, expires_in} = body
  if (access_token) {
    token = {
      access_token,
      date: Date.now() + (expires_in - 300) * 1000
    }
    fs.writeFileSync('token', JSON.stringify(token))
    return token.access_token
  }
}
/**
 * 数据库操作
 * @param {string} query 数据库执行语句
 */
async function databaseoperate (type, query) {
  console.log(query)
  let token = await getToken();
  // console.log(token)
  return request.post(`https://api.weixin.qq.com/tcb/${type}`, {
    json: true,
    body: {
      env,
      query: query
    },
    qs: {
      access_token: token
    }
  })
}

module.exports = {
  getToken,
  databaseoperate
}