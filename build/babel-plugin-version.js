const types = require('babel-types')



module.exports = function() {
  
  return {
    visitor: {
      ObjectProperty(path, param) {
        // 找到version字段
        if(path.node.key && path.node.key.name === 'version') {
          // 查找version字段是否属于App函数
          const appCall = path.findParent(parentPath => {
            return parentPath.node.type === 'CallExpression' && parentPath.node.callee && parentPath.node.callee.name === 'App'
          })
          // 查找version字段是否属于globalData属性
          const globalDataAttr = path.findParent(parentPath => {
            return parentPath.node.type === 'ObjectProperty' && parentPath.node.key && parentPath.node.key.name === 'globalData'
          })
    
          if(appCall && globalDataAttr && param.opts && param.opts.version) {
            path.node.value = types.stringLiteral(param.opts.version)
          }
        }
        
    
      }
    }
  }
}