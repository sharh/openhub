// miniprogram/pages/contributors/contributors.js
const utils  = require("../../utils/utils.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    api: '',
    name: '',
    contributors: [],
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  getContributors () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(this.data.api).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        contributors: result
      })
    }).catch((err) => {
      wx.hideLoading()
      this.data.dialog.show = true;
      this.data.dialog.content = err.errMsg || err.message;
      this.setData({
        dialog: this.data.dialog
      })
    })
  },
  navigateUser (e) {
    wx.navigateTo({
      url: '/pages/user/user?api='+e.currentTarget.dataset.api
    });
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      api: options.api,
      name: options.name
    })
    wx.setNavigationBarTitle({
      title: options.name
    });
    this.getContributors();
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})