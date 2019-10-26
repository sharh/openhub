// miniprogram/pages/user/user.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    user: {},
    repos: [],
    loadingRepos: true,
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  goRepo (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: `/pages/repository/repository?api=${this.data.repos[index].url}`
    });
  },
  getRepos () {
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'api',
      // 传递给云函数的event参数
      data: {
        api: this.data.user.repos_url
      }
    }).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        loadingRepos: false,
        repos: result
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
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'api',
      // 传递给云函数的event参数
      data: {
        api: this.data.api
      }
    }).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        user: result
      })
      this.getRepos ()
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

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})