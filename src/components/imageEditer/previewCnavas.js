export default class PreviewCanvas {
    screenData = {
        normal: {
            url: '/images/blocks/logic/logic-display.png',
            image: null,
            resolution: 80,
            border: 8,
            size: 96
        },
        large: {
            url: '/images/blocks/logic/large-logic-display.png',
            image: null,
            resolution: 176,
            border: 8,
            size: 192
        }
    }
    baseTexture = null
    screenOption = {
        screenCount: {
            x: 1,
            y: 1,
        },
        screenData: null,
        ignoreBorder: true
    }
    outputImage = null
    inputImage = null
    constructor(image) {
        this.initImageFile().then(() => {
            this.outputImage = image
            this.setScreenType('large')
            this.refreshOutputImage()
        })

    }
    initImageFile() {
        function getImage(url) {
            return new Promise((resolve, reject) => {
                let img = new Image()
                img.addEventListener("load", function (e) {
                    resolve(this)
                })
                img.addEventListener("error", () => {
                    console.error(`Failed to get image(${url})`)
                    reject()
                })
                img.src = url
            })
        }
        let requestList = []
        for (let key in this.screenData) {
            let item = this.screenData[key]
            let request = getImage(item.url).then(res => {
                item.image = res
                return Promise.resolve()
            }).catch(() => {

            })
            requestList.push(request)
        }

        let request = getImage("/images/blocks/environment/crater-stone5.png").then(res => {
            this.baseTexture = res
        }).catch(() => {
        })
        requestList.push(request)
        return new Promise((resolve, reject) => {
            Promise.all(requestList).then(res => {
                resolve()
            }).catch(() => {
                reject()
            })
        })
    }
    setScreenType(name) {
        this.screenOption.screenData = this.screenData[name]
        this.refreshOutputImage()
    }
    setScreenCount(x, y) {
        this.screenOption.screenCount = {
            x: x,
            y: y
        }
        // this.refreshOutputImage()
    }
    setSreenIgnoreBorder(ignoreBorder) {
        this.screenOption.ignoreBorder = ignoreBorder
        // this.refreshOutputImage()
    }
    drawImage() {
        let canvas = document.createElement('canvas')
        this.changeCanvasSize(canvas)
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // console.log(canvas);
        this.drawScreens(canvas)
        return canvas
    }
    changeCanvasSize(canvas) {
        let { size } = this.screenOption.screenData
        let { x, y } = this.screenOption.screenCount
        let imageWidth = size * x
        let imageHeight = size * y
        canvas.width = imageWidth
        canvas.height = imageHeight
    }
    drawScreens(canvas) {
        let ctx = canvas.getContext('2d')
        let screenX = this.screenOption.screenCount.x
        let screenY = this.screenOption.screenCount.y
        let { size, image, border, resolution } = this.screenOption.screenData

        for (let x = 0; x < screenX; x++) {
            for (let y = 0; y < screenY; y++) {
                let posX = x * size
                let posY = y * size
                ctx.drawImage(image, posX, posY)
            }
        }
        if (this.inputImage) {
            let imageWidth = this.inputImage.width
            let imageHeight = this.inputImage.height
            let scale = 0
            if (this.screenOption.ignoreBorder) {
                scale = imageWidth / (size * screenX - 2 * border)
            }
            else {
                scale = imageWidth / (resolution * screenX)
            }
            let realSizeX = resolution * scale
            let realSizeY = realSizeX
            for (let x = 0; x < screenX; x++) {
                for (let y = 0; y < screenY; y++) {
                    let posX = x * size
                    let posY = y * size
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
                    processCanvas.width = resolution
                    processCanvas.height = resolution
                    let processCtx = processCanvas.getContext('2d')
                    processCtx.drawImage(this.inputImage, cutPosX, cutPosY, realSizeX, realSizeY, 0, 0, resolution, resolution)


                    let imageData = processCtx.getImageData(0, 0, resolution, resolution)
                    ctx.putImageData(imageData, posX + border, posY + border)
                    // ctx.drawImage(this.inputImage, cutPosX, cutPosY, realSizeX, realSizeY, posX + border, posY + border, resolution, resolution)
                }
            }
        }
    }
    output(canvas) {
        this.outputImage.src = canvas.toDataURL("image/png");
    }
    refreshOutputImage() {
        let canvas = this.drawImage()
        this.output(canvas)
    }
    setImage(base64) {
        let img = new Image()
        let vue = this
        img.addEventListener("load", function (e) {
            vue.inputImage = this
            vue.refreshOutputImage()
        })
        img.src = base64
    }
    getAspect() {
        let { x, y } = this.screenOption.screenCount
        if (this.screenOption.ignoreBorder) {
            let { size, border } = this.screenOption.screenData
            let width = x * size - 2 * border
            let height = y * size - 2 * border
            return [width, height]
        } else {
            return [x, y]
        }
    }



}