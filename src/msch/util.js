import pako from 'pako' // eslint-disable-line

export class UTF8Getter {
  _offset = 0
  _dataView = null
  constructor(dataView, offset) {
    this._dataView = dataView
    this._offset = offset
  }
  get() {
    const length = this._dataView.getUint16(this._offset)
    this._offset += 2
    const bytes = new Uint8Array(this._dataView.buffer, this._offset, length)
    this._offset += length
    const text = new TextDecoder().decode(bytes)
    return text
  }
  getOffert() {
    return this._offset
  }
  setOffert(offset) {
    this._offset = offset
  }
}

export function writeUint8(num) {
  const dataView = new DataView(new ArrayBuffer(1))
  dataView.setUint8(0, num)
  return Array.from(new Uint8Array(dataView.buffer))
}

export function writeUint16(num) {
  const dataView = new DataView(new ArrayBuffer(2))
  dataView.setUint16(0, num)
  return Array.from(new Uint8Array(dataView.buffer))
}

export function writeUint32(num) {
  const dataView = new DataView(new ArrayBuffer(4))
  dataView.setUint32(0, num)
  return Array.from(new Uint8Array(dataView.buffer))
}

export function writeUTF8(str) {
  const strData = new TextEncoder().encode(str)
  const len = writeUint16(strData.byteLength)
  const utf8 = len.concat(Array.from(strData))
  return utf8
}

export function readCode(dataView, offset) {
  const length = dataView.getUint32(offset)
  offset += 4
  let bytes = new Uint8Array(dataView.buffer, offset, length)
  offset += length
  bytes = pako.inflate(bytes)
  console.log(bytes)
  const codeView = new DataView(bytes.buffer)
  let codeOffset = 0
  const version = codeView.getUint8(codeOffset) // eslint-disable-line
  codeOffset++
  const codeLength = codeView.getUint32(codeOffset)
  codeOffset += 4
  const code = new TextDecoder().decode(
    bytes.subarray(codeOffset, codeOffset + codeLength)
  )
  return {
    code,
    offset,
  }
}
