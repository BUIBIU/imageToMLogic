<template>
  <div class="avatar">
    <img :src="url" />
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
  img {
    width: 60px;
    height: 60px;
    border-radius: 50% 50%;
    border: 2px rgb(255, 211, 127) solid;
  }
  .name {
    margin-top: 10px;
  }
}
</style>