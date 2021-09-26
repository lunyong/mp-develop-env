const config = require('./config')

// 小程序平台类型
const miniapp = config.miniapp

// 各端原生小程序支持的主要文件类型
const MINI_APP_FILES = {
  'ks': {
    TEMPLATE: '.ksml',
    STYLE: '.css',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'weapp': {
    TEMPLATE: '.wxml',
    STYLE: '.wxss',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'swan': {
    TEMPLATE: '.swan',
    STYLE: '.css',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'tt': {
    TEMPLATE: '.ttml',
    STYLE: '.ttss',
    SCRIPT: '.js',
    CONFIG: '.json'
  }
}

// 开发者进行开发时各端使用的文件类型
const MINI_APP_DEV_FILES = {
  'ks': {
    TEMPLATE: '.ksml',
    STYLE: '.less',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'weapp': {
    TEMPLATE: '.wxml',
    STYLE: '.less',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'swan': {
    TEMPLATE: '.swan',
    STYLE: '.less',
    SCRIPT: '.js',
    CONFIG: '.json'
  },
  'tt': {
    TEMPLATE: '.ttml',
    STYLE: '.less',
    SCRIPT: '.js',
    CONFIG: '.json'
  }
}

// 各端项目整体配置文件
const PROJECT_CONFIG = {
  'ks': 'project.config.json',
  'weapp': 'project.config.json',
  'swan': 'project.swan.json',
  'tt': 'project.config.json'
}

exports.MINI_APP_FILES = MINI_APP_FILES

exports.MINI_APP_DEV_FILES = MINI_APP_DEV_FILES

exports.PROJECT_CONFIG = PROJECT_CONFIG

exports.miniAppFiles = MINI_APP_FILES[miniapp]
exports.miniAppDevFiles = MINI_APP_DEV_FILES[miniapp]
exports.projectConfig = PROJECT_CONFIG[miniapp]