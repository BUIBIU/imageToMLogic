<template>
  <div
    class="m-button"
    @click="onClick"
    :class="{ checked: checked, error: error }"
  >
    <div class="m-button-flex">
      <div class="m-button-icon" v-if="icon">
        <img :src="iconUrl" />
      </div>
      <div class="m-button-icon" v-if="url">
        <img :src="url" />
      </div>
      <div class="m-button-text">{{ text }}</div>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    icon: {
      type: String,
    },
    url: {
      type: String,
    },
    text: {
      type: [String, Number],
      default: '',
    },
    checked: {
      type: Boolean,
      default: false,
    },
    error: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    iconUrl() {
      return require(`@/assets/images/icons/${this.icon}.png`)
    },
  },
  methods: {
    onClick() {
      this.$emit('click')
    },
  },
  mounted() {},
}
</script>

<style lang="scss" scoped>
.m-button {
  vertical-align: top;
  $borderCut2: 10px;
  display: inline-block;
  height: 54px;
  background-color: rgb(69, 69, 69);
  color: white;
  position: relative;
  clip-path: polygon(
    $borderCut2 0,
    calc(100% - $borderCut2) 0%,
    100% $borderCut2,
    100% calc(100% - $borderCut2),
    calc(100% - $borderCut2) 100%,
    $borderCut2 100%,
    0% calc(100% - $borderCut2),
    0% $borderCut2
  );
  cursor: pointer;

  &.checked {
    background-color: rgb(255, 211, 127);
  }
  &.error {
    background-color: rgb(229, 84, 84);
  }

  &:hover {
    background-color: rgb(255, 211, 127);
  }
  &:active {
    background-color: rgb(255, 255, 255);
  }
  &:after {
    content: '';
    display: block;
    $borderCut2: 10px;
    $borderWidth: 4px;
    $borderCut2: $borderCut2 + calc($borderWidth / 2);
    position: absolute;
    height: 100%;
    width: 100%;
    top: 0;
    left: 0;
    background-color: black;
    clip-path: polygon(
      $borderCut2 $borderWidth,
      calc(100% - $borderCut2) $borderWidth,
      calc(100% - $borderWidth) $borderCut2,
      calc(100% - $borderWidth) calc(100% - $borderCut2),
      calc(100% - $borderCut2) calc(100% - $borderWidth),
      $borderCut2 calc(100% - $borderWidth),
      $borderWidth calc(100% - $borderCut2),
      $borderWidth $borderCut2
    );
  }
  & + & {
    margin-left: 10px;
  }
  .m-button-flex {
    user-select: none;
    height: 100%;
    display: flex;
    flex-direction: row;
    .m-button-icon {
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      padding-left: 20px;
      z-index: 1;
      img {
        height: 20px;
        width: 20px;
      }
    }
    .m-button-text {
      flex: 1;
      padding: 0 20px;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
      z-index: 1;
      min-width: 15px;
    }
  }
}
</style>
<style lang="scss">
// .m-button + .m-button {
//   margin-left: 10px;
// }
</style>