<template>
  <div>
    <div class="image-editer">
      <div class="cropper">
        <!-- 裁剪组件 -->
        <vueCropper
          class="editer"
          ref="cropper"
          :img="url"
          :info="false"
          :autoCrop="true"
          :fixed="true"
          :fixedNumber="option.aspect"
          :canMove="true"
          :centerBox="true"
          :full="true"
          @imgLoad="onImageLoad"
          @realTime="cropperChanged"
        ></vueCropper>
        <!-- '请选择图片'的遮罩层 点击选择图片 -->
        <div class="overlay" v-if="!haveImage" @click="getFile">
          请选择本地图片
        </div>
        <!-- '正在加载图片'的遮罩层 -->
        <div class="overlay" v-if="haveImage && loading">正在加载图片...</div>
      </div>
      <div class="view">
        <!-- 预览图片 -->
        <!-- <img ref="previewImage" /> -->
        <canvas ref="previewImage"></canvas>
      </div>
    </div>
    <div style="margin-top: 20px">
      <!-- 点击选择图片按钮 -->
      <mButton
        icon="load"
        text="选择图片"
        @click="getFile"
        style="margin-right: 10px"
      />
      <!-- 被隐藏的input标签 -->
      <input
        type="file"
        style="display: none"
        accept="image/*"
        @change="loadFile"
        ref="fileInput"
      />
      <mButton
        icon="planet"
        text="使用教程"
        @click="jumpToVideo"
        style="margin-right: 10px"
      />
      <mButton icon="github" text="GitHub" @click="jumpToGitHub" />
    </div>
    <div class="setting">
      <!-- 屏幕类型 -->
      <div class="form-item">
        <div class="form-item-label">
          <span>屏幕类型</span>
        </div>
        <div class="button-grid">
          <mButton
            :checked="option.screenType === 'large'"
            :url="largeLogicDisplayUrl"
            text="大型逻辑显示屏"
            @click="setScreenType('large')"
          />
          <mButton
            :checked="option.screenType === 'normal'"
            :url="logicDisplayUrl"
            text="逻辑显示屏"
            @click="setScreenType('normal')"
          />
          <mButton
            :checked="option.screenType === 'tile'"
            :url="largeLogicDisplayUrl"
            text="逻辑显示单元"
            @click="setScreenType('tile')"
          />
        </div>
      </div>
      <!-- 屏幕数量 -->
      <div class="form-item">
        <div class="form-item-label">
          <span>屏幕数量</span>
        </div>
        <div class="button-grid">
          <mNumberCounter
            v-model="option.screenX"
            :min="1"
            :max="isTileScreen ? 16 : 4"
            @change="screenSizeChange"
          />
          <mNumberCounter
            v-model="option.screenY"
            :min="1"
            :max="isTileScreen ? 16 : 4"
            @change="screenSizeChange"
          />
        </div>
      </div>
      <!-- 压缩强度 -->
      <div class="form-item">
        <div class="form-item-label">
          <span>压缩强度</span>
        </div>
        <div class="button-grid">
          <mButton
            v-for="(n, index) in 8"
            :key="index"
            :checked="option.compress === index"
            :text="index"
            @click="setCompress(index)"
          />
        </div>
      </div>
      <!-- 忽略边框 -->
      <div
        class="form-item"
        v-if="
          option.screenType !== 'tile' &&
          (option.screenX > 1 || option.screenY > 1)
        "
      >
        <span class="form-item-label">忽略边框</span>
        <div class="button-grid">
          <mButton
            :checked="option.ignoreBorder === true"
            text="是"
            @click="changeIgnoreBorder(true)"
          />
          <mButton
            :checked="option.ignoreBorder === false"
            text="否"
            @click="changeIgnoreBorder(false)"
          />
        </div>
      </div>
      <!-- 显示器名称 -->
      <div class="form-item">
        <div class="form-item-label">显示屏</div>
        <div class="form-item-input">
          <mInput v-model="option.screenName" @input="changeScreenName" />
        </div>
      </div>
      <!-- 蓝图名称 -->
      <div class="form-item">
        <div class="form-item-label">蓝图名称</div>
        <div class="form-item-input"><mInput v-model="option.mschName" /></div>
      </div>
      <!-- 蓝图描述 -->
      <div class="form-item">
        <div class="form-item-label">蓝图描述</div>
        <div class="form-item-input">
          <mInput v-model="option.mschDescription" />
        </div>
      </div>
      <!-- 导出形式 -->
      <div class="form-item">
        <span class="form-item-label">导出形式</span>
        <div class="button-grid">
          <mButton
            :checked="option.exportType === 1"
            text="剪切板"
            @click="changeExportType(1)"
          />
          <mButton
            :checked="option.exportType === 2"
            text="文件"
            @click="changeExportType(2)"
          />
        </div>
      </div>
      <!-- 开始转换按钮 -->
      <div class="form-item" v-if="isChanged && !loading">
        <mButton icon="play-2" text="开始转换" @click="getMlog" />
      </div>
      <div class="error-message" v-if="exportError">
        导出失败，请尝试提高压缩强度或减少屏幕数量
      </div>
      <div
        class="success-message"
        v-if="exportSuccess && option.exportType == 1"
      >
        <div>导出成功，蓝图已复制进剪切板</div>
        <div style="margin-top: 20px">若复制失败，请使用文件导出</div>
      </div>
      <div
        class="success-message"
        v-if="exportSuccess && option.exportType == 2"
      >
        导出成功，蓝图文件开始下载
      </div>
    </div>
    <!-- 隐藏的用于代码复制的文本域 -->
    <div>
      <textarea
        ref="codeTextarea"
        class="code-textarea"
        v-model="code"
      ></textarea>
    </div>
    <!-- 转换完毕后的处理器列表 -->
    <div class="code-list">
      <div class="code-item" v-for="(chips, index) in screenMlog" :key="index">
        <div class="code-title">
          <div style="width: 80px">屏幕{{ index }}</div>
          <!-- <div>
            ( {{ index % option.screenX }} ,
            {{ Math.floor(index / option.screenX) }} )
          </div> -->
        </div>
        <div class="code-botton-list">
          <mButton
            v-for="(chip, index2) in chips"
            :key="index2"
            :text="index2"
            :error="chip.copyed"
            @click="copyCode(chip)"
          />
        </div>
      </div>
    </div>
    <div class="mask" :class="{ show: exporting }">
      <div class="exporting-state">
        <img class="icon" src="@/assets/images/icons/settings.png" />
        <div style="margin: 0 10px">{{ exportingState }}</div>
        <img class="icon" src="@/assets/images/icons/settings.png" />
      </div>
    </div>
  </div>
</template>

<script>
//引入图片裁剪组件
import { VueCropper } from 'vue-cropper'
//引入按钮组件
import mButton from '@/components/ui/button'
//引入输入框组件
import mInput from '@/components/ui/input'
//引入计数器组件
import mNumberCounter from '@/components/ui/numberCounter'
//引入图像处理类
import PreviewCnavas from './previewCnavas.js'
import PreviewCnavasForTileScreen from './previewCnavasForTileScreen.js'
// import CodeToMsch from './CodeToMsch'
import WorkerController from './WorkerController.js'
export default {
  //组件注册
  components: {
    mButton,
    mInput,
    mNumberCounter,
    VueCropper,
  },
  data() {
    return {
      //裁剪组件需要的图片地址
      url: null,
      //是否正在加载图片
      loading: true,
      //图片是否已选择
      haveImage: false,
      //图像处理基本设置
      option: {
        //屏幕类型
        screenType: 'large',
        //压缩强度
        compress: 5,
        //屏幕名称
        screenName: 'display1',
        //屏幕x轴数量
        screenX: 1,
        //屏幕y轴数量
        screenY: 1,
        //裁剪长宽比
        aspect: [1, 1],
        //是否忽略边框
        ignoreBorder: true,
        //蓝图名称
        mschName: 'pic',
        //蓝图描述
        mschDescription: '',
        //导出形式
        exportType: 1,
      },
      //图像处理类实例
      previewCnavas: null,
      outImage: null,
      //预览计时器，用于防抖
      previewTimer: null,
      //放入剪贴板的代码
      code: '',
      //输出的处理器数据
      screenMlog: [],
      //是否发生更改
      isChanged: false,
      largeLogicDisplayUrl: require('@/assets/images/blocks/logic/large-logic-display.png'),
      logicDisplayUrl: require('@/assets/images/blocks/logic/logic-display.png'),
      exportError: false,
      exportSuccess: false,
      exporting: false,
      exportingState: '',
    }
  },
  computed: {
    isTileScreen() {
      return this.option.screenType === 'tile'
    },
  },
  methods: {
    //加载图片，获取文件后触发
    loadFile(e) {
      if (e.target.files.length != 0) {
        this.haveImage = true
        this.loading = true
        var reader = new FileReader()
        reader.readAsDataURL(e.target.files[0])
        reader.onload = e => {
          //将图片地址传给裁剪器
          this.url = e.target.result
        }
      }
    },
    //图片加载完毕
    onImageLoad(e) {
      if (e === 'success') {
        this.loading = false
        this.imageChanged()
      }
    },
    //屏幕数量改变
    screenSizeChange() {
      this.previewCnavas.setScreenCount(
        this.option.screenX,
        this.option.screenY,
      )
      const lastAspect = this.option.aspect
      const newAspect = this.previewCnavas.getAspect()

      if (lastAspect[0] == newAspect[0] && lastAspect[1] == newAspect[1]) {
        this.cropperChanged()
      }
      if (this.haveImage && !this.loading) {
        this.option.aspect = newAspect
        this.$nextTick(() => {
          //裁剪组件更新裁剪框长宽比
          this.$refs.cropper.goAutoCrop()
        })
        this.imageChanged()
      } else {
        this.previewCnavas.refreshOutputImage()
      }
    },
    //模拟点击上传input
    getFile() {
      this.$refs.fileInput.click()
    },
    //设置屏幕类型
    async setScreenType(type) {
      const lastType = this.option.screenType
      if (type == 'tile') {
        this.option.screenType = 'tile'
        this.option.screenX = 16
        this.option.screenY = 16
        if (lastType !== 'tile') {
          this.previewCnavas = new PreviewCnavasForTileScreen(
            this.$refs.previewImage,
            {
              x: this.option.screenX,
              y: this.option.screenY,
              compress: this.option.compress,
            },
          )
          await this.previewCnavas.afterReady()
          this.screenSizeChange()
        }
      } else {
        if (lastType === 'tile') {
          this.option.screenX = 1
          this.option.screenY = 1
          this.previewCnavas = new PreviewCnavas(this.$refs.previewImage, {
            type,
            x: this.option.screenX,
            y: this.option.screenY,
            ignoreBorder: this.option.ignoreBorder,
            compress: this.option.compress,
          })
          await this.previewCnavas.afterReady()
          this.screenSizeChange()
        } else {
          this.previewCnavas.setScreenType(type)
        }
        this.option.screenType = type
      }
      this.imageChanged()
    },
    //设置压缩比
    setCompress(n) {
      this.option.compress = n
      this.previewCnavas.setCompress(n)
      this.imageChanged()
    },
    //裁剪组件裁剪框改变时触发
    cropperChanged() {
      if (this.previewTimer) {
        clearTimeout(this.previewTimer)
        this.previewTimer = null
      }
      if (this.haveImage && !this.loading) {
        this.previewTimer = setTimeout(() => {
          this.$refs.cropper.getCropData(data => {
            this.previewCnavas.setImage(data)
          })
          this.imageChanged()
        }, 100)
      }
    },
    //是否带边框改变时触发
    changeIgnoreBorder(ignoreBorder) {
      this.option.ignoreBorder = ignoreBorder
      this.previewCnavas.setSreenIgnoreBorder(ignoreBorder)
      this.$nextTick(() => {
        this.screenSizeChange()
      })
      this.imageChanged()
    },
    //获取图像处理后的逻辑代码
    getMlog() {
      const imageDatas = this.previewCnavas.getImageData()
      const workerController = new WorkerController(
        this.onStart,
        this.onPercentage,
        this.onEnd,
        this.onError,
      )
      workerController.run({
        imageDatas,
        screenName: this.option.screenName,
        screenType: this.previewCnavas.screenOption.screenData.type,
        mschName: this.option.mschName,
        mschDescription: this.option.mschDescription,
        screenX: this.option.screenX,
        screenY: this.option.screenY,
        exportType: this.option.exportType,
      })
      this.exportingState = '开始转换'
      this.exportError = false
      this.exportSuccess = false
      this.exporting = true
      this.isChanged = false
    },
    //改变屏幕名称时调用
    changeScreenName() {
      this.imageChanged()
    },
    //将代码复制进剪贴板
    copyCode(chip) {
      this.code = chip.code
      this.$set(chip, 'copyed', true)
      this.$nextTick(() => {
        this.$refs.codeTextarea.select()
        document.execCommand('copy')
      })
    },
    imageChanged() {
      this.isChanged = true
      this.exportError = false
      this.exportSuccess = false
    },
    changeExportType(type) {
      this.option.exportType = type
      this.imageChanged()
    },
    onStart() {
      this.exportingState = '转换线程启动'
    },
    onPercentage(message) {
      this.exportingState = message
    },
    onEnd(data) {
      this.exporting = false
      this.exportSuccess = true
      if (this.option.exportType == 1) {
        this.code = data
        this.$nextTick(() => {
          this.$refs.codeTextarea.select()
          document.execCommand('copy')
          this.code = ''
        })
      } else {
        const blob = new Blob([data])
        // 创建隐藏的可下载链接
        let eleLink = document.createElement('a')
        eleLink.download = `${this.option.mschName}.msch`
        eleLink.style.display = 'none'
        // 字符内容转变成blob地址
        eleLink.href = URL.createObjectURL(blob)
        // 触发点击
        document.body.appendChild(eleLink)
        eleLink.click()
        // 然后移除
        document.body.removeChild(eleLink)
      }
      this.exportSuccess = true
    },
    onError() {
      this.exporting = false
      this.exportError = true
    },
    jumpToVideo() {
      window.open('https://www.bilibili.com/video/BV1TD4y1t7DN')
    },
    jumpToGitHub() {
      window.open('https://github.com/BUIBIU/imageToMLogic')
    },
  },
  //页面加载完毕调用
  mounted() {
    //创建图像处理实例
    this.previewCnavas = new PreviewCnavas(this.$refs.previewImage, {
      type: 'large',
      x: this.option.screenX,
      y: this.option.screenY,
      ignoreBorder: this.option.ignoreBorder,
      compress: this.option.compress,
    })
  },
  //页面被清除前调用
  destroyed() {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
    }
  },
}
</script>

<style lang="scss" scoped>
.image-editer {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .cropper {
    flex: 1;
    min-width: 300px;
    height: 400px;
    position: relative;
    .editer {
      width: 100%;
      height: 100%;
    }
    .overlay {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 20px;
      user-select: none;
      cursor: pointer;
    }
  }
  .view {
    flex: 1;
    min-width: 300px;
    height: 400px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: black;
    canvas {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      object-fit: contain;
      object-position: center center;
    }
  }
}

.setting {
  margin-top: 20px;
}

.form-item {
  display: flex;
  flex-direction: row;
  min-height: 54px;
  & + & {
    margin-top: 10px;
  }
  .form-item-label {
    width: 90px;
    height: 54px;
    display: flex;
    align-items: center;
    flex-shrink: 0;
  }
  .form-item-input {
    display: flex;
    align-items: center;
  }
}
.code-textarea {
  width: 0px;
  height: 0px;
  background-color: transparent;
  position: absolute;
  left: -10px;
  top: 0;
  border: none;
  resize: none;
}
// @media screen and (max-width: 800px) {
//   .image-editer {
//     flex-direction: column;
//   }
//   .cropper {
//     flex: unset;
//     height: 400px;
//   }
// }
.code-list {
  .code-item {
    margin: 30px 0;
    .code-title {
      color: rgb(255, 211, 127);
      border-bottom: 4px rgb(255, 211, 127) solid;
      margin-bottom: 8px;
      display: flex;
    }
    .code-botton-list {
      .m-button {
        width: 65px;
        margin: 5px;
      }
    }
    &:last-child {
      margin-bottom: 100px;
    }
  }
}
.error-message {
  margin-top: 30px;
  color: rgb(229, 84, 84);
}
.success-message {
  margin-top: 30px;
  color: rgb(255, 211, 127);
}
.button-grid {
  display: flex;
  flex-wrap: wrap;
  grid-column-gap: 10px;
  grid-row-gap: 10px;
}
.mask {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  pointer-events: none;
  background-color: rgba(0, 0, 0, 0.5);
  opacity: 0;
  transition: 0.3s linear;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}
.mask.show {
  opacity: 1;
  pointer-events: unset;
}
.exporting-state {
  color: rgb(255, 211, 127);
  display: flex;
  align-items: center;
  justify-content: center;
  .icon {
    width: 20px;
    animation: 1s icon-turn infinite linear;
  }
}
@keyframes icon-turn {
  0% {
    transform: rotateZ(0deg);
  }
  100% {
    transform: rotateZ(360deg);
  }
}
</style>
