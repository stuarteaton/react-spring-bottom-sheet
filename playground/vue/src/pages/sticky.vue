<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'

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
