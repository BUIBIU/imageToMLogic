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
        let { x, y, width, height } = block
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

//图像处理类
export default class PreviewCanvas {
    //屏幕相关数据
    screenData = {
        normal: {
            url: require('@/assets/images/blocks/logic/logic-display.png'),
            image: null,
            resolution: 80,
            border: 8,
            size: 96
        },
        large: {
            url: require('@/assets/images/blocks/logic/large-logic-display.png'),
            image: null,
            resolution: 176,
            border: 8,
            size: 192
        }
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
        screenName: ''
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
        return new Promise((resolve, reject) => {
            Promise.all(requestList).then(res => {
                resolve()
            }).catch(() => {
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
            y: y
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
        let canvas = document.createElement('canvas')
        this.changeCanvasSize(canvas)
        let ctx = canvas.getContext('2d')
        ctx.fillStyle = 'rgb(0,0,0)'
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        // console.log(canvas);
        this.drawScreens(canvas)
        return canvas
    }
    //设置画板尺寸
    changeCanvasSize(canvas) {
        let { size } = this.screenOption.screenData
        let { x, y } = this.screenOption.screenCount
        let imageWidth = size * x
        let imageHeight = size * y
        canvas.width = imageWidth
        canvas.height = imageHeight
    }
    //绘制每个屏幕切片
    drawScreens(canvas) {
        let ctx = canvas.getContext('2d')
        let screenX = this.screenOption.screenCount.x
        let screenY = this.screenOption.screenCount.y
        let { size, image, border, resolution } = this.screenOption.screenData
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
    //输出处理后的预览图片地址
    output(canvas) {
        this.outputImage.src = canvas.toDataURL("image/png");
    }
    //刷新输出的预览图片
    refreshOutputImage() {
        this.processCanvasList = []
        let canvas = this.drawImage()
        this.output(canvas)
    }
    //设置输入的图片
    setImage(base64) {
        let img = new Image()
        let vue = this
        img.addEventListener("load", function (e) {
            vue.inputImage = this
            vue.refreshOutputImage()
        })
        img.src = base64
    }
    //返回当前真实裁剪的长宽比（忽略边框时，裁剪的区域的长宽比不等于屏幕数量的长宽比）
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
    //图片转为处理器代码
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
    //将图片分解为色块
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
    //将色块按颜色进行分类集合
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
    //获取某个像素的颜色
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
    //尝试获取当前坐标下最大的色块
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
    //颜色是否相等
    isSameColor(color1, color2) {
        return (
            color1.r == color2.r &&
            color1.g == color2.g &&
            color1.b == color2.b &&
            color1.a == color2.a
        );
    }
    //将色块信息转为处理器代码
    getChips(colorMap) {
        //创建代码构建器
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