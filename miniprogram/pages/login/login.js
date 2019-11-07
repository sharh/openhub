// miniprogram/pages/login/login.js
const utils = require('../../utils/utils')
const config = require('../../config/config.js')
const Base64 = require('../../utils/base64.js').Base64
Page({

  /**
   * 页面的初始数据
   */
  data: {
    password: '',
    disabled: true,
    name: ''
  },
  input (e) {
    let name = e.currentTarget.dataset.name;
    this.setData({
      [ name ]: e.detail.value
    })
    this.setData({
      disabled: !this.data.name || !this.data.password
    })
  },
  deleteAuth (authorization_id) {
    return utils.cloudAPI(`https://api.github.com/authorizations/${authorization_id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': 'basic '+Base64.encode(this.data.name + ':'+this.data.password)
      }
    }) 
  },
  resetToken () {
    return utils.cloudAPI(`https://api.github.com/applications/${config.client_id}/token`, {
      method: 'POST',
      data: {
        client_secret: config.client_secret,
        "scopes": [
          "public_repo"
        ],
        note: 'OpenHub'
      },
      headers: {
        'Authorization': 'basic '+Base64.encode(config.client_id + ':'+ config.client_secret)
      }
    })
  },
  loginByBasic () {
    return utils.cloudAPI(`https://api.github.com/user`, {
      method: 'get',
      headers: {
        'Authorization': 'basic '+Base64.encode(this.data.name + ':'+this.data.password)
      }
    })
  },
  login2 () {
    if (this.data.disabled) {
      return
    }
    utils.cloudAPI(`https://api.github.com/user`, {
      method: 'get',
      headers: {
        'Authorization': 'basic '+Base64.encode(this.data.name + ':'+this.data.password)
      }
    }).then(({result}) => {
      wx.setStorageSync('userinfo', result);
      wx.setStorageSync('login', {
        username: this.data.name,
        password: this.data.password
      });
      wx.navigateBack({
        delta: 1
      });
    }).catch((e) => {
      wx.showToast({
        title: '登录失败，请检查账号密码是否正确！',
        icon: 'none',
        duration: 1500,
        mask: true,
      });
      console.log(e)
    })
  },
  login () {
    if (this.data.disabled) {
      return
    }
    wx.showLoading({
      title: '登录中...',
      mask: true
    });
    utils.cloudAPI(`https://api.github.com/authorizations/clients/${config.client_id}`, {
      method: 'PUT',
      data: {
        client_secret: config.client_secret,
        "scopes": [
          "public_repo"
        ],
        note: 'OpenHub'
      },
      headers: {
        'Authorization': 'basic '+Base64.encode(this.data.name + ':'+this.data.password)
      }
    }).then(({ result }) => {
      console.log(result)
      if (!result.token) {
        if (!this.retried) {
          // 删除，不然获取不到token
          this.deleteAuth(result.id).then(() => {
            this.retried = true;
            this.login();
          }).catch((e) => {
            wx.showToast({
              title: '登录失败，请检查账号密码是否正确！',
              icon: 'none',
              duration: 1500,
              mask: true,
            });
            wx.hideLoading()
            console.log(e)
          })
        } else {
          this.loginByBasic().then(() => {
            wx.hideLoading()
            result.token_type = 'basic';
            result.token = Base64.encode(this.data.name + ':'+this.data.password)
            wx.setStorageSync('userinfo', result);
            wx.navigateBack({
              delta: 1
            });
          }).catch((e) => {
            wx.showToast({
              title: '登录失败，请检查账号密码是否正确！',
              icon: 'none',
              duration: 1500,
              mask: true,
            });
            wx.hideLoading()
            console.log(e)
          })
        }
      } else {
        wx.hideLoading()
        wx.setStorageSync('userinfo', result);
        wx.navigateBack({
          delta: 1
        });
      }
    }).catch((e) => {
      this.retried = false;
      wx.showToast({
        title: '登录失败，请检查账号密码是否正确！',
        icon: 'none',
        duration: 1500,
        mask: true,
      });
      console.log(e)
      wx.hideLoading()
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    utils.setLoginState(0)
  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})