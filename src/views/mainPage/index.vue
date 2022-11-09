<template>
  <div class="background">
    <div class="mainPage">
      <imageEditer />
      <bottomBar />
    </div>
  </div>
</template>

<script>
//引入图像处理器组件
import imageEditer from '@/components/imageEditer'
import bottomBar from '@/components/bottomBar'
export default {
  //注册组件
  components: {
    imageEditer,
    bottomBar,
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'mindustry-font';
  src: url('../../assets/font/font.woff');
}
.background {
  height: 100%;
  width: 100%;
  background-image: url('../../assets/images/blocks/environment/background.png');
  overflow: auto;
}
.mainPage {
  width: 100%;
  max-width: 1000px;
  padding: 10px;
  padding-top: 50px;
  min-height: 100%;
  margin: 0 auto;
  font-family: 'mindustry-font';
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
  font-size: 16px;
}
</style>
<style lang="scss">
::selection {
  background-color: rgb(95, 83, 89);
}
</style>