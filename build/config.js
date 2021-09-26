const path = require('path')

module.exports = {
  miniapp: 'ks',
  minify: true,
  compile: true,
  excludes: [
    path.resolve(__dirname, '../src/utils/dfp.js'),
    path.resolve(__dirname, '../src/utils/redux.js')
  ],
  srcDir: 'src',
  distDir: 'dist'
}