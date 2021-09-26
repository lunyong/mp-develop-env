const glob = require('glob')
const fs = require('fs')
const path = require('path')

const jsPattern = './src/**/*.js'
// const jsPattern = './src/config/host.js'
const lessPattern = './src/**/*.less'
const jsonPattern = './src/**/*.json'
const ksmlPattern = './src/**/*.ksml'
const pngPattern = './src/**/*.png'
const jpgPattern = './src/**/*.jpg'
const jpegPattern = './src/**/*.jpeg'

// 提取模板中的import标签
const IMPORT_REG_EXP = /<import[^>]*>(<\/import>)?/gi
// 提取import标签中的src内容
const IMPORT_SRC_REG_EXP = /src="(.*)"/

/**
 * 清空文件夹
 * @param {*} pathStr 文件夹路径
 */
const cleardir = function(pathStr) {
  let files = [];
  if(fs.existsSync(pathStr)){
    files = fs.readdirSync(pathStr);
    files.forEach((file, index) => {
      let curPath = pathStr + "/" + file;
      if(fs.statSync(curPath).isDirectory()){
        cleardir(curPath); //递归删除文件夹
      } else {
        fs.unlinkSync(curPath); //删除文件
      }
    })
    if(pathStr !== path.resolve(__dirname, '../dist')) {
      fs.rmdirSync(pathStr)
    }
    
  }else {
    console.log(pathStr)
  }
}

/**
 * 复制文件夹
 * @param {*} src 源目录
 * @param {*} dist 目标目录
 */
const copydir = function(src, dist) {
  const files = fs.readdirSync(src)
  files.forEach((file, index) => {
    const currPath = src + '/' + file
    if(fs.statSync(currPath).isDirectory()) {
      const distDir = dist + '/' + file
      fs.mkdirSync(distDir)
      copydir(currPath, distDir)
    }
  })
}


/**
 * 
 * 创建 env 文件
 * **/ 
var creatEnvFile=function(){
  return new Promise((resolve, reject)=>{
    let env=process.env.PPKSMP_ENV
    fs.writeFile( path.resolve(__dirname, '../dist/env.js'), "var env = '"+env+"';export { env }",'UTF-8' ,function(err) {
      if(err) {
        reject()
        console.log(err);
      }
      resolve()
    });
  })
}

module.exports = {
  creatEnvFile,
  cleardir,
  copydir,
  findJsFiles() {
    return new Promise((resolve, reject) => {
      glob(jsPattern, function(err, files) {
        if(err) {
          console.error('获取js文件错误', err)
          reject()
        }else{
          resolve(files)
        }
      })
    })
  },
  fildLessFiles() {
    return new Promise((resolve, reject) => {
      glob(lessPattern, function(err, files) {
        if(err) {
          console.error('获取less文件错误', err)
          reject()
        }else{
          resolve(files)
        }
      })
    })
  },
  fildJSONFiles() {
    return new Promise((resolve, reject) => {
      glob(jsonPattern, function(err, files) {
        if(err) {
          console.error('获取json文件错误', err)
          reject()
        }else{
          resolve(files)
        }
      })
    })
  },
  fildKSMLFiles() {
    return new Promise((resolve, reject) => {
      glob(ksmlPattern, function(err, files) {
        if(err) {
          console.error('获取ksml文件错误', err)
          reject()
        }else{
          resolve(files)
        }
      })
    })
  },
  fileImageFiles() {
    return new Promise((resolve, reject) => {
      try {
        const pngFiles = glob.sync(pngPattern) || []
        const jpgFiles = glob.sync(jpgPattern) || []
        const jpegFiles = glob.sync(jpegPattern) || []
        let files = pngFiles.concat(jpgFiles)
        files = files.concat(jpegFiles)
        resolve(files)
      } catch (error) {
        console.log('获取img文件错误', error)
        reject()
      }
    })
  },
  getJSON(file) {
    const json = fs.readFileSync(file + '.json', {encoding: 'utf-8'})
    return json ? JSON.parse(json) : ''
  },
  templateDependencyTree(filePath) {
    filePath = path.resolve(filePath)
    const tree = {}
    tree[filePath] = {}
    const tmpCode = fs.readFileSync(filePath, {encoding: 'utf-8'})
    const importMatches = tmpCode.match(IMPORT_REG_EXP)
    if(importMatches) {
      importMatches.map(item => {
        const srcMatches = item.match(IMPORT_SRC_REG_EXP)
        if(srcMatches) {
          let matchSrc = srcMatches[1]
          const currDirname = path.dirname(filePath)
          matchSrc = path.resolve(currDirname, matchSrc)
          tree[filePath][matchSrc] = {}
        }
      })
    }
    return tree
  }
}