// miniprogram/pages/user/user.js
const utils = require("../../utils/utils.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    repos: [],
    loadingRepos: true,
    organizations: [],
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  goRepo (e) {
    let index = e.currentTarget.dataset.index;
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/repository/repository?api=${this.data[type][index].url}`
    });
  },
  getOrgs(){
    utils.cloudAPI(this.data.user.organizations_url).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        organizations: result
      })
    }).catch(err => {
      console.log(err)
      // handle error
    })
  },
  getRepos () {
    this.setData({
      loadingRepos: true
    })
    utils.cloudAPI(this.data.user.repos_url, {
      qs: {
        page: this.page
      }
    }).then(({ result }) => {
      wx.hideLoading()
      if (result.length) {
        this.page++
      } else {
        this.noMore = true
      }
      this.setData({
        loadingRepos: false,
        repos: this.data.repos.concat(result)
      })
      // output: res.result === 3
    }).catch(err => {
      this.setData({
        loadingRepos: false
      })
      console.log(err)
      // handle error
    })
  },
  getUser () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(this.data.api).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        user: result
      })
      this.getRepos();
      this.getOrgs();
      console.log(result)
      // output: res.result === 3
    }).catch(err => {
      wx.hideLoading()
      this.data.dialog.show = true;
      this.data.dialog.content = err.errMsg
      this.setData({
        dialog: this.data.dialog
      })
      console.log(err)
      // handle error
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      api: options.api
    })
    this.page = 1;
    this.getUser();
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
    if (this.loadingRepos || this.noMore) {
      return
    }
    this.getRepos();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})