<template>
  <div class="avatar">
    <div class="size-contral">
      <div class="square-box">
        <img :src="url" />
      </div>
    </div>

    <div class="name">{{ name }}</div>
  </div>
</template>

<script>
export default {
  props: {
    url: String,
    name: String,
  },
}
</script>

<style lang="scss" scoped>
.avatar {
  width: 100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  .size-contral{
    width: 100%;
    max-width: 60px;
  }
  .square-box {
    width: 100%;
    height: 0;
    padding-bottom: 100%;
    position: relative;
   
  }
  img {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50% 50%;
    border: 2px rgb(255, 211, 127) solid;
    object-fit: cover;
  }
  .name {
    margin-top: 10px;
  }
}
</style>
