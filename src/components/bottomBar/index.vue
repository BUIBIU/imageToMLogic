<template>
  <div class="bottom-bar">
    <div class="section">
      <div class="section">
        <div class="subtitle">开发者</div>
        <div class="avatar-list">
          <avatarAndName :url="avatar1" name="BUI" />
          <avatarAndName :url="avatar2" name="王柴" />
          <avatarAndName :url="avatar3" name="yaddrx2" />
        </div>
      </div>
      <div class="section" style="border-top: 5px rgb(69, 69, 69) solid">
        <div class="ad-space">广告位招租</div>
      </div>
    </div>
    <div class="section">
      <div class="subtitle">Mindustry 逻辑交流群</div>
      <img class="qq-group" :src="qqGroup" alt="" />
    </div>
  </div>
</template>

<script>
import avatarAndName from './avatarAndName'
export default {
  components: {
    avatarAndName,
  },
  data() {
    return {
      avatar1: require('@/assets/images/avatars/BUI.png'),
      avatar2: require('@/assets/images/avatars/wangchai.png'),
      avatar3: require('@/assets/images/avatars/yaddrx2.jpg'),
      qqGroup: require('@/assets/images/other/qq_group.png'),
    }
  },
}
</script>

<style lang="scss" scoped>
.bottom-bar {
  margin-top: 100px;
  border-top: 5px rgb(69, 69, 69) solid;
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  padding: 20px;
  // align-items: center;
  background-color: rgba(0, 0, 0, 0.5);
}
.subtitle {
  margin-bottom: 40px;
}
.avatar-list {
  width: 100%;
  display: flex;
  flex-direction: row;
  justify-content: center;
}
.section {
  flex: 1;
  width: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}
.qq-group {
  height: 360px;
}
.ad-space {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #565666;
  font-size: 30px;
}
</style>
