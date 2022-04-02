<template>
  <div class="mainPage">
    <van-button type="primary">主要按钮</van-button>
    <van-button type="info">信息按钮</van-button>
    <van-button type="default">默认按钮</van-button>
    <van-button type="warning">警告按钮</van-button>
    <van-button type="danger">危险按钮</van-button>
    ABCDEFG123456789
    <m-button></m-button>
  </div>
</template>

<script>
import mButton from "@/components/ui/button";
export default {
  components: {
    mButton,
  },
};
</script>

<style lang="scss" scoped>
@font-face {
  font-family: "mindustry-font";
  src: url("/font/font.woff");
}
.mainPage {
  font-family: "mindustry-font";
}
</style>