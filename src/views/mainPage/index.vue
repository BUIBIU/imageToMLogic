<template>
  <div class="background">
    <div class="mainPage">
      <imageEditer />
    </div>
  </div>
</template>

<script>
import imageEditer from '@/components/imageEditer'
export default {
  components: {
    imageEditer,
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
@font-face {
  font-family: 'mindustry-font';
  src: url('/font/font.woff');
}
.background {
  height: 100%;
  width: 100%;
  background-image: url('/images/blocks/environment/background.png');
  overflow: auto;
}
.mainPage {
  width: 1000px;
  padding: 10px;
  padding-top: 50px;
  min-height: 100%;
  margin: 0 auto;
  font-family: 'mindustry-font';
  color: white;
  background-color: rgba(0, 0, 0, 0.5);
  box-sizing: border-box;
}
</style>
<style lang="scss">
::selection {
  background-color: rgb(95, 83, 89);
}
</style>