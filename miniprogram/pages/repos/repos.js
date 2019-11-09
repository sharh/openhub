// miniprogram/pages/repos/repos.js
const utils  = require("../../utils/utils");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loadingRepos: true,
    repos: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      api: options.api
    })
    this.page = 1;
    this.init();
  },
  goRepo (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/repository/repository?api=${this.data.repos[index].url}`
    });
  },
  init () {
    this.setData({loadingRepos: true})
    utils.cloudAPI(this.data.api, {
      qs: {
        page: this.page
      }
    }).then(({ result }) => {
      if (!result || !result.length) {
        this.noMore = true;
      } else {
        this.page++;
      }
      this.setData({
        loadingRepos: false,
        repos: this.data.repos.concat(result)
      })
    }).catch((e) => {
      this.setData({loadingRepos: false})
    })
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
    if (this.data.loadingRepos || this.noMore) {
      return;
    }
    this.init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})