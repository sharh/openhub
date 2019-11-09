// miniprogram/pages/issues/issues.js
const utils = require("../../utils/utils");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    loading: true,
    issues: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.setData({
      api: options.api || 'https://api.github.com/repos/openai/gpt-2/issues'
    })
    let repo = this.data.api.replace('https://api.github.com/repos/', '').replace('/issues', '')
    wx.setNavigationBarTitle({
      title: repo+' Issues',
    });
      
    this.page = 1;
    this.init();
  },
  viewIssue (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/issue/issue?api='+api
    });
  },
  goUser (e) {
    let api = e.currentTarget.dataset.api;
    wx.navigateTo({
      url: '/pages/user/user?api='+api
    });
  },
  foldItem (e) {
    let index = e.currentTarget.dataset.index;
    this.setData({
      ['issues['+index+'].fold']: !this.data.issues[index].fold
    })
  },
  init () {
    this.setData({
      loading: true
    })
    utils.cloudAPI(this.data.api, {
      qs: {
        page: this.page,
        per_page: 20
      }
    }).then(({result}) => {
      if (result.length < 20) {
        this.noMore = true;
        
      } else {
        this.page++
      }
      for (var i = 0; i < result.length; i++){
        result[i].created_at = utils.formatDate(result[i].created_at, true)
        result[i].updated_at = utils.formatDate(result[i].updated_at, true)
      }
      this.setData({
        loading: false,
        issues: this.data.issues.concat(result)
      })
    }).catch((err) => {
      this.setData({
        loading: false
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

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {
    if (this.noMore || this.loading) {
      return
    }
    this.init();
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})