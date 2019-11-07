// components/base/base.js
Component({
  options: {
    multipleSlots: true,
    addGlobalClass: true
  },
  /**
   * 组件的属性列表
   */
  properties: {
    dialog: {
      type: Object,
      value: {}
    },
    loading: {
      type: Object,
      value: {}
    },
    dialogBottom: null
  },

  /**
   * 组件的初始数据
   */
  data: {},

  /**
   * 组件的方法列表
   */
  methods: {
    dialogClose ({detail}) {
      this.triggerEvent('dialog-close', {type: detail.type})
    }
  }
});
