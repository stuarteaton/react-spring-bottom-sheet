<template>
  <button @click="open()">Open</button>
  <div class="sheet-container">
    <transition><div class="overlay" ref="ovelay" @click="overlayClick()" v-show="showOverlay"></div></transition>
    <div class="sheet" ref="sheet">
      <div class="sheet-handle" ref="drag"></div>
      <div class="sheet-content">
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipisicing elit. Maxime neque sed tempore ullam.
          Accusamus animi at autem beatae est, hic inventore iste minima, non quibusdam quisquam
          quos velit veritatis voluptatem?
        </p>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {ref, computed} from 'vue'
import {useDrag} from '@vueuse/gesture'
import {useSpring, useMotionProperties} from '@vueuse/motion'

import {useWindowSize} from '@vueuse/core'

const {height} = useWindowSize()
const heightString = computed(() => {
  return `${height.value}px`
})

const drag = ref(null)
const sheet = ref(null)

const translationY = ref(0)
const maxHeight = ref(640)
const maxHeightString = computed(() => {
  return `${maxHeight.value}px`
})

const showOverlay = ref(false);
const overlayDismiss = ref(true);
const swipeToDismiss = ref(true)

const breakpoints = ref<number[]>([0.25, .5, 1])
const sortedBreakpoints = computed(() => {
  if (swipeToDismiss) {
    return [0, ...breakpoints.value].sort((a: number, b: number) => a - b)
  }
  return [...breakpoints.value].sort((a: number, b: number) => a - b)
})

// Get motions
const {motionProperties} = useMotionProperties(sheet, {
  y: 0
})

const {set, stop} = useSpring(motionProperties, {
  damping: 14,
  stiffness: 75,
  mass: .75,
})

const open = () => {
  // document.documentElement.style.overflowY = 'hidden'
  // document.documentElement.style.overscrollBehavior = 'none'
  set({
    y: -300,
  })
  translationY.value = -300
  showOverlay.value = true
}

const close = () => {
  // document.documentElement.style.overflowY = 'auto'
  // document.documentElement.style.overscrollBehavior = ''
  set({
    y: 0,
  })
  translationY.value = 0
  showOverlay.value = false
}

const overlayClick = () => {
  if (overlayDismiss.value) {
    close()
  }
}

useDrag(state => handler(state), {
  domTarget: drag,
})

// Drag handler
const handler = (event) => {
  // Check element existence
  if (!drag) return

  translationY.value += event.delta[1];

  if (translationY.value < sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * maxHeight.value * -1) {
    translationY.value = sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * maxHeight.value * -1;
  }

  // Apply movement values
  set({
    y: translationY.value,
  })

  let closestBreakpoint;
  // Reset the box at initial position
  if (!event.dragging) {
    const breakpointToSheet = sortedBreakpoints.value.map(breakpoint => breakpoint * maxHeight.value * -1)

    closestBreakpoint = breakpointToSheet.reduce((prev, curr) => {
      return Math.abs(curr - translationY.value) < Math.abs(prev - translationY.value) ? curr : prev;
    });


    translationY.value = closestBreakpoint;
    set({
      y: closestBreakpoint,
    })

    if (closestBreakpoint === 0) {
      close()
    }
  }
}
</script>

<style>
* {
  box-sizing: border-box;
}

body {
  min-height: 100dvh;
}

#app {
  width: 100%;
  overflow: hidden;
}

.overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: -1;
  pointer-events: auto;
}

.sheet-container {
  isolation: isolate;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.sheet-handle {
  height: 36px;
  flex-shrink: 0;
  background: red;
}

.sheet {
  display: flex;
  flex-direction: column;
  pointer-events: auto;
  position: absolute;
  top: 100%;
  width: 100%;
  max-width: 640px;
  height: v-bind(heightString);
  max-height: v-bind(maxHeightString);
  background-color: rgba(139, 92, 246, 0.8);
  border-radius: 16px 16px 0 0;
  overflow: hidden;
}

.v-enter-active,
.v-leave-active {
  transition: opacity 300ms ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}
</style>