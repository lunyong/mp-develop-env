const fs = require('fs')
const fse = require('fs-extra')
const path = require('path')
const utils = require('./utils')
const config = require('./config')
const analyzer = require('./analyzer')
const compiler = require('./compiler')
const dependencyTree = require('dependency-tree')
const { PROJECT_CONFIG, miniAppDevFiles, miniAppFiles } = require('./constants')

// 原生小程序支持的整体项目配置文件
const miniappProject = PROJECT_CONFIG[config.miniapp]

/**
 * 编译环境
 */
class CompileContext {
  constructor(srcPath, distPath) {
    this.srcPath = srcPath
    this.distPath = distPath
    this.pages = []
    this.components = []
    this.scripts = []
    this.styles = []
    this.templates = []
    this.configs = []
  }

  startCompile() {
    if(!this.srcPath || !this.distPath) {
      throw new Error('未指定启动编译的源码目录')
    }

    console.info('开始清空dist文件夹...')
    // 清空dist文件
    fse.emptyDirSync(this.distPath)

    console.info('开始分析并编译app及其依赖...')
    // 解析app文件，得到app.js的依赖树和项目入口页面
    const appData = analyzer.analysisApp(this.srcPath + '/app')
    // 把项目配置文件project.config.json添加到配置文件列表中
    appData.configs.push(this.srcPath + '/' + miniappProject)

    this.compileScripts(appData.scripts)
    this.compileStyles(appData.styles)
    this.compileConfigs(appData.configs)
    this.compileTemplates(appData.templates)

    console.info('开始分析并编译入口页面及其依赖...')
    const pages = appData.pages || []
    pages.map((item, index) => {
      const pagePath = path.resolve(this.srcPath, item)
      const pageData = analyzer.analysisComponent(pagePath)
      this.compileScripts(pageData.scripts)
      this.compileStyles(pageData.styles)
      this.compileConfigs(pageData.configs)
      this.compileTemplates(pageData.templates)
    })

    console.info('开始复制图片资源...')
    compiler.compileImage(this.srcPath + '/images', this.distPath + '/images')


  }

  /**
   * 编译脚本
   * @param {*} scripts 脚本列表
   * @param {*} options 
   */
  compileScripts(scripts = [], options = {}) {
    if(scripts.length) {
      scripts.map(inputPath => {
        let isCompile = false
        if(options.modify) {
          isCompile = true
        }else{
          isCompile = this.scripts.indexOf(inputPath) === -1
        }

        if(isCompile) {
          const outputPath = inputPath.replace(this.srcPath, this.distPath)
          compiler.compileJs(inputPath, outputPath, options)

          this.scripts.push(inputPath)
        }
      })
    }
  }

  /**
   * 编译样式
   * @param {*} styles 
   * @param {*} options 
   */
  compileStyles(styles = [], options = {}) {
    if(styles.length) {
      styles.map(inputPath => {
        let isCompile = false
        if(options.modify) {
          isCompile = true
        }else{
          isCompile = this.styles.indexOf(inputPath) === -1
        }

        if(isCompile) {
          const outputPath = inputPath.replace(this.srcPath, this.distPath).replace(miniAppDevFiles['STYLE'], miniAppFiles['STYLE'])
          compiler.compileLess(inputPath, outputPath, options)

          this.styles.push(inputPath)
        }
      })
    }
  }

  /**
   * 编译模板
   * @param {*} templates 
   * @param {*} options 
   */
  compileTemplates(templates = [], options = {}) {
    if(templates.length) {
      templates.map(inputPath => {
        let isCompile = false
        if(options.modify) {
          isCompile = true
        }else{
          isCompile = this.templates.indexOf(inputPath) === -1
        }

        if(isCompile) {
          const outputPath = inputPath.replace(this.srcPath, this.distPath)
          compiler.compileTemplate(inputPath, outputPath, options)

          this.templates.push(inputPath)
        }
      })
    }
  }

  /**
   * 编译配置文件
   * @param {*} configs 
   * @param {*} options 
   */
  compileConfigs(configs = [], options = {}) {
    if(configs.length) {
      configs.map(inputPath => {
        let isCompile = false
        if(options.modify) {
          isCompile = true
        }else{
          isCompile = this.configs.indexOf(inputPath) === -1
        }

        if(isCompile) {
          const outputPath = inputPath.replace(this.srcPath, this.distPath)
          compiler.compileJSON(inputPath, outputPath, options)

          this.configs.push(inputPath)
        }
      })
    }
  }

  /**
   * 编译图片
   * @param {*} imgSrcPath 
   */
  compileImages(inputPath) {
    const imgDistPath = inputPath.replace(this.srcPath, this.distPath)
    fse.copySync(imgSrcPath, imgDistPath)
    console.info('复制 ' + inputPath + ' 成功！')
  }

  /**
   * 更新脚本
   * @param {*} filePath 
   */
  updateScript(filePath) {
    // 编译当前要更新的脚本
    this.compileScripts([filePath], {
      text: '修改',
      modify: true
    })

    // 获取当前更新脚本的依赖列表
    const dependencyList = dependencyTree.toList({
      filename: filePath,
      directory: process.cwd()
    })
    // 对依赖列表中新加入的脚本进行编译
    dependencyList.map(item => {
      if(this.scripts.indexOf(item) === -1) {
        const depDistPath = item.replace(this.srcPath, this.distPath)
        compiler.compileJs(item, depDistPath, {text: '添加'})
        this.scripts.push(item)
      }
    })

  }

  /**
   * 更新配置文件
   * @param {*} filePath 
   */
  updateConfig(filePath) {
    // 编译当前要更新的配置文件
    this.compileConfigs([filePath], {
      text: '修改',
      modify: true
    })
  
    // 读取配置文件，获取当前配置文件所依赖的组件，并对组件进行分析处理，最后对新加入的组件进行编译
    const configText = fs.readFileSync(filePath, {encoding: 'utf-8'})
    const componentConfig = JSON.parse(configText || '{}')
    const usingComponents = componentConfig.usingComponents || {}
  
    for (const key in usingComponents) {
      if (usingComponents.hasOwnProperty(key)) {
        const value = usingComponents[key]
        const depCompPath = path.resolve(path.dirname(filePath), value)

        if(this.components.indexOf(depCompPath) === -1) {
          const componentData = analyzer.analysisComponent(depCompPath)

          this.compileScripts(componentData.scripts, {text: '添加'})
          this.compileStyles(componentData.styles, {text: '添加'})
          this.compileTemplates(componentData.templates, {text: '添加'})
          this.compileConfigs(componentData.configs, {text: '添加'})
          
          this.components.push(depCompPath)
        }
  
      }
    }
  }

  /**
   * 更新样式文件
   * @param {*} filePath 
   */
  updateStyle(filePath) {
    // 编译当前要更新的样式文件
    this.compileStyles([filePath], {
      text: '修改',
      modify: true
    })
  
    // 获取当前样式文件的依赖列表，并对新加入的样式文件进行编译
    const dependencyList = dependencyTree.toList({
      filename: filePath,
      directory: process.cwd()
    })
  
    dependencyList.map(item => {
      if(this.styles.indexOf(item) === -1) {
        const depDistPath = item.replace(this.srcPath, this.distPath)
        compiler.compileLess(filePath, depDistPath.replace(miniAppDevFiles['STYLE'], miniAppFiles['STYLE']), {text: '添加'})
        this.styles.push(item)
      }
    })
  }

  /**
   * 更新模板文件
   * @param {*} filePath 
   */
  updateTemplate(filePath) {
    // 编译要更新的模板文件
    this.compileTemplates([filePath], {
      text: '修改',
      modify: true
    })
    
    // 获取当前模板文件的依赖列表，对新加入的模板文件进行编译
    const dependencyList = analyzer.analysisTemplate(filePath)
  
    dependencyList.map(item => {
      if(this.templates.indexOf(item) === -1) {
        const depDistPath = item.replace(this.srcPath, this.distPath)
        compiler.compileTemplate(filePath, depDistPath, {text: '添加'})
        this.templates.push(item)
      }
    })
  }

}

module.exports = CompileContext