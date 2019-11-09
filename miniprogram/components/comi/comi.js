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
    }
  },
  lifetimes: {
    attached: function attached() {
      this.init()
    }
  },
  methods: {
    init: function() {
      WxParse.wxParse('article', this.data.type, this.data.content, this, 5);
    }
  }
});