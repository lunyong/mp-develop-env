/**
 * 全局事件处理
 * 导出两个功能,一个是全局事件中心EventCenter,用于处理全局事件;一个是EventBus类,用于处理局部事件
 */

const _shift = Array.prototype.shift

class EventBus {
  constructor() {
    this.events = {}
    this.listen = this.on
    this.emit = this.trigger
    this.remove = this.off
  }

  on(key, callback) {
    if(!this.events[key]) {
      this.events[key] = []
    }
    this.events[key].push(callback)

    return () => {
      this.off(key, callback)
    }
  }

  off(key, callback) {
    if(this.events[key]) {
      if(callback) {
        for(let i = this.events[key].length; i >= 0; i--){
          if(this.events[key][i] === callback){
            this.events[key].splice(i, 1)
            break
          }
      }
      }else{
        this.events[key] = null
      }
    }
  }

  trigger() {
    const key = _shift.call(arguments)
    if(this.events[key] && this.events[key].length) {
      for (let i = 0, length = this.events[key].length; i < length; i++) {
        const callback = this.events[key][i]
        // callback(arguments)
        callback.apply(this, arguments)
      }
    }
  }

  once(key, callback) {
    this.off(key)
    this.on(key, callback)
  }
}

const EventCenter = new EventBus()

export {
  EventCenter,
  EventBus
}

