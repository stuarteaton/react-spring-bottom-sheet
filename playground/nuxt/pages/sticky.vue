<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from 'vue-spring-bottom-sheet'
import 'vue-spring-bottom-sheet/dist/style.css'

const myBottomSheet = ref<InstanceType<typeof BottomSheet>>()
const maxHeight = ref(0)

const expandOnContentDrag = ref(true)

const open = () => {
  myBottomSheet.value?.open()
}

const close = () => {
  myBottomSheet.value?.close()
}
</script>

<template>
  <div class="content">
    <button class="btn btn-primary" type="button" @click="open">Open bottom sheet</button>
    <p>vue js: {{ version }}</p>
  </div>
  <ClientOnly>
    <BottomSheet
      ref="myBottomSheet"
      :blocking="true"
      :can-overlay-close="true"
      :can-swipe-close="true"
      :expand-on-content-drag="expandOnContentDrag"
      :snap-points="[maxHeight / 3, maxHeight / 1.5, maxHeight]"
      @max-height="(n) => (maxHeight = n)"
    >
      <template #header>
        <h1 style="font-size: 24px; margin: 0; text-align: center">Header</h1>
      </template>
      <p v-for="i in 5" :key="i">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam officiis libero necessitatibus ipsum,
        reprehenderit eveniet neque ad delectus fugit!
      </p>
      <template #footer>
        <button type="button" @click="close">Close bottom sheet</button>
      </template>
    </BottomSheet>
  </ClientOnly>
</template>

<style>
.content {
  height: calc(100dvh - 56px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
