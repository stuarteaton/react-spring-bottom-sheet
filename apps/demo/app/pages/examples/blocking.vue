<script lang="ts" setup>
import BottomSheet from '@douxcode/vue-spring-bottom-sheet'
import '@douxcode/vue-spring-bottom-sheet/dist/style.css'

import { useScrollLock } from '@vueuse/core'

const bottomSheet = ref<InstanceType<typeof BottomSheet>>()
const open = ref(false)

const toggle = () => {
  open.value = !open.value

  if (open.value) {
    bottomSheet.value?.open()
  } else {
    bottomSheet.value?.close()
  }
}

const snapToPoint = (index: number) => {
  bottomSheet.value?.snapToPoint(index)
}

const windowParent = ref<HTMLElement>()
const isLocked = useScrollLock(windowParent)
const handleTouchStart = (event: TouchEvent) => {
  const element = event.target as HTMLElement

  if (element.closest('[data-vsbs-sheet]')) {
    isLocked.value = true
  } else {
    isLocked.value = false
  }
}
const handleTouchEnd = () => {
  isLocked.value = false
}

onMounted(() => {
  windowParent.value = window.parent.document.body

  window.addEventListener('touchstart', handleTouchStart)
  window.addEventListener('touchend', handleTouchEnd)
  window.addEventListener('touchcancel', handleTouchEnd)
})

onBeforeUnmount(() => {
  window.removeEventListener('touchstart', handleTouchStart)
  window.removeEventListener('touchend', handleTouchEnd)
  window.removeEventListener('touchcancel', handleTouchEnd)
})
</script>

<template>
  <div class="content py-8 max-w-xl px-5 mx-auto">
    <UButton icon="lucide:arrow-left" to="/" variant="ghost" class="mb-4 self-start">
      Back to Examples
    </UButton>

    <h1 class="text-2xl mb-6 font-semibold">Non-blocking mode</h1>

    <div class="mb-8 space-y-4">
      <UButton type="button" @click="toggle">{{ open ? 'Close' : 'Open' }} bottom sheet</UButton>
    </div>
    <p v-for="i in 5" :key="i">
      Text just to make the page scrollable.
      <br />
      Lorem, ipsum dolor sit amet consectetur adipisicing elit. Velit aliquam sunt perspiciatis!
      Perferendis aperiam reprehenderit molestiae minima, assumenda delectus sunt corporis
      repellendus error doloribus, fuga ut quibusdam vitae reiciendis aliquid? Lorem ipsum dolor sit
      amet, consectetur adipisicing elit. Laudantium sunt reiciendis saepe possimus repellat nam,
      culpa placeat blanditiis assumenda architecto perferendis minima consectetur, sit, laboriosam
      ratione veniam illum praesentium quidem! Lorem ipsum dolor sit amet consectetur adipisicing
      elit. Laudantium, pariatur odio quo, accusamus, aliquam veritatis possimus nesciunt tempora et
      excepturi provident esse assumenda consectetur laborum quidem! Animi consectetur molestiae
      exercitationem?
    </p>
  </div>
  <ClientOnly>
    <BottomSheet
      ref="bottomSheet"
      :blocking="false"
      :snap-points="['25%', '60%']"
      @closed="open = false"
      @vue:mounted="toggle()"
    >
      <template #header>
        <UInput type="text" placeholder="Search..." class="w-full" />
      </template>
      <div class="button-group">
        <UButton type="button" class="flex-1" @click="snapToPoint(1)">Top</UButton>
        <UButton type="button" class="flex-1" @click="snapToPoint(0)">Bottom</UButton>
      </div>
      <p v-for="i in 3" class="mb-4" :key="i">
        Lorem ipsum, dolor sit amet consectetur adipisicing elit. Iste aperiam, accusamus amet
        veniam officiis libero necessitatibus ipsum, reprehenderit eveniet neque ad delectus fugit!
      </p>
    </BottomSheet>
  </ClientOnly>
</template>

<style scoped>
.content {
  min-height: 100dvh;
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

#app {
  padding: 0;
  width: 100%;
}
</style>
