Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  data: {
    showDialog: false
  },
  properties: {
    show: {
      type: Boolean,
      value: false,
      observer: function observer (newValue) {
        this.dialogOperate(newValue)
      }
    },
    showClose: {
      type: Boolean,
      value: true
    },
    title: {
      type: String,
      value: ''
    },
    subTitle: {
      type: String,
      value: null
    },
    showMore: {
      type: Boolean,
      value: false
    },
    content: {
      type: String,
      value: ''
    },
    desc: {
      type: String,
      value: null
    },
    buttons: {
      type: Array,
      value: []
    },
    maskClosable: {
      type: Boolean,
      value: true
    }
  },
  lifetimes: {
    attached: function attached () {
      console.log(this.data)
      this.dialogOperate(this.data.show)
    }
  },
  methods: {
    dialogOperate: function(show) {
      this.setData({
        showDialog: show
      });
      this.triggerEvent(show ? "show" : "hide");
    },
    onClickEvent: function(e) {
      let type = e.currentTarget.dataset.type;
      if (type === 'mask' && this.data.maskClosable) {
        this.dialogOperate(false);
      } else if (type === 'close') {
        this.dialogOperate(false);
      }
      this.triggerEvent("click", { type });
    }
  }
});
