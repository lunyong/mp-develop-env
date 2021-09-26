require('console-color-mr')
const path = require('path')
const fs = require('fs')
const babel = require('@babel/core')
const babelParser = require('@babel/parser')
const fse = require('fs-extra')
const config = require('./config')
const compiler = require('./compiler')
const CompileContext = require('./context')
const chokidar = require('chokidar')
const { PROJECT_CONFIG, miniAppDevFiles, miniAppFiles } = require('./constants')
const babelPluginVersion = require('./babel-plugin-version')

// node编译环境
const nodeEnv = process.env.NODE_ENV
// 生产环境
const isProduction = nodeEnv === 'production'
// 开发环境 
const isDevelopment = nodeEnv === 'development'

const argv = process.argv || []
const vStr = argv[2] || ''
const vArr = vStr.split('=')
const version = vArr[vArr.length - 1] || ''
console.log('mp code version:', version)

// 源码目录名
const srcDir = config.srcDir || 'src'
// 输出目录名.
const distDir = config.distDir || 'dist'

// 源码目录绝对地址
const srcPath = path.resolve(__dirname, '../' + srcDir)
const distPath = path.resolve(__dirname, '../' + distDir)

// 根据源码目录初始化一个编译环境
const ctx = new CompileContext(srcPath, distPath)

/**
 * 监听文件变化
 */
function watchFiles() {
  const watcher = chokidar.watch(srcPath, {
    ignored: /(^|[\/\\])\../, // ignore dotfiles
    persistent: true
  })

  watcher.on('ready', () => {
    console.info('\n开始监听文件...\n')
  }).on('change', filePath => {
    const extname = path.extname(filePath)
    switch (extname) {
      case miniAppDevFiles['SCRIPT']:
        ctx.updateScript(filePath)
        break;
      case miniAppDevFiles['CONFIG']:
        ctx.updateConfig(filePath)
        break
      case miniAppDevFiles['STYLE']:
        ctx.updateStyle(filePath)
        break
      case miniAppDevFiles['TEMPLATE']:
        ctx.updateTemplate(filePath)
        break
      default:
        console.error('没有 ' + filePath + ' 的处理方式')
        break;
    }
  })
}

const modifyAppVersion = function(filePath, version) {
  // console.log('modify app version:', filePath, version)
  let code = fs.readFileSync(filePath, {encoding: 'utf-8'})
  // 把源代码编译成抽象语法树ast
  let ast = babelParser.parse(code, {
    sourceType: 'module'
  })
  // 把ast经过预设presets的插件套装过滤后，再转换回代码
  const result = babel.transformFromAstSync(ast, null, {
    plugins: [
      [
        babelPluginVersion,
        {
          version
        }
      ]
    ]
  })

  fs.writeFileSync(filePath, result.code, {encoding: 'utf-8'})
}

const run = function() {
  // 设置编译器环境
  compiler.setEnv(nodeEnv)
  // 设置排除编译的脚本文件
  compiler.setExcludeScripts(config.excludes)

  // 当控制台传入当前代码的版本信息时，修改app文件中globalData的version字段的值
  if(version) {
    modifyAppVersion(path.resolve(srcPath, './app.js'), version)
  }

  // 开始编译
  ctx.startCompile()

  if(isDevelopment) {
    watchFiles()
  }
}

run()
