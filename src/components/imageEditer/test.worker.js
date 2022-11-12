import CodeToMsch from './CodeToMsch' // eslint-disable-line
import ImageToCode from './ImageToCode' // eslint-disable-line
// self.postMessage('tset', 'test1')
onmessage = function (event) {
  postMessage({
    state: 'start',
    data: null,
  })
  const data = event.data
  const {
    imageDatas,
    screenName,
    screenType,
    mschName,
    mschDescription,
    screenX,
    screenY,
    exportType,
  } = data
  const imageToCode = new ImageToCode()
  postMessage({
    state: 'percentage',
    data: '正在将图像转为逻辑代码',
  })
  const code = imageToCode.imageToMLogic(screenName, imageDatas)
  postMessage({
    state: 'percentage',
    data: '正在生成蓝图',
  })
  const codeToMsch = new CodeToMsch(
    code,
    screenName,
    screenType,
    mschName,
    mschDescription,
    screenX,
    screenY,
  )
  codeToMsch.onProgress = progress => {
    postMessage({
      state: 'percentage',
      data: `正在生成蓝图 ${progress}%`,
    })
  }
  const out = codeToMsch.getMsch()
  if (out === null) {
    postMessage({
      state: 'error',
      data: '',
    })
    return
  }
  if (exportType === 1) {
    postMessage({
      state: 'percentage',
      data: `正在转为剪切板文本`,
    })
    const base64 = btoa(
      out.reduce((data, byte) => data + String.fromCharCode(byte), ''),
    )
    postMessage({
      state: 'percentage',
      data: '转换完成，正在导出数据',
    })
    postMessage({
      state: 'end',
      data: base64,
    })
  } else {
    postMessage({
      state: 'percentage',
      data: '转换完成，正在导出数据',
    })
    postMessage({
      state: 'end',
      data: out,
    })
  }
}
