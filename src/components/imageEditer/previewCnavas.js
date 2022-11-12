//图像处理类
export default class PreviewCanvas {
  //屏幕相关数据
  screenData = {
    normal: {
      url: require('@/assets/images/blocks/logic/logic-display.png'),
      image: null,
      resolution: 80,
      border: 8,
      size: 96,
      type: 'logic-display',
    },
    large: {
      url: require('@/assets/images/blocks/logic/large-logic-display.png'),
      image: null,
      resolution: 176,
      border: 8,
      size: 192,
      type: 'large-logic-display',
    },
  }
  //屏幕相关设置
  screenOption = {
    //屏幕数量
    screenCount: {
      x: 1,
      y: 1,
    },
    //当前选择的屏幕数据
    screenData: null,
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

  //构造函数
  constructor(image) {
    this.initImageFile().then(() => {
      this.outputImage = image
      this.setScreenType('large')
      this.refreshOutputImage()
    })
  }
  //初始化图片处理器，预加载图片资源
  initImageFile() {
    function getImage(url) {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.addEventListener('load', function (e) {
          resolve(this)
        })
        img.addEventListener('error', () => {
          console.error(`Failed to get image(${url})`)
          reject()
        })
        img.src = url
      })
    }
    const requestList = []
    for (let key in this.screenData) {
      const item = this.screenData[key]
      const request = getImage(item.url)
        .then(res => {
          item.image = res
          return Promise.resolve()
        })
        .catch(() => {})
      requestList.push(request)
    }
    return new Promise((resolve, reject) => {
      Promise.all(requestList)
        .then(res => {
          resolve()
        })
        .catch(() => {
          reject()
        })
    })
  }
  //设置当前的屏幕类型）
  setScreenType(name) {
    this.screenOption.screenData = this.screenData[name]
    this.refreshOutputImage()
  }
  //设置当前的屏幕数量
  setScreenCount(x, y) {
    this.screenOption.screenCount = {
      x: x,
      y: y,
    }
    this.refreshOutputImage()
  }
  //设置是否忽略边框
  setSreenIgnoreBorder(ignoreBorder) {
    this.screenOption.ignoreBorder = ignoreBorder
    // this.refreshOutputImage()
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
    const { size, image, border, resolution } = this.screenOption.screenData
    //绘制屏幕边框
    for (let y = 0; y < screenY; y++) {
      for (let x = 0; x < screenX; x++) {
        let posX = x * size
        let posY = y * size
        ctx.drawImage(image, posX, posY)
      }
    }
    //绘制切片后的各个图像
    if (this.inputImage) {
      const imageWidth = this.inputImage.width
      const imageHeight = this.inputImage.height
      let scale = 0
      if (this.screenOption.ignoreBorder) {
        scale = imageWidth / (size * screenX - 2 * border)
      } else {
        scale = imageWidth / (resolution * screenX)
      }
      const realSizeX = resolution * scale
      const realSizeY = realSizeX
      for (let y = 0; y < screenY; y++) {
        for (let x = 0; x < screenX; x++) {
          const posX = x * size
          const posY = y * size
          let cutPosX = 0
          let cutPosY = 0
          if (this.screenOption.ignoreBorder) {
            cutPosX = (x * (resolution + 2 * border) * scale) | 0
            cutPosY = (y * (resolution + 2 * border) * scale) | 0
          } else {
            cutPosX = (x * resolution * scale) | 0
            cutPosY = (y * resolution * scale) | 0
          }
          let processCanvas = document.createElement('canvas')
          this.processCanvasList.push(processCanvas)
          processCanvas.width = resolution
          processCanvas.height = resolution
          let processCtx = processCanvas.getContext('2d')
          processCtx.drawImage(
            this.inputImage,
            cutPosX,
            cutPosY,
            realSizeX,
            realSizeY,
            0,
            0,
            resolution,
            resolution,
          )
          this.compressImage(processCanvas)
          let imageData = processCtx.getImageData(0, 0, resolution, resolution)
          ctx.putImageData(imageData, posX + border, posY + border)
          // ctx.drawImage(this.inputImage, cutPosX, cutPosY, realSizeX, realSizeY, posX + border, posY + border, resolution, resolution)
        }
      }
    }
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
    if (this.screenOption.ignoreBorder) {
      const { size, border } = this.screenOption.screenData
      const width = x * size - 2 * border
      const height = y * size - 2 * border
      return [width, height]
    } else {
      return [x, y]
    }
  }
  //设置压缩强度
  setCompress(n) {
    this.screenOption.compress = n
    this.refreshOutputImage()
  }
  //设置屏幕的名称
  setScreenName(screenName) {
    this.screenOption.screenName = screenName
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
    const imageDatas = []
    this.processCanvasList.forEach(canvas => {
      const ctx = canvas.getContext('2d')
      const width = canvas.width
      const height = canvas.height
      const imageData = ctx.getImageData(0, 0, width, height)
      imageDatas.push(imageData)
    })
    return imageDatas
  }
}
