<template>
  <div class="bottom-bar">
    <div class="section">
      <div class="section">
        <div class="subtitle">开发者</div>
        <div class="avatar-list">
          <avatarAndName url="/imageToMLogicPage/images/avatars/BUI.png" name="BUI" />
          <avatarAndName url="/imageToMLogicPage/images/avatars/wangchai.bmp" name="王柴" />
        </div>
      </div>
      <div class="section" style="border-top: 5px rgb(69, 69, 69) solid">
        <div class="ad-space">广告位招租</div>
      </div>
    </div>
    <div class="section" style="border-left: 5px rgb(69, 69, 69) solid">
      <div class="subtitle">Mindustry 逻辑交流群</div>
      <img class="qq-group" src="/imageToMLogicPage/images/other/qq_group.png" alt="" />
    </div>
  </div>
</template>

<script>
import avatarAndName from './avatarAndName'
export default {
  components: {
    avatarAndName,
  },
}
</script>

<style lang="scss" scoped>
.bottom-bar {
  margin-top: 100px;
  border-top: 5px rgb(69, 69, 69) solid;
  display: flex;
  flex-direction: row;
  padding: 20px;
  // align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}
.subtitle {
  margin-bottom: 40px;
}
.avatar-list {
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.section {
  flex: 1;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.qq-group {
  height: 360px;
}
.ad-space {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #565666;
  width: 300px;
  font-size: 30px;
}
</style>