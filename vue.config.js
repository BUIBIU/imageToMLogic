module.exports = {
  publicPath: './',
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = '图片转逻辑工具V2.0'
      return args
    })
    config.module
      .rule('worker')
      .test(/\.worker\.js$/)
      .use('worker-loader')
      .loader('worker-loader')
      .end()
    config.output.globalObject('this')
    config.module.rule('js').exclude.add(/\.worker\.js$/)
  },
  parallel: false,
}
