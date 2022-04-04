<template>
  <div>
    <div class="image-editer">
      <div class="cropper">
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
        <div class="overlay" v-if="!haveImage" @click="getFile">
          请选择本地图片
        </div>
        <div class="overlay" v-if="haveImage && loading">正在加载图片...</div>
      </div>
      <div class="view">
        <img ref="previewImage" />
      </div>
    </div>
    <div style="margin-top: 20px">
      <mButton icon="load" text="选择图片" @click="getFile" />
      <input
        type="file"
        style="display: none"
        accept="image/*"
        @change="loadFile"
        ref="fileInput"
      />
    </div>
    <div class="setting">
      <div class="form-item">
        <span class="form-item-label">分辨率</span>
        <span>
          <mButton
            :checked="option.resolution === 176"
            url="/images/blocks/logic/large-logic-display.png"
            text="176"
            @click="setScreenType('large')"
          />
          <mButton
            :checked="option.resolution === 80"
            url="/images/blocks/logic/logic-display.png"
            text="80"
            @click="setScreenType('normal')"
          />
        </span>
      </div>
      <div class="form-item">
        <span class="form-item-label">屏幕数量</span>
        <span style="display: flex; align-items: center">
          <mNumberCounter
            v-model="option.screenX"
            :min="1"
            :max="3"
            @change="screenSizeChange"
          />
          <span style="margin: 0 5px">X</span>
          <mNumberCounter
            v-model="option.screenY"
            :min="1"
            :max="3"
            @change="screenSizeChange"
          />
        </span>
      </div>
      <div class="form-item">
        <span class="form-item-label">压缩强度</span>
        <span>
          <mButton
            v-for="(n, index) in 8"
            :key="index"
            :checked="option.compress === index"
            :text="index"
            @click="option.compress = index"
          />
        </span>
      </div>
      <div class="form-item" v-if="option.screenX > 1 || option.screenY > 1">
        <span class="form-item-label">忽略边框</span>
        <span>
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
        </span>
      </div>
      <div class="form-item">
        <span class="form-item-label">显示器</span>
        <span><mInput v-model="option.dispalyName" /> </span>
      </div>
    </div>
  </div>
</template>

<script>
import { VueCropper } from 'vue-cropper'

import mButton from '@/components/ui/button'
import mInput from '@/components/ui/input'
import mNumberCounter from '@/components/ui/numberCounter'
import PreviewCnavas from './previewCnavas.js'
export default {
  components: {
    mButton,
    mInput,
    mNumberCounter,
    VueCropper,
  },
  data() {
    return {
      cropper: null,
      url: null,
      image: null,
      loading: true,
      haveImage: false,
      option: {
        resolution: 176,
        compress: 2,
        dispalyName: 'display',
        screenX: 1,
        screenY: 1,
        aspect: [1, 1],
        ignoreBorder: true,
      },
      previewCnavas: null,
      outImage: null,
      previewTimer: null,
    }
  },
  methods: {
    loadFile(e) {
      this.haveImage = true
      var reader = new FileReader()
      reader.readAsDataURL(e.target.files[0])
      reader.onload = e => {
        this.url = e.target.result
      }
    },
    onImageLoad(e) {
      if (e === 'success') {
        this.loading = false
      }
    },
    screenSizeChange() {
      this.previewCnavas.setScreenCount(
        this.option.screenX,
        this.option.screenY,
      )
      this.option.aspect = this.previewCnavas.getAspect()
      this.$nextTick(() => {
        this.$refs.cropper.goAutoCrop()
      })
    },
    getFile() {
      this.$refs.fileInput.click()
    },
    setScreenType(type) {
      switch (type) {
        case 'normal':
          this.option.resolution = 80
          this.previewCnavas.setScreenType('normal')
          break
        case 'large':
          this.option.resolution = 176
          this.previewCnavas.setScreenType('large')
          break
      }
    },
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
        }, 100)
      }
    },
    changeIgnoreBorder(ignoreBorder) {
      this.option.ignoreBorder = ignoreBorder
      this.previewCnavas.setSreenIgnoreBorder(ignoreBorder)
      this.screenSizeChange()
    },
  },
  mounted() {
    this.previewCnavas = new PreviewCnavas(this.$refs.previewImage)
  },
  destroyed() {
    if (this.previewTimer) {
      clearTimeout(this.previewTimer)
    }
  },
}
</script>

style
<style lang="scss" scoped>
.image-editer {
  display: flex;
  flex-direction: row;
  .cropper {
    flex: 1;
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
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    background-color: black;
    img {
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
  align-items: center;
  height: 54px;
  & + & {
    margin-top: 10px;
  }
  .form-item-label {
    width: 90px;
  }
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
</style>
