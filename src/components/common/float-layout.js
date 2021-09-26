
Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    title: {
      type: String,
      value: ''
    },
    position: {
      type: String,
      value: ''
    },
    visible: {
      type: Boolean,
      value: '',
    },
    mask: {
      type: Boolean,
      value: false
    }
  },
  methods: {
    onCloseClick(e) {
      this.hide(e)
    },
    onMaskClick(e) {
      this.hide(e)
    },
    hide(e) {
      this.triggerEvent('hide', e)
    }
  }
})