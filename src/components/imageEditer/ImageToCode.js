//工具类 用于将图像转处理器代码自动整理分组。
class MLogic {
  //芯片数组
  chips = []
  //单个芯片缓存
  chip = []
  //单个绘图块缓存（设置颜色 + 绘制方块*N + 输出至屏幕）
  block = []
  //一个芯片的最大代码行数
  chipMaxLength = 1000
  //一个绘图块的最大代码行数
  blockMaxLength = 20
  //当前绘制的颜色
  color = null
  //处理器名称
  screenName = ''

  //类构造函数
  constructor(screenName) {
    this.screenName = screenName
  }
  //新增一个色块
  addColorBlock(block) {
    const { x, y, width, height } = block
    this.block.push(`draw rect ${x} ${y} ${width} ${height} 0 0`)
    if (this.block.length == this.blockMaxLength - 2) {
      this.encapsulationBlock()
    }
  }
  //改变当前绘图颜色
  setColor(color) {
    if (this.block.length > 0) {
      this.encapsulationBlock()
    }
    this.color = color
  }
  //封装一个绘图块，将绘图块存入芯片缓存
  encapsulationBlock() {
    const block = this.block
    const { r, g, b, a } = this.color
    block.unshift(`draw color ${r} ${g} ${b} ${a} 0 0`)
    block.push(`drawflush ${this.screenName}`)
    if (this.chip.length + block.length > this.chipMaxLength) {
      this.encapsulationChip()
    }
    this.chip.push(...block)
    this.block = []
  }
  //封装芯片存入芯片数组
  encapsulationChip() {
    this.chips.push(this.chip.join('\n'))
    this.chip = []
  }
  //获取芯片数据
  getChips() {
    if (this.block.length > 0) {
      this.encapsulationBlock()
      this.encapsulationChip()
    }
    return this.chips
  }
}

export default class ImageToCode {
  //图片转为处理器代码
  imageToMLogic(screenName, imageDatas) {
    const mlogicList = []
    imageDatas.forEach(imageData => {
      const colorBlocks = this.getColorBlocks(imageData)
      const colorMap = this.getColorMap(colorBlocks)
      const chips = this.getChips(screenName, colorMap)
      mlogicList.push(chips)
    })
    return mlogicList
  }
  //将图片分解为色块
  getColorBlocks(imageData) {
    const statusMap = []
    const colorBlocks = []
    const { width, height } = imageData
    const length = width * height
    for (let i = 0; i < length; i++) {
      statusMap.push(true)
    }
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = y * imageData.width + x
        if (statusMap[index]) {
          colorBlocks.push(this.getMaxSizeBlock(imageData, x, y, statusMap))
        }
      }
    }
    return colorBlocks
  }
  //将色块按颜色进行分类集合
  getColorMap(colorBlocks) {
    const map = new Map()
    colorBlocks.forEach(block => {
      const { color, box } = block
      const colorText = `${color.r},${color.g},${color.b},${color.a}`
      if (!map.has(colorText)) {
        map.set(colorText, [])
      }
      const list = map.get(colorText)
      list.push(block)
    })
    return map
  }
  //获取某个像素的颜色
  getpixel(image, x, y) {
    let index = (image.width * y + x) * 4
    const r = image.data[index++]
    const g = image.data[index++]
    const b = image.data[index++]
    const a = image.data[index++]
    return {
      r: r,
      g: g,
      b: b,
      a: a,
    }
  }
  //尝试获取当前坐标下最大的色块
  getMaxSizeBlock(image, x, y, statusMap) {
    const originColor = this.getpixel(image, x, y)
    if (originColor.a == 0) {
      return null
    }
    let maxX = -1
    let maxY = 0
    const maxSize = {
      area: 0,
      x: 0,
      y: 0,
    }
    while (true) {
      let mx = 0
      const color = this.getpixel(image, x, y + maxY)
      if (!this.isSameColor(originColor, color)) {
        break
      }
      mx++
      while (true) {
        if (x + mx >= image.width) {
          break
        }
        const color = this.getpixel(image, x + mx, y + maxY)
        if (this.isSameColor(originColor, color)) {
          mx++
        } else {
          break
        }
      }
      maxY++
      if (maxX == -1 || mx < maxX) {
        maxX = mx
      }
      const area = maxY * maxX
      if (area > maxSize.area) {
        maxSize.area = area
        maxSize.x = maxX
        maxSize.y = maxY
      }
      if (y + maxY >= image.height) {
        break
      }
    }
    maxX = maxSize.x
    maxY = maxSize.y
    for (let sy = 0; sy < maxY; sy++) {
      const ty = y + sy
      for (let sx = 0; sx < maxX; sx++) {
        const tx = x + sx
        const index = ty * image.width + tx
        statusMap[index] = false
      }
    }
    return {
      color: originColor,
      block: {
        x: x,
        y: image.height - y - maxY,
        width: maxX,
        height: maxY,
      },
    }
  }
  //颜色是否相等
  isSameColor(color1, color2) {
    return (
      color1.r == color2.r &&
      color1.g == color2.g &&
      color1.b == color2.b &&
      color1.a == color2.a
    )
  }
  //将色块信息转为处理器代码
  getChips(screenName, colorMap) {
    //创建代码构建器
    const mLogic = new MLogic(screenName)
    for (let item of colorMap) {
      const blockList = item[1]
      mLogic.setColor(blockList[0].color)
      blockList.forEach(item => {
        mLogic.addColorBlock(item.block)
      })
    }
    return mLogic.getChips()
  }
}
