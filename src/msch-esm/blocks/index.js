import pako from 'pako' // eslint-disable-line

import {
  UTF8Getter,
  writeUTF8, // eslint-disable-line
  writeUint16, // eslint-disable-line
  writeUint8, // eslint-disable-line
  writeUint32, // eslint-disable-line
} from '../util'
export class Block {
  name
  position
  rotation
  config
  IOType = 0
  constructor(name, position, rotation, config) {
    this.name = name
    this.position = position
    this.rotation = rotation
    this.config = config
  }
  read() {}
  write() {
    return []
  }
}

export class LogicBlock extends Block {
  code = ''
  links = []
  constructor(name, position, rotation, config) {
    super(name, position, rotation, config)
    this.IOType = 14
  }
  read() {
    const config = this.config
    const bytes = pako.inflate(config)
    // console.log(bytes)
    const dataView = new DataView(bytes.buffer)
    let offset = 0
    const version = dataView.getUint8(offset) // eslint-disable-line
    offset++
    const codeLength = dataView.getUint32(offset)
    offset += 4
    this.code = new TextDecoder().decode(
      bytes.subarray(offset, offset + codeLength)
    )
    console.log(this.code)
    offset += codeLength
    this.links = []
    const linkLength = dataView.getUint32(offset)
    offset += 4
    const utf8Getter = new UTF8Getter(dataView, offset)
    for (let i = 0; i < linkLength; i++) {
      if (version == 0) {
        offset += 4
      } else {
        utf8Getter.setOffert(offset)
        const name = utf8Getter.get()
        offset = utf8Getter.getOffert()
        const x = dataView.getInt16(offset)
        offset += 2
        const y = dataView.getInt16(offset)
        offset += 2
        this.links.push({
          name,
          x,
          y,
        })
      }
    }
    console.log(this.links)
  }
  write() {
    let configData = []
    const version = 1
    configData = configData.concat(writeUint8(version)) // eslint-disable-line
    const code = Array.from(new TextEncoder().encode(this.code))
    configData = configData.concat(writeUint32(code.length))
    configData = configData.concat(code)
    configData = configData.concat(writeUint32(this.links.length))
    this.links.forEach(link => {
      const { name, x, y } = link
      configData = configData.concat(writeUTF8(name))
      configData = configData.concat(writeUint16(x))
      configData = configData.concat(writeUint16(y))
    })
    const deflateDat = Array.from(
      pako.deflate(Uint8Array.from(configData).buffer)
    )
    return deflateDat
  }
}

export const Blocks = {
  'micro-processor': LogicBlock,
}
