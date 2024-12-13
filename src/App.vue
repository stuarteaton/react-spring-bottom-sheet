<script lang="ts" setup>
import { ref, useTemplateRef } from 'vue'
import BottomSheet from './components/BottomSheet.vue'
import type { ComponentExposed } from 'vue-component-type-helpers'

const myBottomSheet = useTemplateRef<ComponentExposed<typeof BottomSheet>>('myBottomSheet')
const maxHeight = ref(0)
const minHeight = ref(0)

const expandOnContentDrag = ref(true)

const open = () => {
  myBottomSheet.value?.open()
}

const close = () => {
  myBottomSheet.value?.close()
}

const snapToPoint = (index: number) => {
  myBottomSheet.value?.snapToPoint(index)
}
</script>

<template>
  <button class="btn btn-primary" type="button" @click="open">Open bottom sheet</button>
  <BottomSheet
    ref="myBottomSheet"
    :blocking="true"
    :can-overlay-close="true"
    :can-swipe-close="true"
    :expandOnContentDrag="expandOnContentDrag"
    :snap-points="[minHeight]"
    @min-height="(n) => (minHeight = n)"
    @max-height="(n) => (maxHeight = n)"
  >
    <template #header>
      <h1 style="font-size: 24px; margin: 0; text-align: center">Header</h1>
    </template>
    <div class="button-group">
      <button type="button" @click="snapToPoint(2)">Top</button>
      <button type="button" @click="snapToPoint(1)">Middle</button>
      <button type="button" @click="snapToPoint(0)">Bottom</button>
    </div>
    <button type="button" @click="expandOnContentDrag = !expandOnContentDrag">
      {{ expandOnContentDrag ? 'Enable' : 'Disable' }} expand on content drag
    </button>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <p>lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec euismod, nisl eget consectetur sagittis, nunc</p>
    <details>
      <summary>Epcot Center</summary>
      <p>
        Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks
        and seasonal special events.
      </p>
      <p>
        Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks
        and seasonal special events.
      </p>
      <p>
        Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks
        and seasonal special events.
      </p>
      <p>
        Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks
        and seasonal special events.
      </p>
      <p>
        Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions, award-winning fireworks
        and seasonal special events.
      </p>
    </details>
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

.button-group {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
}

.button-group button {
  flex: 1 1 33%;
}

#app {
  padding: 0;
  width: 100%;
}
</style>
