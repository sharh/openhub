var WxParse = require('./wxParse.js');

Component ({
  name: 'dialog',
  options: {
    addGlobalClass: true
  },
  properties: {
    content: {
      type: String,
      value: '',
      observer: function observer (newValue) {
        if (newValue) {
          this.init()
        }
      }
    },
    type: {
      type: String,
      value: 'md',
    },
    baseUrl: {
      type: String,
      value: '',
    }
  },
  lifetimes: {
    attached: function attached() {
      this.data.content && this.init()
    }
  },
  methods: {
    wxParseTagATap (e) {
      wx.setClipboardData({
        data: e.currentTarget.dataset.src,
        success: (result) => {
          
        },
        fail: () => {},
        complete: () => {}
      });
    },
    init: function() {
      WxParse.wxParse('article', this.data.type, this.data.content, this, 5, this.data.baseUrl);
    }
  }
});