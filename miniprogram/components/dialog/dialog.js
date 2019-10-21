Component({
  name: 'dialog',
  options: {
    addGlobalClass: true
  },
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function observer(newValue) {
        newValue ? this.openDialog() : this.closeDialog();
      }
    },
    title: {
      type: String,
      value: ''
    },
    maskClosable: {
      type: Boolean,
      value: true
    },
    content: {
      type: String,
      value: ''
    },
    showCancel: {
      type: Boolean,
      value: true
    },
    cancelText: {
      type: String,
      value: '取消'
    },
    confirmText: {
      type: String,
      value: '确定'
    }
  },
  lifetimes: {
    attached: function attached() {
      this.data.show ? this.openDialog() : this.closeDialog();
    }
  },
  data: {
    showDialog: false
  },
  methods: {
    openDialog: function() {
      this.setData({
        showDialog: true
      });
    },
    closeDialog: function(e) {
      if (e) {
        let type = e.currentTarget.dataset.type
        if (!this.data.maskClosable && type === 'mask') {
          return
        }
        this.triggerEvent('close', {type})
      }
      this.setData({
        showDialog: false
      });
    }
  }
});
