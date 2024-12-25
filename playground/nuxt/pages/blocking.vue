<script lang="ts" setup>
import { ref, version } from 'vue'

import BottomSheet from 'vue-spring-bottom-sheet'
import 'vue-spring-bottom-sheet/dist/style.css'

const myBottomSheet = ref<InstanceType<typeof BottomSheet>>()
const open = ref(false)
const maxHeight = ref(0)
const minHeight = ref(0)

const expandOnContentDrag = ref(true)

const toggle = () => {
  open.value = !open.value

  if (open.value) {
    myBottomSheet.value?.open()
  } else {
    myBottomSheet.value?.close()
  }
}
</script>

<template>
  <div class="content">
    <button class="btn btn-primary" type="button" @click="toggle">{{ open ? 'Close' : 'Open' }} bottom sheet</button>
    <p>vue js: {{ version }}</p>
  </div>
  <ClientOnly>
    <BottomSheet
      ref="myBottomSheet"
      :blocking="false"
      :can-overlay-close="true"
      :can-swipe-close="true"
      :expand-on-content-drag="expandOnContentDrag"
      :snap-points="[maxHeight / 4, maxHeight / 1.5]"
      @min-height="(n) => (minHeight = n)"
      @max-height="(n) => (maxHeight = n)"
    >
      <template #header>
        <input type="text" placeholder="Search..." style="width: 100%; padding: 0.5rem; box-sizing: border-box" />
      </template>
      <p v-for="i in 3" :key="i">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet veniam officiis libero necessitatibus ipsum,
        reprehenderit eveniet neque ad delectus fugit!
      </p>
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
