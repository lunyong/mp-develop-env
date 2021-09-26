import './utils/mixins';
import logger from './utils/logger';
import http from './utils/http';
App({
  globalData: {
    version: "2.3.5"
  },

  onLaunch() {
    console.log('app launch');
  },

  onShow() {
    console.log('app show');
  }

});