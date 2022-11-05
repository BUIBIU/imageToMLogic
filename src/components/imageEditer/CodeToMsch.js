import Msch from '@/msch'
import { Block, LogicBlock } from '@/msch/blocks'
export default class CodeToMsch {
  countX = 0
  countY = 0
  allScreenSize = {}
  linkMaxLength = 12.75
  screenList = []
  logicBlockList = []
  static directionList = [
    { x: 1, y: 0 },
    { x: 0, y: 1 },
    { x: -1, y: 0 },
    { x: 0, y: -1 },
  ]
  static screenData = {
    'large-logic-display': {
      size: 6,
      pos: {
        x: 2,
        y: 3,
      },
      linkMaxLength: 12.75,
    },
    'logic-display': {
      size: 3,
      pos: {
        x: 1,
        y: 1,
      },
      linkMaxLength: 11.402,
    },
  }
  box = {}
  point = {}
  direction = 0
  screenName = ''
  screenType = ''
  mschName = ''
  mschDescription = ''
  screenSize = 0
  constructor(
    screenCode,
    screenName,
    screenType,
    mschName,
    mschDescription,
    countX,
    countY,
  ) {
    this.mschName = mschName
    this.mschDescription = mschDescription
    this.screenName = screenName
    this.screenType = screenType
    this.countX = countX
    this.countY = countY
    const screen = CodeToMsch.screenData[screenType]
    const screenSize = screen.size
    this.screenSize = screenSize
    this.linkMaxLength = screen.linkMaxLength
    this.allScreenSize = {
      x: screenSize * countX,
      y: screenSize * countY,
    }
    const center = screenSize / 2 - 0.5
    for (let y = 0; y < countY; y++) {
      for (let x = 0; x < countX; x++) {
        const index = y * countX + x
        const codes = screenCode[index]
        const blockCenter = {
          x: center + x * screenSize,
          y: center + y * screenSize,
        }
        const pos = {
          x: screen.pos.x + x * screenSize,
          y: screen.pos.y + y * screenSize,
        }
        this.screenList.push({
          index,
          codes,
          center: blockCenter,
          pos,
        })
      }
    }
    this.box = {
      minX: 0,
      minY: -1,
      maxX: this.allScreenSize.x - 1,
      maxY: this.allScreenSize.y - 1,
    }
    this.point = {
      x: -1,
      y: -1,
    }
    this.direction = 0
  }
  getMsch() {
    if (this.setLogicBlockPos()) {
      return this.createMsch()
    }
    return null
  }
  createMsch() {
    const msch = new Msch()
    const { minX, minY, maxX, maxY } = this.box
    msch.width = maxX - minX + 1
    msch.height = maxY - minY + 1
    msch.tags = {
      name: this.mschName,
      description: this.mschDescription,
    }
    this.screenList.forEach(screen => {
      const { x, y } = screen.pos
      const pos = CodeToMsch.fixPos(minX, minY, maxX, maxY, x, y)
      const screenBlock = new Block(this.screenType, pos, 0, null)
      msch.blocks.push(screenBlock)
    })
    this.logicBlockList.forEach(logic => {
      const { x, y } = logic.pos
      const pos = CodeToMsch.fixPos(minX, minY, maxX, maxY, x, y)
      const logicBlock = new LogicBlock('micro-processor', pos, 0, null)
      logicBlock.code = logic.code
      const targetScreen = msch.blocks[logic.index]
      logicBlock.links.push({
        name: this.screenName,
        x: targetScreen.position.x - pos.x,
        y: targetScreen.position.y - pos.y,
      })
      msch.blocks.push(logicBlock)
    })
    const out = msch.write()

    return out
  }
  static fixPos(minX, minY, maxX, maxY, x, y) {
    return {
      x: x - minX,
      y: maxY - y,
    }
  }
  setLogicBlockPos() {
    while (this.haveCode()) {
      this.move()
      const { x, y } = this.point
      const blockList = this.screenList
        .map(screen => {
          const { center } = screen
          const len = Math.sqrt((x - center.x) ** 2 + (y - center.y) ** 2)
          return {
            screen,
            len,
          }
        })
        .filter(screen => screen.len <= this.linkMaxLength)
        .sort((a, b) => {
          return b.len - a.len
        })
      if (blockList.length == 0) {
        console.log('离开范围')
        return false
      }
      let target = null
      for (let screen of blockList) {
        const { codes } = screen.screen
        if (codes.length > 0) {
          target = screen.screen
          break
        }
      }
      if (target == null) {
        continue
      }
      this.logicBlockList.push({
        pos: { ...this.point },
        index: target.index,
        code: target.codes.shift(),
      })
    }
    return true
  }
  move() {
    const dir = CodeToMsch.directionList[this.direction]
    let { x, y } = this.point
    x += dir.x
    y += dir.y
    if (this.isOutBox(x, y)) {
      this.direction = (this.direction + 1) % 4
      this.resetBox(x, y)
    }
    this.point = {
      x,
      y,
    }
  }
  isOutBox(x, y) {
    const { minX, minY, maxX, maxY } = this.box
    return x < minX || x > maxX || y < minY || y > maxY
  }
  resetBox(x, y) {
    if (x < this.box.minX) {
      this.box.minX = x
    }
    if (x > this.box.maxX) {
      this.box.maxX = x
    }
    if (y < this.box.minY) {
      this.box.minY = y
    }
    if (y > this.box.maxY) {
      this.box.maxY = y
    }
  }
  haveCode() {
    for (let screen of this.screenList) {
      const { codes } = screen
      if (codes.length > 0) {
        return true
      }
    }
    return false
  }
}
