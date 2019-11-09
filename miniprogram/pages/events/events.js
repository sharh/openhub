// miniprogram/pages/notifications/notifications.js
const utils = require("../../utils/utils");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: 'loading',
    data: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.page = 1;
    this.getData();
  },
  viewRepo (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/repository/repository?api='+api
    })
  },
  goUser (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/user/user?api='+api
    })
  },
  getData () {
    if (this.loading) {
      return
    }
    this.loading = true;
    this.setData({
      loading: 'loading'
    })
    utils.cloudAPI('https://api.github.com/events', {
      qs: {
        all: true,
        page: this.page,
        per_page: 10
      }
    }).then(({ result }) => {
      if (result.length < 10) {
        this.noMore = true;
      } else {
        this.page++
      }
      this.loading = false;
      for (var i = 0; i < result.length; i++){
        result[i].created_at = utils.formatDate(result[i].created_at, true)
        result[i].updated_at = utils.formatDate(result[i].updated_at, true)
      }
      console.log(result)
      this.setData({
        data: this.data.data.concat(result),
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
    if (this.data.loading === 'loading' || this.noMore) {
      return
    }
    this.getData();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})