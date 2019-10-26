// miniprogram/pages/branches/branches.js
const utils  = require("../../utils/utils.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    api: '',
    name: '',
    branches: [],
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  getBranchCommit (e) {
    let index = e.currentTarget.dataset.index;
    let branch = this.data.branches[ index ];
    branch.fold = !branch.fold;
    this.setData({
      ['branches['+index+']']: branch
    })
    if (!branch.commitInfo) {
      this.getCommit (index, branch.commit.url)
    }
  },
  getCommit (index, api) {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(api).then(({ result }) => {
      wx.hideLoading()
      let branch = this.data.branches[ index ];
      result.commit.committer.date = utils.formatDate(result.commit.committer.date, true);
      branch.commitInfo = result;
      this.setData({
        ['branches['+index+']']: branch
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
  getBranches () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(this.data.api).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        branches: result
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
      name: options.name
    })
    wx.setNavigationBarTitle({
      title: options.name + ' Branches'
    });
    this.getBranches();
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