// miniprogram/pages/search/search.js
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 'repositories',
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    },
    activeIndex: 0,
    page: 1,
    list: [],
    isLoading: false,
    totalCount: 0,
    incomplete_results: false,
    per_page: 40,
    searchTypes: [
      'Repositories',
      'Code',
      'Commits',
      'Issues',
      'Packages',
      'Marketplace',
      'Topics',
      'Wikis',
      'Users'
    ],
    throttle: 1500
  },
  setType (e) {
    let index = e.currentTarget.dataset.index;
    let type = this.data.searchTypes[ index ].toLowerCase()
    if (type !== this.data.type) {
      this.setData({
        activeIndex: index,
        page: 1,
        type: this.data.searchTypes[index].toLowerCase()
      })
      this.search()
    }
  },
  loadMore () {
    if (!this.data.incomplete_results) {
      this.setData({
        page: this.data.page + 1
      })
      this.search(true);
    }
  },
  onInput ({ detail: { value } }) {
    if (value) {
      this.searchVal = value
      this.search()
    }
  },
  search (loadingMore) {
    if (!this.searchVal) {
      return;
    }
    this.setData({
      isLoading: true
    })
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'search',
      // 传递给云函数的event参数
      data: {
        type: this.data.type,
        qs: {
          page: this.data.page,
          per_page: this.data.per_page,
          q: this.searchVal
        }
      }
    }).then(({ result }) => {
      wx.hideLoading()
      let list = loadingMore ? this.data.list.concat(result.items) : result.items;
      this.setData({
        isLoading: false,
        totalCount: result.total_count,
        incomplete_results: result.incomplete_results,
        list: list
      })
      if (!list.length) {
        wx.showToast({
          title: '未搜索到任何项目！',
          icon: 'none',
          duration: 3000,
          mask: false
        });
      }
      console.log(result)
      // output: res.result === 3
    }).catch(err => {
      wx.hideLoading()
      this.data.dialog.show = true;
      this.data.dialog.content = err.errMsg
      this.setData({
        dialog: this.data.dialog,
        page: loadingMore ? this.data.page - 1 : this.data.page,
        isLoading: false
      })
      console.log(err)
      // handle error
    })
  },
  navigateRepo (e) {
    let { api } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/repository/repository?api=${api}`
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {

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