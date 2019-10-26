// miniprogram/pages/repository/repository.js
const utils  = require("../../utils/utils.js");
Page({

  /**
   * 页面的初始数据
   */
  data: {
    repo: {},
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
        tree.size = this.formatSize(tree.size);
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
  goUser () {
    if (!this.data.repo.owner) {
      return;
    }
    wx.navigateTo({
      url: `/pages/user/user?api=${this.data.repo.owner.url}`
    })
  },
  getMarkDown () {
    utils.cloudAPI(this.data.mdapi.download_url).then(({result}) => {
      this.setData({
        loadingMd: false,
        markdown: result
      })
    }).catch((e) => {
      this.setData({
        loadingMd: false
      })
    })
  },
  getContentApi () {
    this.setData({
      loadingMd: true
    })
    // https://api.github.com/repos/JesseKPhillips/USA-Constitution/contents
    utils.cloudAPI(`${this.data.api}/contents`).then(({ result }) => {
      let mdapi = result[0]
      for (let api of result) {
        if (api.name.toLowerCase() === 'readme.md') {
          mdapi = api;
          break;
        }
      }
      this.setData({
        baseUrl: mdapi.download_url.replace(/[^/]*$/i, ''),
        contentsAPI: result,
        mdapi: mdapi
      })
      this.getMarkDown();
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
  viewFile (e) {
    let index = e.currentTarget.dataset.index;
    let file = this.data.tree.tree[ index ];
    if (file.type === 'blob') {
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
      wx.setNavigationBarTitle({
        title: result.name
      });
      this.getContentApi();
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
    this.getContentApi();
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