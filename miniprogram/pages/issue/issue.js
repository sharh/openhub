// miniprogram/pages/issue/issue.js
const utils = require("../../utils/utils");
// const comi = require('../../components/comi/comi.js')
Page({

  /**
   * 页面的初始数据
   */
  data: {
    comments: [],
    issue: null
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
  init () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    });
    utils.cloudAPI(this.data.api).then(({ result }) => {
      result.created_at = utils.formatDate(result.created_at, true)
      result.updated_at = utils.formatDate(result.updated_at, true)
      result.closed_at = utils.formatDate(result.closed_at, true)
      this.setData({
        issue: result
      })
      wx.setNavigationBarTitle({
        title: 'Issue '+result.number
      });
      if (result.comments > 0) {
        this.getComments()
      }
      wx.hideLoading();
      wx.stopPullDownRefresh()
    }).catch((err) => {
      wx.hideLoading();
      wx.stopPullDownRefresh()
    });
  },
  goUser (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/user/user?api='+api
    });
  },

  getComments () {
    this.setData({
      loadingComments: true
    })
    utils.cloudAPI(this.data.issue.comments_url, {
      qs: {
        page: this.page
      }
    }).then(({ result }) => {
      for (var i = 0; i < result.length; i++){
        result[i].created_at = utils.formatDate(result[i].created_at, true)
        result[i].updated_at = utils.formatDate(result[i].updated_at, true)
      }
      if (!result.length) {
        this.noMore = true;
      } else {
        this.page++
      }
      this.setData({
        loadingComments: false,
        comments: this.data.comments.concat(result)
      })
    }).catch((err) => {
      this.setData({
        loadingComments: false
      })
    });
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
    if (this.data.loadingComments) {
      return;
    }
    wx.startPullDownRefresh();
    this.page = 1;
    this.noMore = false;
    this.init()
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.data.loadingComments || this.noMore) {
      return
    }
    this.getComments();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})