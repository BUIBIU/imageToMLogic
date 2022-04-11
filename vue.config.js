module.exports = {
    publicPath: "./",
    chainWebpack: config => {
        config
            .plugin('html')
            .tap(args => {
                args[0].title = '图片转逻辑工具V2.0'
                return args
            })
    }
}