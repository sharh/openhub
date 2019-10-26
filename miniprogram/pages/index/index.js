//index.js
const app = getApp()
const DB = require('../../utils/db.js')
const utils = require('../../utils/utils.js')
const cachedData = {
  repositories: {},
  developers: {}
}
Page({
  data: {
    repositories: [],
    developers: [],
    // 语言
    lang: '',
    dates: [ 'daily', 'weekly', 'monthly' ],
    dateIndex: 0,
    // 时间
    since: 'daily',
    // 是仓库还是开发者
    type: 'repositories',

    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  bindPickerChange (e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    this.setData({
      dateIndex: e.detail.value,
      since: this.data.dates[e.detail.value]
    })
    this.getList()
  },
  navigateRepo (e) {
    let { api } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/repository/repository?api=${api}`
    })
  },
  navigateUser (e) {
    let { api } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/user/user?api=${api}`
    })
  },
  changeContent (e) {
    let type = e.currentTarget.dataset.type;
    this.setData({
      type
    })
    this.getList()
  },
  getList () {
    let type = this.data.type;
    let since = this.data.since
    if (cachedData[type][since]) {
      this.setData({
        [type]: cachedData[type][since]
      })
      return
    }
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    wx.cloud.callFunction({
      // 要调用的云函数名称
      name: 'trending',
      // 传递给云函数的event参数
      data: {
        since: since,
        type: type
      }
    }).then(({ result: { data } }) => {
      if (data && data.length) {
        this.setData({
          [type]: data[0].data
        })
        cachedData[type][since] = data[0].data
      }
      wx.hideLoading()
      console.log(data)
      // output: res.result === 3
    }).catch(err => {
      // handle error
      wx.hideLoading()
      this.data.dialog.show = true;
      this.data.dialog.content = err.errMsg
      this.setData({
        dialog: this.data.dialog
      })
      console.log(err)
    })
  },
  onLoad: function () {
    this.getList()
  },

  onGetUserInfo: function(e) {
    if (!this.logged && e.detail.userInfo) {
      this.setData({
        logged: true,
        avatarUrl: e.detail.userInfo.avatarUrl,
        userInfo: e.detail.userInfo
      })
    }
  },

  onGetOpenid: function() {
    // 调用云函数
    wx.cloud.callFunction({
      name: 'login',
      data: {},
      success: res => {
        console.log('[云函数] [login] user openid: ', res.result.openid)
        app.globalData.openid = res.result.openid
        wx.navigateTo({
          url: '../userConsole/userConsole',
        })
      },
      fail: err => {
        console.error('[云函数] [login] 调用失败', err)
        wx.navigateTo({
          url: '../deployFunctions/deployFunctions',
        })
      }
    })
  },

  // 上传图片
  doUpload: function () {
    // 选择图片
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {

        wx.showLoading({
          title: '上传中',
        })

        const filePath = res.tempFilePaths[0]
        
        // 上传图片
        const cloudPath = 'my-image' + filePath.match(/\.[^.]+?$/)[0]
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success: res => {
            console.log('[上传文件] 成功：', res)

            app.globalData.fileID = res.fileID
            app.globalData.cloudPath = cloudPath
            app.globalData.imagePath = filePath
            
            wx.navigateTo({
              url: '../storageConsole/storageConsole'
            })
          },
          fail: e => {
            console.error('[上传文件] 失败：', e)
            wx.showToast({
              icon: 'none',
              title: '上传失败',
            })
          },
          complete: () => {
            wx.hideLoading()
          }
        })

      },
      fail: e => {
        console.error(e)
      }
    })
  },

})
