<template>
  <div class="m-input">
    <input type="text" :value="value" @input="$emit('input', value)" />
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
  margin-bottom: 10px;
  position: relative;
  padding: 0 10px;
  input {
    background-color: transparent;
    border: none;
    caret-color: rgb(160, 138, 138);
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