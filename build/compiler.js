const path = require('path')
const _ = require('lodash')
const fs = require('fs')
const fse = require('fs-extra')
const babel = require('@babel/core')
const babelParser = require('@babel/parser')
const babelGenerator = require('@babel/generator')
const uglify = require('uglify-js')
const exec = require('child_process').exec
const jsonminify = require('jsonminify')
const htmlmin = require('htmlmin')
const config = require('./config')

const TEXT_DEFAULT = '编译'

class Compiler {
  constructor() {
    // 编译环境，development=开发环境，production=生产环境
    this.env = 'production'
    // 不进行编译操作的js脚本
    this.excludeScripts = []
  }

  /**
   * 设置编译环境
   * @param {*} env 
   */
  setEnv(env) {
    this.env = env
  }

  /**
   * 设置排除在编译操作之外的js脚本
   * @param {String||Array} args 当为String时，表示要排除编译的文件地址；当为Array时，表示要排除编译的文件地址列表
   * 注：文件地址为全路径
   */
  setExcludeScripts(args = []) {
    if(_.isArray(args)) {
      this.excludeScripts = this.excludeScripts.concat(args)
    }else{
      this.excludeScripts.push(args)
    }
  }

  /**
   * 编译js文件
   * @param {*} inputPath 要编译的js文件地址
   * @param {*} outputPath 编译之后的js文件输出地址
   * @param {*} options 
   */
  compileJs(inputPath, outputPath, options = {}) {
    try {
      // 输出路径的文件夹
      const outputDir = path.dirname(outputPath)
      // 确保输出路径的文件夹存在
      fse.ensureDirSync(outputDir)

      // 如果不需要压缩，就不需要经过babel和uglify编译
      if(config.compile && this.excludeScripts.indexOf(inputPath) === -1) {
        let code = fs.readFileSync(inputPath, {encoding: 'utf-8'})
        // 把源代码编译成抽象语法树ast
        let ast = babelParser.parse(code, {
          sourceType: 'module'
        })
        // 把ast经过预设presets的插件套装过滤后，再转换回代码
        const babelResult = babel.transformFromAstSync(ast, null, {
          presets: [
            "@babel/preset-env"
          ],
          plugins: [
            "transform-node-env-inline",
            "minify-dead-code-elimination"
          ]
        })

        if(this.env === 'production') {
          const uglifyResult = uglify.minify(babelResult.code, {
            compress: {
              dead_code: true,
              global_defs: {
                DEBUG: false
              }
            }
          })
          code = uglifyResult.code
        }else{
          code = babelResult.code
        }

        fs.writeFileSync(outputPath, code, {encoding: 'utf-8'})
      }else{
        fse.copySync(inputPath, outputPath)
      }
      
      console.info((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 成功！')
    } catch (error) {
      console.error((options.text || TEXT_DEFAULT) + ' ' + inputPath + '失败！', error)
    }
    
  }

  /**
   * 编译less文件
   * @param {*} inputPath 要编译的less文件地址
   * @param {*} outputPath 编译之后的css文件输出地址
   * @param {*} options 
   */
  compileLess(inputPath, outputPath, options = {}) {
    const cmd = 'lessc ' + inputPath + ' ' + outputPath + ' --clean-css'
    exec(cmd, function(err) {
      if(err) {
        console.error((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 失败!\n', err)
      }else{
        console.info((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 成功!')
      }
    })
  }

  /**
   * 编译模板文件
   * @param {*} inputPath 要编译的模板文件地址
   * @param {*} outputPath 编译之后的模板文件输出地址
   * @param {*} options 
   */
  compileTemplate(inputPath, outputPath, options = {}) {
    try {
      let html = fs.readFileSync(inputPath, {encoding: 'utf-8'})
      html = htmlmin(html)
      fs.writeFileSync(outputPath, html)
      console.info((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 成功!')
    } catch (error) {
      console.error((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 失败!\n', error)
    }
  }

  /**
   * 编译json文件
   * @param {*} inputPath 要编译的json文件地址
   * @param {*} outputPath 编译之后的json文件输出地址
   * @param {*} options 
   */
  compileJSON(inputPath, outputPath, options = {}) {
    try {
      let jsonCode = fs.readFileSync(inputPath, {encoding: 'utf-8'})
      jsonCode = jsonminify(jsonCode)
      fs.writeFileSync(outputPath, jsonCode)
      console.info((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 成功!')
    } catch (error) {
      console.error((options.text || TEXT_DEFAULT) + ' ' + inputPath + ' 失败!\n', error)
    }
  }

  /**
   * 编译图片文件
   * 注：目前图片文件的编译仅以复制实现，因此输入地址可直接传图片文件夹
   * @param {*} inputPath 要编译的图片文件地址
   * @param {*} outputPath 编译之后的图片文件输出地址
   * @param {*} options 
   */
  compileImage(inputPath, outputPath, options = {}) {
    try {
      fse.copySync(inputPath, outputPath)
      console.info('复制 ' + inputPath + ' 成功！')
    } catch (error) {
      console.error('复制 ' + inputPath + ' 失败！\n', error)
    }
  }
}

module.exports = new Compiler()