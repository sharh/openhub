let loginState = 0;

function formatDate (date, time) {
  date = new Date(date);
  if (date.toString() === 'Invalid Date') {
    date = new Date();
  }
  let y = date.getFullYear();
  let m = date.getMonth() + 1;
  let d = date.getDate();
  let dateStr = y + '-' + (m < 10 ? '0'+m : m) + '-' +(d < 10 ? '0'+d : d);
  if (!time) {
    return dateStr;
  } else {
    let h = date.getHours();
    let mm = date.getMinutes();
    let s = date.getSeconds();
    dateStr += ` ${h < 10 ? '0'+h : h}:${mm < 10 ? '0'+mm : mm}:${s < 10 ? '0'+s : s}`
  }
  return dateStr
}
function setLoginState(state) {
  loginState = state
}
function cloudAPI (api, options = {}) {
  options = options || {}
  const userinfo = wx.getStorageSync('userinfo');
  let data = {
    api: decodeURIComponent(api),
    ...options
  }
  if (userinfo && userinfo.token) {
    data.headers = data.headers || {}
    data.headers[ 'Authorization' ] = `${userinfo.token_type || 'token'} ` + userinfo.token;
  }
  return wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'api',
    // 传递给云函数的event参数
    data: data
  }).then(({ result }) => {
    if (result && result.statusCode) {
      if (result.statusCode == 401 && loginState != 1) {
        loginState = 1;
        wx.navigateTo({
          url: '/pages/login/login'
        });
      }
      throw result.error;
    }
    return {result};
  }).catch((e) => {
    console.log(e)
    throw e
  })
}
module.exports = {
  formatDate,
  cloudAPI,
  setLoginState
}