<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from 'vue-spring-bottom-sheet'
import 'vue-spring-bottom-sheet/dist/style.css'

const myBottomSheet = ref<InstanceType<typeof BottomSheet>>()

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
  <BottomSheet ref="myBottomSheet">
    <p v-for="i in 3" :key="i">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam officiis libero necessitatibus ipsum,
      reprehenderit eveniet neque ad delectus fugit!
    </p>
    <details>
      <summary>Epcot Center</summary>
      <p v-for="i in 5" :key="i">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam officiis libero necessitatibus ipsum,
        reprehenderit eveniet neque ad delectus fugit!
      </p>
    </details>
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
