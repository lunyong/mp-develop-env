const path = require('path')
const fs = require('fs')
const utils = require('./utils')
const _ = require('lodash')
const dependencyTree = require('dependency-tree')
const { miniAppDevFiles } = require('./constants')
const config = require('./config')

module.exports = {
  /**
   * 解析app文件，获取app依赖的脚本、样式、配置信息和页面列表
   * @param {String} appFileName app文件路径名
   * @returns {Object} scripts: 脚本列表；styles：样式列表；configs：配置列表；pages：页面列表
   */
  analysisApp(appFileName) {
    // 脚本文件全路径
    const appScriptPath = path.resolve(appFileName + miniAppDevFiles['SCRIPT'])
    // 配置文件全路径
    const appConfigPath = path.resolve(appFileName + miniAppDevFiles['CONFIG'])
    // 样式文件全路径
    const appStylePath = path.resolve(appFileName + miniAppDevFiles['STYLE'])

    const scripts = dependencyTree.toList({
      filename: appScriptPath,
      directory: process.cwd()
    })
    const styles = dependencyTree.toList({
      filename: appStylePath,
      directory: process.cwd()
    })
  
    // 读取配置文件内容
    const configContent = fs.readFileSync(appConfigPath, {encoding: 'utf-8'})
    const appConfig = JSON.parse(configContent)
    const pages = appConfig.pages || []
  
    return {
      scripts,
      styles,
      pages,
      configs: [appConfigPath]
    }
    
  },
  /**
   * 解析组件，获取传入组件依赖的脚本、样式、模板和配置
   * 该组件会递归获取当前组件所依赖的所有文件
   * @param {*} filename 组件路径名
   * @returns {Object} scripts: 脚本列表；styles：样式列表；templates：模板列表；configs：配置列表；
   */
  analysisComponent(filename) {
    // 脚本文件全路径
    const scriptPath = path.resolve(filename + miniAppDevFiles['SCRIPT'])
    // 配置文件全路径
    const configPath = path.resolve(filename + miniAppDevFiles['CONFIG'])
    // 样式文件全路径
    const stylePath = path.resolve(filename + miniAppDevFiles['STYLE'])
    // 模板文件全路径
    const tmpPath = path.resolve(filename + miniAppDevFiles['TEMPLATE'])

    let scripts = dependencyTree.toList({
      filename: scriptPath,
      directory: process.cwd()
    })

    let styles = dependencyTree.toList({
      filename: stylePath,
      directory: process.cwd()
    })
  
    // 获取模板依赖树列表
    let templates = this.analysisTemplate(tmpPath)
  
    let configs = [configPath]

    // 把整理过的组件记录下来
    let components = [filename]
  
    // 读取组件配置文件内容
    const configText = fs.readFileSync(configPath, {encoding: 'utf-8'})
    const componentConfig = JSON.parse(configText || '{}')
    // 获取该组件所有依赖的组件列表之后，分别递归取得所有依赖信息，并返回给最初调用方
    const usingComponents = componentConfig.usingComponents || {}
    for (const key in usingComponents) {
      if (usingComponents.hasOwnProperty(key)) {
        const value = usingComponents[key]
        const depCompPath = path.resolve(filename, '../' + value)
        const componentData = this.analysisComponent(depCompPath)

        scripts = scripts.concat(componentData.scripts)
        styles = styles.concat(componentData.styles)
        templates = templates.concat(componentData.templates)
        configs = configs.concat(componentData.configs)
        components = components.concat(componentData.components)

      }
    }

    // 要先去重
    return {
      scripts: Array.from(new Set(scripts)),
      styles: Array.from(new Set(styles)),
      templates: Array.from(new Set(templates)),
      configs: Array.from(new Set(configs)),
      components: Array.from(new Set(components))
    }
  },
  /**
   * 分析模板文件，返回模板依赖列表
   * @param {*} filePath 
   */
  analysisTemplate(filePath) {
    const templateTree = utils.templateDependencyTree(filePath)
    return this.getDependencyList(templateTree)
  },
  /**
   * 根据传入的依赖树获取依赖列表
   * @param {*} tree 
   */
  getDependencyList(tree) {
    let arrs = []
    for (const key in tree) {
      if (tree.hasOwnProperty(key)) {
        const element = tree[key];

        arrs.push(key)
        
        if(!_.isEmpty(element)) {
          const subArrs = this.getDependencyList(element)
          arrs = arrs.concat(subArrs)
        }
      }
    }
    return Array.from(new Set(arrs))
  }
}