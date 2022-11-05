/* eslint-disable no-case-declarations */
import pako from 'pako'
import {
  UTF8Getter,
  writeUTF8,
  writeUint16,
  writeUint8,
  writeUint32,
} from './util'
import { Blocks, Block } from './blocks'

export default class Msch {
  offset = 0
  dataView = null
  width = 0
  height = 0
  tags = null
  blockTypes = []
  blocks = []
  constructor() {}
  read(buffer) {
    try {
      this.checkHead(buffer)
      const fileData = this.InflaterData(buffer)
      this.dataView = new DataView(fileData.buffer)
      console.log(fileData)
    } catch (error) {
      console.error(error)
      return
    }
    const { width, height } = this.getSize()
    this.width = width
    this.height = height
    if (width > 128 || height > 128) {
      console.error(
        'Invalid schematic: Too large (max possible size is 128x128)'
      )
      return
    }

    this.offset = 4
    this.tags = this.getTags()
    console.log(this.tags)
    this.blockTypes = this.readBlockTypes()
    this.blocks = this.readBlocks()
    this.blocks.forEach(block => {
      block.read()
    })
  }

  checkHead(buffer) {
    const headbuffer = new Uint8Array(buffer, 0, 4)
    const headText = new TextDecoder().decode(headbuffer)
    if (headText != 'msch') {
      throw 'File header error'
    }
  }

  InflaterData(buffer) {
    let dataBuffer = new Uint8Array(buffer, 5)
    dataBuffer = pako.inflate(dataBuffer)
    return dataBuffer
  }

  getSize() {
    const dataView = this.dataView
    const width = dataView.getUint16(0)
    const height = dataView.getUint16(2)
    return {
      width,
      height,
    }
  }

  getTags() {
    const dataView = this.dataView
    let offset = this.offset
    const length = dataView.getUint8(offset)
    offset++
    const tags = {}
    const utf8Getter = new UTF8Getter(dataView, offset)
    for (let i = 0; i < length; i++) {
      const tagName = utf8Getter.get()
      const tagValue = utf8Getter.get()
      tags[tagName] = tagValue
      offset = utf8Getter.getOffert()
    }
    this.offset = offset
    return tags
  }

  readBlocks() {
    const dataView = this.dataView
    let offset = this.offset
    const total = dataView.getInt32(offset)
    offset += 4
    console.log('total:', total)
    const blocks = []
    for (let i = 0; i < total; i++) {
      const typeIndex = dataView.getUint8(offset)
      offset += 1
      const typeName = this.blockTypes[typeIndex]
      const x = dataView.getUint16(offset)
      offset += 2
      const y = dataView.getUint16(offset)
      offset += 2
      const position = {
        x,
        y,
      }
      this.offset = offset
      const config = this.readObject()
      offset = this.offset
      const rotation = dataView.getUint8(offset)
      offset += 1
      const BlockClass = Blocks[typeName] ? Blocks[typeName] : Block
      const block = new BlockClass(typeName, position, rotation, config)
      console.log(block)
      blocks.push(block)
      this.offset = offset
    }
    return blocks
  }

  readBlockTypes() {
    const dataView = this.dataView
    let offset = this.offset
    const length = dataView.getUint8(offset)
    offset += 1
    const utf8Getter = new UTF8Getter(dataView, offset)
    const blockTypes = []
    for (let i = 0; i < length; i++) {
      const name = utf8Getter.get()
      blockTypes.push(name)
      offset = utf8Getter.getOffert()
    }
    this.offset = offset
    return blockTypes
  }

  readObject() {
    const dataView = this.dataView
    let offset = this.offset
    const type = dataView.getUint8(offset)
    console.log('type',type);
    offset += 1
    let config = null
    switch (type) {
      case 0:
        config = null
        break
      case 14:
        const length = dataView.getUint32(offset)
        offset += 4
        config = new Uint8Array(dataView.buffer, offset, length)
        offset += length
        break
      default:
        config = null
        break
    }
    this.offset = offset
    return config
  }

  write() {
    const head = Array.from(new TextEncoder().encode('msch'))
    head.push(1)
    let mschData = writeUint16(this.width).concat(writeUint16(this.height))
    // mschData.push(...this.writeTags())
    mschData = mschData.concat(this.writeTags())
    mschData = mschData.concat(this.writeBlockTypes())
    mschData = mschData.concat(this.writeBlocks())

    const deflateDat = Array.from(
      pako.deflate(Uint8Array.from(mschData).buffer)
    )
    const mschDataBuffer = Uint8Array.from(head.concat(deflateDat))
    return mschDataBuffer
  }

  writeTags() {
    const tags = this.tags
    let tagsData = []
    tagsData = tagsData.concat(writeUint8(Object.keys(tags).length))
    for (let tagName in tags) {
      const tagValue = tags[tagName] //eslint-disable-line
      const tagData = writeUTF8(tagName).concat(writeUTF8(tagValue))
      tagsData = tagsData.concat(tagData)
    }
    return tagsData
  }
  writeBlockTypes() {
    const set = new Set()
    this.blocks.forEach(block => {
      const name = block.name
      set.add(name)
    })
    const blocktypes = Array.from(set)
    this.blockTypes = blocktypes
    let blocktypesData = writeUint8(blocktypes.length)
    blocktypes.forEach(type => {
      blocktypesData = blocktypesData.concat(writeUTF8(type))
    })
    return blocktypesData
  }
  writeBlocks() {
    const total = this.blocks.length
    let blocksData = writeUint32(total)
    this.blocks.forEach(block => {
      const blockTypeIndex = this.blockTypes.findIndex(
        type => type == block.name
      )
      let blockData = writeUint8(blockTypeIndex)
      blockData = blockData.concat(writeUint16(block.position.x))
      blockData = blockData.concat(writeUint16(block.position.y))
      const IOType = block.IOType
      const config = block.write()
      blockData = blockData.concat(this.writeObjcet(IOType, config))
      blockData = blockData.concat(writeUint8(block.rotation))
      blocksData = blocksData.concat(blockData)
    })
    return blocksData
  }

  writeObjcet(type, config) {
    let configData = []
    switch (type) {
      case 0:
        configData = [0]
        break
      case 14:
        configData = [14]
        configData = configData.concat(
          writeUint32(config.length).concat(config)
        )
        break
      default:
        configData = [0]
    }
    return configData
  }
}
