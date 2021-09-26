const fs = require('fs')
const path = require('path')
const babelParser = require('@babel/parser')
const babel = require('babel-core')
const types = require('babel-types')
const babelPluginVersion = require('./babel-plugin-version')

const argv = process.argv || []
const vStr = argv[2] || ''
const vArr = vStr.split('=')
const version = vArr[vArr.length - 1] || ''
console.log('version:', version)

// const visitor = {
//   ObjectProperty(path) {
//     // 找到version字段
//     if(path.node.key && path.node.key.name === 'version') {
//       // 查找version字段是否属于App函数
//       const appCall = path.findParent(parentPath => {
//         return parentPath.node.type === 'CallExpression' && parentPath.node.callee && parentPath.node.callee.name === 'App'
//       })
//       // 查找version字段是否属于globalData属性
//       const globalDataAttr = path.findParent(parentPath => {
//         return parentPath.node.type === 'ObjectProperty' && parentPath.node.key && parentPath.node.key.name === 'globalData'
//       })

//       if(appCall && globalDataAttr) {
//         path.node.value = types.stringLiteral('2.2.3')
//       }
//     }
//   }
// }

// const code = fs.readFileSync(path.resolve(__dirname, '../src/app.js'), {encoding: "utf-8"})
const code = `App({
  globalData: {
    version: '1.0.0'
  },
  onLaunch() {
    console.log('app launch')
  },
  onShow() {
    console.log('app show')
  }
})`

// let ast = babelParser.parse(code, {
//   sourceType: 'module'
// })

// console.log('test ast:', JSON.stringify(ast))

let result = babel.transform(code, {
  plugins: [
    [
      babelPluginVersion,
      {
        "version": version
      }
    ]
  ]
})

console.log('result:', result.code)

