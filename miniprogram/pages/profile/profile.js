// miniprogram/pages/profile/profile.js
const utils = require("../../utils/utils.js");
const app =  getApp();

Page({

  /**
   * 页面的初始数据
   */
  data: {
    needLogin: true,
    loading: 'loading',
    avatar_url: '/images/icons/login.png',
    api: 'https://api.github.com/user',
    user: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
  },
  onShow () {
    let cachedData = wx.getStorageSync('profile');
    if (cachedData) {
      this.setData({
        user: cachedData
      })
    }
    if (app.globalData.userinfo && app.globalData.userinfo.token) {
      this.data.needLogin && this.init()
    } else {
      this.setData({
        loading: 'empty'
      })
    }
  },
  init () {
    this.loading = true;
    utils.cloudAPI(this.data.api).then(({ result }) => {
      this.loading = false;
      this.setData({
        needLogin: false,
        user: result
      })
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      this.getNotifications();
      this.getStarred();
      this.getOrgs();
    }).catch((err) => {
      this.loading = false;
      this.setData({
        needLogin: this.data.user ? false : true
      })
      wx.stopPullDownRefresh();
      wx.hideNavigationBarLoading();
      console.log(err)
    });
  },
  viewIssue (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/issue/issue?api='+api
    })
  },
  viewRepos (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/repos/repos?api='+api
    })
  },
  viewRepo (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/repository/repository?api='+api
    })
  },
  actClick (e) {
    let type = e.currentTarget.dataset.type;
    if (type === 'activity') {
      this.setData({
        open: !this.data.open
      })
    } else {
      wx.navigateTo({
        url: `/pages/${type}/${type}`
      })
    }
  },
  reload () {
    if (this.data.loading === 'fail') {
      this.getNotifications();
    } else if (this.data.loading === 'empty') {
      wx.navigateTo({
        url: '/pages/login/login'
      });
    }
  },
  itemClick (e) {
    let { type } = e.currentTarget.dataset;
    if (type === 'followers_url') {
      wx.navigateTo({
        url: '/pages/contributors/contributors?api='+this.data.user[type] + '&name='+ this.data.user.login +'\'s followers'
      });
    } else if (type === 'following_url') {
      wx.navigateTo({
        url: '/pages/contributors/contributors?api='+this.data.user[type].replace(/{[^{}]*}/gim, '') + '&name='+ this.data.user.login +'\'s following'
      });
    } else {
      wx.navigateTo({
        url: '/pages/repos/repos?api='+this.data.user[type].replace(/{[^{}]*}/gim, '')
      });
    }
  },
  getOrgs () {
    utils.cloudAPI('https://api.github.com/users/'+this.data.user.login+'/orgs').then(({ result }) => {
      console.log(result)
      this.setData({
        organizations: result
      })
    }).catch((e) => {
    })
  },
  getStarred () {
    utils.cloudAPI('https://api.github.com/users/'+this.data.user.login+'/starred', {
      qs: {
        page: 1,
        per_page: 5
      }
    }).then(({ result }) => {
      console.log(result)
      this.setData({
        starred: result
      })
    }).catch((e) => {
    })
  },
  getNotifications () {
    if (this.loading) {
      return
    }
    this.loading = true;
    this.setData({
      loading: 'loading'
    })
    utils.cloudAPI('https://api.github.com/notifications', {
      qs: {
        all: true,
        page: 1,
        per_page: 10
      }
    }).then(({ result }) => {
      this.loading = false;
      for (var i = 0; i < result.length; i++){
        result[i].created_at = utils.formatDate(result[i].created_at, true)
        result[i].updated_at = utils.formatDate(result[i].updated_at, true)
      }
      console.log(result)
      this.setData({
        notifications: result,
        loading: 'success'
      })
    }).catch((e) => {
      this.loading = false;
      this.setData({
        loading: 'fail'
      })
    })
  },
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

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

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    if (this.loading) {
      return
    }
    wx.startPullDownRefresh();
    wx.showNavigationBarLoading();
    this.init();
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