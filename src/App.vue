<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import BottomSheet from './components/BottomSheet.vue'
import type { ComponentExposed } from 'vue-component-type-helpers'

const myBottomSheet = useTemplateRef<ComponentExposed<typeof BottomSheet>>('myBottomSheet')
const maxHeight = ref(0)
const minHeight = ref(0)

const open = () => {
  myBottomSheet.value?.open()
}

const close = () => {
  myBottomSheet.value?.close()
}
</script>

<template>
  <button class="btn btn-primary" type="button" @click="open">Open bottom sheet</button>
  <BottomSheet
    ref="myBottomSheet"
    v-model:max-height="maxHeight"
    v-model:min-height="minHeight"
    :can-overlay-close="true"
    :can-swipe-close="true"
    :expandOnContentDrag="true"
    :snap-points="[maxHeight / 3, maxHeight / 1.5]"
  >
    <template #header>
      <h1 style="font-size: 24px; margin: 0; text-align: center">Header</h1>
    </template>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <template #footer>
      <button type="button" @click="close">Close bottom sheet</button>
    </template>
  </BottomSheet>
</template>

<style>
body,
html {
  overscroll-behavior-y: none;
}

body {
  min-height: 100dvh;
  overflow: hidden;
  width: 100%;
}

#app {
  padding: 0;
  width: 100%;
}
</style>
