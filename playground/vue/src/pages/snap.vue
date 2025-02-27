<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()
const instinctHeight = ref(0)

const expandOnContentDrag = ref(true)

const open = () => {
  bottomSheet.value?.open()
}

const close = () => {
  bottomSheet.value?.close()
}

const snapToPoint = (snapPoint: number) => {
  bottomSheet.value?.snapToPoint(snapPoint)
}
</script>

<template>
  <div class="content">
    <button type="button" @click="open">Open bottom sheet</button>
    <p>vue js: {{ version }}</p>
  </div>
  <BottomSheet
    ref="bottomSheet"
    :blocking="true"
    :can-overlay-close="true"
    :can-swipe-close="false"
    :expand-on-content-drag="expandOnContentDrag"
    :snap-points="['90%', '50%', 250, instinctHeight]"
    @instinct-height="(n) => (instinctHeight = n)"
  >
    <div class="button-group">
      <button type="button" @click="snapToPoint(0)">Top</button>
      <button type="button" @click="snapToPoint(1)">Middle</button>
      <button type="button" @click="snapToPoint(2)">Bottom</button>
      <button type="button" @click="snapToPoint(3)">Instinct</button>
    </div>
    <button
      type="button"
      style="margin-bottom: 1rem"
      @click="expandOnContentDrag = !expandOnContentDrag"
    >
      {{ expandOnContentDrag ? 'Enable' : 'Disable' }} expand on content drag
    </button>
    <p v-for="i in 4" :key="i">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam
      officiis libero necessitatibus ipsum, reprehenderit eveniet neque ad delectus fugit!
    </p>
    <template #footer>
      <button type="button" @click="close">Close bottom sheet</button>
    </template>
  </BottomSheet>
</template>

<style>
.content {
  max-width: 768px;
  padding-top: 5rem;
  padding-bottom: 5rem;
  margin: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
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
