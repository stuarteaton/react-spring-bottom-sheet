<script setup lang="ts">
import {ref} from 'vue'
import BottomSheet from "./components/BottomSheet.vue";

const myBottomSheet = ref<typeof BottomSheet | null>(null)

const open = () => {
  myBottomSheet.value?.open();
}
</script>

<template>
  <button class="btn btn-primary" type="button" @click="open">Open bottom sheet</button>
  <BottomSheet
      ref="myBottomSheet"
      :default-breakpoint="500"
      :snap-points="[500, 900]"
      :can-overlay-close="true"
      :can-swiper-close="true">
    Test
  </BottomSheet>
</template>

<style>
body {
  width: 100%;
  min-height: 100dvh;
}

#app {
  padding: 0;
  width: 100%;
}
</style>