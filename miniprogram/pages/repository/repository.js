// miniprogram/pages/repository/repository.js
const utils = require("../../utils/utils.js");
const Base64 = require("../../utils/base64.js").Base64;
// const marked = require('marked')
const app =  getApp();

  
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repo: {},
    stared: false,
    markdown: null,
    fold: true,
    mdapi: null,
    loadingMd: true,
    backName: '',
    baseUrl: '',
    shaList: [],
    contentsAPI: null,
    dialog: {
      show: false,
      showCancel: false,
      maskClosable: false
    }
  },
  checkStared () {
    if (app.globalData.userinfo) {
      utils.cloudAPI(`https://api.github.com/user/starred/${this.data.repo.full_name}`, {
        method: 'get'
      }).then(({ result }) => {
        this.setData({stared: true})
        console.log(result)
      }).catch((e) => {
        console.log(e)
      })
      
    }
  },
  starred () {
    utils.cloudAPI(`https://api.github.com/user/starred/${this.data.repo.full_name}`, {
      method: this.data.stared ? 'DELETE' : 'PUT'
    }).then(({ result }) => {
      this.setData({stared: !this.data.stared})
      console.log(result)
    }).catch((e) => {
      console.log(e)
    })
  },
  fork () {
    if (this.forking) {
      wx.showToast({
        title: 'forking...',
        icon: 'none',
        mask: true
      })
      return
    }
    this.forking = true
    if (app.globalData.userinfo) {
      wx.showLoading({
        title: 'forking...',
        mask: true
      })
      utils.cloudAPI(this.data.repo.forks_url, {
        method: 'post'
      }).then(({ result }) => {
        wx.hideLoading()
        this.forking = false
        wx.showToast({
          title: 'fork成功！',
          icon: 'none',
          mask: true
        })
        setTimeout(() => {
          wx.navigateTo({
            url: '/pages/repository/repository?api=' + result.url
          })
        }, 1500);
        console.log(result)
      }).catch((e) => {
        wx.hideLoading()
        this.forking = false
        wx.showToast({
          title: e.message || e.errMsg || '网络异常！',
          icon: 'none',
          mask: true
        })
        console.log(e)
      })
    }
  },
  foldIt () {
    this.setData({
      fold: false
    })
  },
  backFold () {
    this.data.shaList.pop();
    let sha = this.data.shaList.pop();
    if (sha) {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      this.getTree(sha.sha, sha.name).then(() => {
        wx.hideLoading()
      }).catch(() => {
        wx.hideLoading();
      })
    }
  },
  getBranchInfo (branch) {
    utils.cloudAPI(`${this.data.api}/branches/${branch}`).then(({result}) => {
      this.setData({
        branch: result
      })
      this.getTree(result.commit.sha, '')
    })
  },
  navigatePage (e) {
    let type = e.currentTarget.dataset.type;
    wx.navigateTo({
      url: `/pages/${type}/${type}?api=${this.data.api}/${type}&name=${this.data.repo.name}`
    })
  },
  getTree (sha, name) {
    return utils.cloudAPI(`${this.data.api}/git/trees/${sha}`).then(({ result }) => {
      result.tree.sort((item) => {
        if (item.type === 'tree') {
          return -1;
        } else if(/^\./.test(item.path)) {
          return 0
        } else {
          return 1
        }
      })
      for (let tree of result.tree) {
        tree.fileSize = this.formatSize(tree.size);
      }
      this.data.shaList.push({
        sha: sha,
        name: name
      });
      this.setData({
        tree: result,
        shaList: this.data.shaList,
        backName: this.data.shaList.map((item)=>item.name).join('/')
      })
      return result;
    })
  },
  goIssue () {
    if (!this.data.repo) {
      return;
    }
    let api = this.data.repo.issues_url.replace(/{[^{}]*}/gim, '')
    wx.navigateTo({
      url: `/pages/issues/issues?api=${api}`
    })
  },
  goUser () {
    if (!this.data.repo.owner) {
      return;
    }
    wx.navigateTo({
      url: `/pages/user/user?api=${this.data.repo.owner.url}`
    })
  },
  wxParseTagATap (e) {
    let src = e.currentTarget.dataset.src
    this.data.dialog.show = true;
    this.data.dialog.content = '请将内容复制在浏览器打开';
    this.data.dialog.confirmText = '复制'
    this.fileUrl = src;
    this.setData({
      dialog: this.data.dialog
    })
  },
  getMarkDown () {
    this.setData({
      loadingMd: true
    })
    utils.cloudAPI(this.data.api + '/readme').then(({ result }) => {
      // var html = marked(`git clone https://www.baidu.com`, { baseUrl: this.data.baseUrl });
      // var html = marked(Base64.decode(result.content), { baseUrl: this.data.baseUrl });
      this.setData({
        loadingMd: false,
        markdown: true,
        md: Base64.decode(result.content),
        baseUrl: result.download_url.replace(/[^/]*$/i, '')
      })
    }).catch((e) => {
      this.setData({
        loadingMd: false
      })
    })
  },
  formatSize (size) {
    size = (size / 1024).toFixed(2) + 'kb'
    return size
  },
  formatNum (result) {
    if (result.stargazers_count > 1000) {
      result.stargazers_count = (result.stargazers_count / 1000).toFixed(2) + 'k'
    }
    if (result.forks > 1000) {
      result.forks = (result.forks / 1000).toFixed(2) + 'k'
    }
    if (result.open_issues > 1000) {
      result.open_issues = (result.open_issues / 1000).toFixed(2) + 'k'
    }
    return result
  },
  copyFile () {
    if (this.fileUrl) {
      wx.setClipboardData({
        data: this.fileUrl
      })
      this.fileUrl = null;
    }
    this.data.dialog.show = false;
    this.setData({
      dialog: this.data.dialog
    })
  },
  viewFile (e) {
    let index = e.currentTarget.dataset.index;
    let file = this.data.tree.tree[ index ];
    if (file.type === 'blob') {
      if (file.size > 1024 * 1024) {
        this.data.dialog.show = true;
        this.data.dialog.content = '当前文件内容过大，请将内容复制在浏览器打开';
        this.data.dialog.confirmText = '复制'
        this.fileUrl = file.url;
        this.setData({
          dialog: this.data.dialog
        })
        return
      }
      wx.navigateTo({
        url: `/pages/filecontent/filecontent?api=${file.url}&name=${file.path}&size=${file.size}`
      })
    } else {
      wx.showLoading({
        title: '加载中...',
        mask: true
      })
      this.getTree(file.sha, file.path).then(() => {
        wx.hideLoading()
      }).catch((e) => {
        wx.hideLoading()
      })
    }
  },
  getRepo () {
    wx.showLoading({
      title: '加载中...',
      mask: true
    })
    utils.cloudAPI(this.data.api).then(({ result }) => {
      wx.hideLoading()
      this.setData({
        repo: this.formatNum(result)
      })
      this.checkStared();
      wx.setNavigationBarTitle({
        title: result.name
      });
      this.getBranchInfo(result.default_branch)
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
    this.getRepo()
    this.getMarkDown();
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