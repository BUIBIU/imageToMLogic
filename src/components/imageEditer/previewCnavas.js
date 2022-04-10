class MLogic {
    chips = []
    chip = []
    block = []
    chipMaxLength = 1000
    blockMaxLength = 20
    color = null
    screenName = ''
    constructor(screenName) {
        this.screenName = screenName
    }
    addColorBlock(block) {
        let { x, y, width, height } = block
        this.block.push(`draw rect ${x} ${y} ${width} ${height} 0 0`)
        if (this.block.length == this.blockMaxLength - 2) {
            this.encapsulationBlock()
        }
    }
    setColor(color) {
        if (this.block.length > 0) {
            this.encapsulationBlock()
        }
        this.color = color
    }
    encapsulationBlock() {
        let block = this.block
        let { r, g, b, a } = this.color
        block.unshift(`draw color ${r} ${g} ${b} ${a} 0 0`)
        block.push(`drawflush ${this.screenName}`)
        if (this.chip.length + block.length > this.chipMaxLength) {
            this.encapsulationChip()
        }
        this.chip.push(...block)
        this.block = []
    }
    encapsulationChip() {
        this.chips.push(this.chip.join('\n'))
        this.chip = []
    }
    getChips() {
        if (this.block.length > 0) {
            this.encapsulationBlock()
            this.encapsulationChip()
        }
        return this.chips
    }
}

export default class PreviewCanvas {
    screenData = {
        normal: {
            url: '/imageToMLogicPage/images/blocks/logic/logic-display.png',
            image: null,
            resolution: 80,
            border: 8,
            size: 96
        },
        large: {
            url: '/imageToMLogicPage/images/blocks/logic/large-logic-display.png',
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
        ignoreBorder: true,
        compress: 5,
        screenName: ''
    }
    outputImage = null
    inputImage = null
    processCanvasList = []
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

        let request = getImage("/imageToMLogicPage/images/blocks/environment/crater-stone5.png").then(res => {
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

        for (let y = 0; y < screenY; y++) {
            for (let x = 0; x < screenX; x++) {
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
            for (let y = 0; y < screenY; y++) {
                for (let x = 0; x < screenX; x++) {
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
                    this.processCanvasList.push(processCanvas)
                    processCanvas.width = resolution
                    processCanvas.height = resolution
                    let processCtx = processCanvas.getContext('2d')
                    processCtx.drawImage(this.inputImage, cutPosX, cutPosY, realSizeX, realSizeY, 0, 0, resolution, resolution)
                    this.compressImage(processCanvas)
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
        this.processCanvasList = []
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
    setCompress(n) {
        this.screenOption.compress = n
        this.refreshOutputImage()
    }
    setScreenName(screenName) {
        this.screenOption.screenName = screenName
    }
    compressImage(canvas) {
        let ctx = canvas.getContext('2d')
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let data = imageData.data
        let length = canvas.width * canvas.height

        let k = Math.pow(2, this.screenOption.compress);
        let round = Math.round
        for (let i = 0; i < length; i++) {
            let index = i * 4
            data[index] = round(data[index] / k) * k
            index++
            data[index] = round(data[index] / k) * k
            index++
            data[index] = round(data[index] / k) * k
        }
        ctx.putImageData(imageData, 0, 0)
    }
    imageToMLogic() {
        let mlogicList = []
        this.processCanvasList.forEach(canvas => {
            let colorBlocks = this.getColorBlocks(canvas)
            let colorMap = this.getColorMap(colorBlocks)
            let chips = this.getChips(colorMap)
            mlogicList.push(chips)
        });
        return mlogicList
    }
    getColorBlocks(canvas) {
        let colorBlocks = []
        let ctx = canvas.getContext('2d')
        let width = canvas.width
        let height = canvas.height
        let imageData = ctx.getImageData(0, 0, width, height)
        let statusMap = []
        let length = width * height
        for (let i = 0; i < length; i++) {
            statusMap.push(true)
        }

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let index = y * imageData.width + x
                if (statusMap[index]) {
                    colorBlocks.push(this.getMaxSizeBlock(imageData, x, y, statusMap))
                }
            }
        }
        return colorBlocks
    }
    getColorMap(colorBlocks) {
        let map = new Map()
        colorBlocks.forEach(block => {
            let { color, box } = block
            let colorText = `${color.r},${color.g},${color.b},${color.a}`
            if (!map.has(colorText)) {
                map.set(colorText, [])
            }
            let list = map.get(colorText)
            list.push(block)
        })
        return map
    }
    getpixel(image, x, y) {
        let index = (image.width * y + x) * 4;
        let r = image.data[index++];
        let g = image.data[index++];
        let b = image.data[index++];
        let a = image.data[index++];
        return {
            r: r,
            g: g,
            b: b,
            a: a
        };
    }
    getMaxSizeBlock(image, x, y, statusMap) {
        let originColor = this.getpixel(image, x, y);
        if (originColor.a == 0) {
            return null;
        }
        let maxX = -1;
        let maxY = 0;
        let maxSize = {
            area: 0,
            x: 0,
            y: 0
        };
        while (true) {
            let mx = 0;
            let color = this.getpixel(image, x, y + maxY)
            if (!this.isSameColor(originColor, color)) {
                break;
            }
            mx++;
            while (true) {
                if (x + mx >= image.width) {
                    break;
                }
                let color = this.getpixel(image, x + mx, y + maxY);
                if (this.isSameColor(originColor, color)) {
                    mx++;
                } else {
                    break;
                }
            }
            maxY++;
            if (maxX == -1 || mx < maxX) {
                maxX = mx;
            }
            let area = maxY * maxX;
            if (area > maxSize.area) {
                maxSize.area = area;
                maxSize.x = maxX;
                maxSize.y = maxY;
            }
            if (y + maxY >= image.height) {
                break
            }
        }
        maxX = maxSize.x;
        maxY = maxSize.y;
        for (let sy = 0; sy < maxY; sy++) {
            let ty = y + sy
            for (let sx = 0; sx < maxX; sx++) {
                let tx = x + sx
                let index = ty * image.width + tx
                statusMap[index] = false
            }
        }
        return {
            color: originColor,
            block: {
                x: x,
                y: image.height - y - maxY,
                width: maxX,
                height: maxY
            }
        };
    }
    isSameColor(color1, color2) {
        return (
            color1.r == color2.r &&
            color1.g == color2.g &&
            color1.b == color2.b &&
            color1.a == color2.a
        );
    }
    getChips(colorMap) {
        let mLogic = new MLogic(this.screenOption.screenName)
        for (let item of colorMap) {
            let blockList = item[1]
            mLogic.setColor(blockList[0].color)
            blockList.forEach(item => {
                mLogic.addColorBlock(item.block)
            })
        }
        return mLogic.getChips()
    }

}