<template>
  <div class="m-number-counter">
    <div class="left" @click="leftClick"></div>
    <div class="center">{{ value }}</div>
    <div class="right" @click="rightClick"></div>
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'change',
  },
  props: {
    value: {
      type: Number,
      default: 0,
    },
    step: {
      type: Number,
      default: 1,
    },
    max: {
      type: [Number, undefined],
    },
    min: {
      type: [Number, undefined],
    },
  },
  watch: {
    max(value) {
      if (this.value > value) {
        this.$emit('change', value)
      }
    },
    min(value) {
      if (this.value < value) {
        this.$emit('change', value)
      }
    },
  },
  data() {
    return {}
  },
  methods: {
    leftClick() {
      let val = this.value
      val = val - this.step
      if (typeof this.min !== 'undefined' && val < this.min) {
        val = this.min
      }
      this.$emit('change', val)
    },
    rightClick() {
      let val = this.value
      val = val + this.step
      if (typeof this.max !== 'undefined' && val > this.max) {
        val = this.max
      }
      this.$emit('change', val)
    },
  },
}
</script>

<style lang="scss" scoped>
$borderCut: 10px;
$borderWidth: 4px;
$borderCut2: $borderCut + calc($borderWidth / 2);
@mixin buttomStyle {
  height: 54px;
  background-color: rgb(69, 69, 69);
  color: white;
  position: relative;
  cursor: pointer;
  &:hover {
    background-color: rgb(255, 211, 127);
  }
  &:active {
    background-color: rgb(255, 255, 255);
  }
  &:after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    top: 0;
    left: 0;
    background-color: black;
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
.m-number-counter {
  display: inline-flex;
  flex-direction: row;
  .left {
    @include buttomStyle;
    width: 30px;
    clip-path: polygon(
      $borderCut 0,
      100% 0%,
      100% 100%,
      $borderCut 100%,
      0% calc(100% - $borderCut),
      0% $borderCut
    );
    &::after {
      content: '-';
      clip-path: polygon(
        $borderCut2 $borderWidth,
        calc(100% - $borderWidth) $borderWidth,
        calc(100% - $borderWidth) calc(100% - $borderWidth),
        $borderCut2 calc(100% - $borderWidth),
        $borderWidth calc(100% - $borderCut2),
        $borderWidth $borderCut2
      );
    }
  }
  .center {
    min-width: 50px;
    height: 54px;
    padding: 0 5px;
    color: white;
    background-color: black;
    box-sizing: border-box;
    border-top: 4px rgb(69, 69, 69) solid;
    border-bottom: 4px rgb(69, 69, 69) solid;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .right {
    @include buttomStyle;
    width: 30px;
    clip-path: polygon(
      0% 0%,
      calc(100% - $borderCut) 0%,
      100% $borderCut,
      100% calc(100% - $borderCut),
      calc(100% - $borderCut) 100%,
      $borderCut 100%,
      0% 100%
    );
    &::after {
      content: '+';
      clip-path: polygon(
        $borderWidth $borderWidth,
        calc(100% - $borderCut2) $borderWidth,
        calc(100% - $borderWidth) $borderCut2,
        calc(100% - $borderWidth) calc(100% - $borderCut2),
        calc(100% - $borderCut2) calc(100% - $borderWidth),
        $borderWidth calc(100% - $borderWidth),
        $borderWidth $borderCut2
      );
    }
  }
}
</style>
