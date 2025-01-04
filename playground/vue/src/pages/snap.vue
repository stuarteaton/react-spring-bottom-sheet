<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from 'vue-spring-bottom-sheet'
import 'vue-spring-bottom-sheet/dist/style.css'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()
const maxHeight = ref(0)
const minHeight = ref(0)

const expandOnContentDrag = ref(true)

const open = () => {
  bottomSheet.value?.open()
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
    :snap-points="[maxHeight / 3, maxHeight / 1.5, maxHeight]"
    @min-height="(n) => (minHeight = n)"
    @max-height="(n) => (maxHeight = n)"
  >
    <div class="button-group">
      <button type="button" @click="snapToPoint(maxHeight)">Top</button>
      <button type="button" @click="snapToPoint(maxHeight / 1.5)">Middle</button>
      <button type="button" @click="snapToPoint(maxHeight / 3)">Bottom</button>
    </div>
    <button type="button" style="margin-bottom: 1rem" @click="expandOnContentDrag = !expandOnContentDrag">
      {{ expandOnContentDrag ? 'Enable' : 'Disable' }} expand on content drag
    </button>
    <p v-for="i in 14" :key="i">
      Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam officiis libero necessitatibus ipsum,
      reprehenderit eveniet neque ad delectus fugit!
    </p>
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
