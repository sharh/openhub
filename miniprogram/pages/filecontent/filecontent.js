// miniprogram/pages/filecontent/filecontent.js
const utils = require("../../utils/utils.js");
const Base64  = require("../../utils/base64.js").Base64;
Page({

  /**
   * 页面的初始数据
   */
  data: {
    content: '',
    name: '',
    fileSize: '',
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  getFileContent () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(this.data.api).then(({result}) => {
      wx.hideLoading()
      let ext = this.data.name.split('.');

      result.content = `${'```' + ext[ ext.length - 1 ]}\n${Base64.decode(result.content)}${'```'}`
      this.setData({
        ...result
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
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      api: options.api,
      name: options.name,
      fileSize: options.size
    })
    wx.setNavigationBarTitle({
      title: options.name
    });
      
    this.getFileContent();
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