<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from 'vue-spring-bottom-sheet'
import 'vue-spring-bottom-sheet/dist/style.css'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}
</script>

<template>
  <div class="content">
    <button type="button" @click="open">Open bottom sheet</button>
    <p>vue js: {{ version }}</p>
  </div>
  <BottomSheet ref="bottomSheet">
    <p class="mb-4">
      Lorem ipsum dolor sit amet consectetur adipisicing elit. Alias atque error dignissimos impedit iure facilis ipsam sit cum molestias,
      natus, cupiditate molestiae, id exercitationem eaque obcaecati a animi. Accusamus, pariatur.
    </p>
    <details class="mb-4">
      <summary>Tap to expand</summary>
      <div class="py-4">
        <Placeholder class="h-8" />
        <p class="my-5">It adjusts its height based on the content.</p>
        <Placeholder class="h-8" />
      </div>
    </details>
    <button type="button" class="mb-4" @click="close"> Close bottom sheet </button>
  </BottomSheet>
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
