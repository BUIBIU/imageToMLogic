<template>
  <div class="m-input">
    <input
      type="text"
      :value="value"
      @input="$emit('input', $event.target.value)"
    />
  </div>
</template>

<script>
export default {
  model: {
    prop: 'value',
    event: 'input',
  },
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  data() {
    return {}
  },
}
</script>

<style lang="scss" scoped>
.m-input {
  position: relative;
  padding: 0 10px;
  input {
    width: 100%;
    background-color: transparent;
    border: none;
    caret-color: rgb(160, 138, 138);
    font-family: 'mindustry-font';
    outline: none;
    color: white;
    font-size: 16px;
  }
  &:after {
    content: '';
    display: block;
    position: absolute;
    width: 100%;
    height: 5px;
    left: 0px;
    bottom: -10px;
    background-color: rgb(160, 138, 138);
  }
}
</style>
