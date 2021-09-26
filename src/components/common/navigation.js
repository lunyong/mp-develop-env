import mpApp from '../app'
import logger from '../../utils/logger'

Component({
  options: {
    styleIsolation: 'apply-shared'
  },
  properties: {
    mode: {
      type: String,
      value: ''
    },
    title: {
      type: String,
      value: ''
    },
    textStyle: {
      type: String,
      value: ''
    },
    backgroundColor: {
      type: String,
      value: '#ffffff'
    },
    modid: {
      type: String,
      value: ''
    },
    /**
     * 点击返回按钮之后，执行navigateBack之前，如果调用方传入了此方法，则会执行该方法，并获取其返回值，如果返回true，则继续执行navigateBack，否则，不执行navigateBack
     */
    beforeBack: {
      type: Function,
      value: function() {
        return true
      }
    }
  },
  data: {
    navWidth: 375,
    navHeight: 64,
    navigationBarHeight: 44,
    statusBarHeight: 20,
  },
  ready() {
    const { navigationBarHeight, statusBarHeight, navWidth, navHeight } = mpApp.getNavigationSize()
    this.setData({
      navWidth,
      navHeight,
      statusBarHeight,
      navigationBarHeight
    })
  },
  methods: {
    onBackClick() {
      let isEnable = true
      if(this.properties.beforeBack && typeof this.properties.beforeBack === 'function') {
        isEnable = this.properties.beforeBack()
      }
      if(isEnable) {
        this.navigateBack()
      }
    },
    navigateBack() {
      const pages = getCurrentPages()
      if(pages.length > 1) {
        ks.navigateBack()
      }else{
        this.navigateHome()
      }
    },
    onHomeClick() {
      this.navigateHome()
    },
    navigateHome() {
      ks.switchTab({url: '/pages/index'})
    },
    onSearchClick() {
      const modid = this.properties.modid
      if(modid) {
        logger.sendClickLog(modid, modid + '1')
      }
      ks.navigateTo({
        url:'/package/pages/search/index'
      })
    }
  },
})