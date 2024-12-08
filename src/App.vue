<script setup lang="ts">
import {ref} from 'vue'
import BottomSheet from "./components/BottomSheet.vue";

const myBottomSheet = ref(null)
const maxHeight = ref(0)
const minHeight = ref(0)

const open = () => {
  myBottomSheet.value?.open();
}

</script>

<template>
  <button class="btn btn-primary" type="button" @click="open">Open bottom sheet</button>
  <BottomSheet
      ref="myBottomSheet"
      v-model:max-height="maxHeight"
      v-model:min-height="minHeight"
      :snap-points="[maxHeight / 3, maxHeight / 1.5]"
      :can-overlay-close="true"
      :can-swipe-close="true">
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
  </BottomSheet>
</template>

<style>
body, html {
  overscroll-behavior-y: none;
}

body {
  width: 100%;
  min-height: 100dvh;
  overflow: hidden;
}

#app {
  padding: 0;
  width: 100%;
}
</style>