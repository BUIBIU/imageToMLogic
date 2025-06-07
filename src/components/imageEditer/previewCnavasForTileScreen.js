//图像处理类
export default class PreviewCanvas {
  url = require('@/assets/images/blocks/logic/tile-logic-display.png')
  image = null
  borders = {
    top: null,
    bottom: null,
    left: null,
    right: null,
    top_left: null,
    top_right: null,
    bottom_left: null,
    bottom_right: null,
  }
  //屏幕相关设置
  screenOption = {
    //屏幕数量
    screenCount: {
      x: 1,
      y: 1,
    },
    //当前选择的屏幕数据
    screenData: {
      size: 32,
      border: 3,
      type: 'tile-logic-display',
    },
    //是否忽略边框
    ignoreBorder: true,
    //压缩等级
    compress: 5,
    //屏幕名称
    screenName: '',
  }
  //输出的图像img标签
  outputImage = null
  //输入的图像base64数据
  inputImage = null
  //切片图像的数据
  processCanvasList = []
  //是否允许刷新图像
  canRefresh = false
  //加载状态控制
  readyPromise = null
  readyResolve = null
  //构造函数
  constructor(image, options = {}) {
    this.readyPromise = new Promise(resolve => {
      this.readyResolve = resolve
    })
    ;(async () => {
      await this.initImageFile()
      this.outputImage = image
      this.getBorders()
      const { x, y, image: inputImage, compress } = options
      this.setScreenCount(x || 1, y || 1)
      if (inputImage) {
        this.setImage(inputImage)
      }
      if (compress !== undefined) {
        this.setCompress(compress)
      }
      this.canRefresh = true
      this.refreshOutputImage()
      this.readyResolve()
    })()
  }
  afterReady() {
    return this.readyPromise
  }
  //初始化图片处理器，预加载图片资源
  initImageFile() {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.addEventListener('load', e => {
        this.image = img
        resolve(img)
      })
      img.addEventListener('error', () => {
        console.error(`Failed to get image(${url})`)
        reject()
      })
      img.src = this.url
    })
  }
  getBorders() {
    const canvas = document.createElement('canvas')
    canvas.width = 32
    canvas.height = 32
    const ctx = canvas.getContext('2d', { willReadFrequently: true })
    ctx.drawImage(this.image, 0, 0)
    this.borders.top_left = ctx.getImageData(0, 0, 6, 6)
    this.borders.top_right = ctx.getImageData(26, 0, 6, 6)
    this.borders.bottom_left = ctx.getImageData(0, 26, 6, 6)
    this.borders.bottom_right = ctx.getImageData(26, 26, 6, 6)
    this.borders.top = ctx.getImageData(6, 0, 20, 6)
    this.borders.left = ctx.getImageData(0, 6, 6, 20)
    this.borders.right = ctx.getImageData(26, 6, 6, 20)
    this.borders.bottom = ctx.getImageData(6, 26, 20, 6)
    ctx.clearRect(0, 0, 32, 32)
    ctx.putImageData(this.borders.top, 0, 0)
    ctx.putImageData(this.borders.top, 12, 0)
    this.borders.top = ctx.getImageData(0, 0, 32, 6)
    ctx.putImageData(this.borders.left, 0, 0)
    ctx.putImageData(this.borders.left, 0, 12)
    this.borders.left = ctx.getImageData(0, 0, 6, 32)
    ctx.putImageData(this.borders.right, 26, 0)
    ctx.putImageData(this.borders.right, 26, 12)
    this.borders.right = ctx.getImageData(26, 0, 6, 32)
    ctx.putImageData(this.borders.bottom, 0, 26)
    ctx.putImageData(this.borders.bottom, 12, 26)
    this.borders.bottom = ctx.getImageData(0, 26, 32, 6)
  }
  //设置当前的屏幕数量
  setScreenCount(x, y) {
    this.screenOption.screenCount = { x, y }
  }
  //绘制处理后的图像
  drawImage() {
    const canvas = document.createElement('canvas')
    this.changeCanvasSize(canvas)
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = 'rgb(0,0,0)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    // console.log(canvas);
    this.drawScreens(canvas)
    return canvas
  }
  //设置画板尺寸
  changeCanvasSize(canvas) {
    const { size } = this.screenOption.screenData
    const { x, y } = this.screenOption.screenCount
    const imageWidth = size * x
    const imageHeight = size * y
    canvas.width = imageWidth
    canvas.height = imageHeight
  }
  //绘制每个屏幕切片
  drawScreens(canvas) {
    const ctx = canvas.getContext('2d')
    const screenX = this.screenOption.screenCount.x
    const screenY = this.screenOption.screenCount.y

    ctx.fillStyle = 'rgb(86,86,102)'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    //绘制屏幕边框
    for (let x = 0; x < screenX; x++) {
      ctx.putImageData(this.borders.top, x * 32, 0)
      ctx.putImageData(this.borders.bottom, x * 32, screenY * 32 - 6)
    }
    for (let y = 0; y < screenY; y++) {
      ctx.putImageData(this.borders.left, 0, y * 32)
      ctx.putImageData(this.borders.right, screenX * 32 - 6, y * 32)
    }
    ctx.putImageData(this.borders.top_left, 0, 0)
    ctx.putImageData(this.borders.top_right, screenX * 32 - 6, 0)
    ctx.putImageData(this.borders.bottom_left, 0, screenY * 32 - 6)
    ctx.putImageData(
      this.borders.bottom_right,
      screenX * 32 - 6,
      screenY * 32 - 6,
    )

    if (!this.inputImage) {
      return
    }
    const imgWidth = canvas.width - 6
    const imgHeight = canvas.height - 6
    const drawWidth = canvas.width - 12
    const drawHeight = canvas.height - 12
    let processCanvas = document.createElement('canvas')
    let processCtx = processCanvas.getContext('2d')
    processCanvas.width = imgWidth
    processCanvas.height = imgHeight
    processCtx.drawImage(this.inputImage, 0, 0, imgWidth, imgHeight)
    this.compressImage(processCanvas)
    this.processCanvasList.push(processCanvas)
    ctx.drawImage(
      processCanvas,
      0,
      0,
      imgWidth,
      imgHeight,
      6,
      6,
      drawWidth,
      drawHeight,
    )
  }
  //输出处理后的预览图片地址
  output(canvas) {
    this.outputImage.width = canvas.width
    this.outputImage.height = canvas.height
    const ctx = this.outputImage.getContext('2d')
    ctx.drawImage(canvas, 0, 0)
    // this.outputImage.src = canvas.toDataURL('image/png')
  }
  //刷新输出的预览图片
  refreshOutputImage() {
    if (!this.canRefresh) return
    this.processCanvasList = []
    const canvas = this.drawImage()
    this.output(canvas)
  }
  //设置输入的图片
  setImage(base64) {
    const img = new Image()
    const vue = this
    img.addEventListener('load', function (e) {
      vue.inputImage = this
      vue.refreshOutputImage()
    })
    img.src = base64
  }
  //返回当前真实裁剪的长宽比（忽略边框时，裁剪的区域的长宽比不等于屏幕数量的长宽比）
  getAspect() {
    const { x, y } = this.screenOption.screenCount
    const { size } = this.screenOption.screenData
    const width = x * size - 6
    const height = y * size - 6
    return [1, height / width]
  }
  //设置压缩强度
  setCompress(n) {
    this.screenOption.compress = n
    this.refreshOutputImage()
  }
  //压缩图像
  compressImage(canvas) {
    const ctx = canvas.getContext('2d')
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
    const data = imageData.data
    const length = canvas.width * canvas.height

    const k = Math.pow(2, this.screenOption.compress)
    const round = Math.round
    for (let i = 0; i < length; i++) {
      const index = i * 4
      data[index] = round(data[index] / k) * k
      index++
      data[index] = round(data[index] / k) * k
      index++
      data[index] = round(data[index] / k) * k
    }
    ctx.putImageData(imageData, 0, 0)
  }
  getImageData() {
    return this.processCanvasList.map(canvas => {
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const imageData = ctx.getImageData(0, 0, width, height)
      return imageData
    })
  }
}
