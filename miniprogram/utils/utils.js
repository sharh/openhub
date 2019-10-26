function formatDate(date, time) {
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
function cloudAPI(api) {
  return wx.cloud.callFunction({
    // 要调用的云函数名称
    name: 'api',
    // 传递给云函数的event参数
    data: {
      api: api
    }
  })
}
module.exports = {
  formatDate,
  cloudAPI
}