
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    visible: {
      type: Boolean,
      value: false
    },
    style: {
      type: Object,
      value: {}
    },
    closeEnable: {
      type: Boolean,
      value: false
    },
    closeStyle: {
      type: Object,
      value: {}
    },
    closeImg: {
      type: String,
      value: 'http://oss.suning.com/ppmp/static/public/img/curtain_close.png'
    },
    direction: {
      type: String,
      value: 'down'
    }
  },
  methods: {
    onCloseClick() {
      this.triggerEvent('close')
    }
  },
})