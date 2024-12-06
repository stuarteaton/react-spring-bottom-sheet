<template>
  <button @click="open()">Open</button>
  <div class="sheet-container">
    <Transition name="fade">
      <div class="sheet-overlay" ref="overlay" @click="overlayClick()" v-show="showOverlay"/>
    </Transition>
    <div class="sheet" ref="sheet">
      <div class="sheet-handle" ref="sheetHandle"/>

      <div class="sheet-content" ref="sheetContent">
        <div>
          <button>test</button>
        </div>
        <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
          award-winning fireworks and seasonal special events.</p>
        <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
          award-winning fireworks and seasonal special events.</p>
        <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
          award-winning fireworks and seasonal special events.</p>
        <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
          award-winning fireworks and seasonal special events.</p>
        <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
          award-winning fireworks and seasonal special events.</p>
        <details>
          <summary>Epcot Center</summary>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
          <p>Epcot is a theme park at Walt Disney World Resort featuring exciting attractions, international pavilions,
            award-winning fireworks and seasonal special events.</p>
        </details>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import {computed, onMounted, ref, watch} from 'vue'
import {useElementSize, useWindowSize} from '@vueuse/core'
import {useDrag, useGesture} from '@vueuse/gesture'
import {useElementTransform} from '@vueuse/motion'

const sheet = ref<HTMLElement | null>(null);
const sheetHandle = ref<HTMLElement | null>(null);
const sheetContent = ref<HTMLElement | null>(null);
const isSheetContentScrolling = ref(false)

const overlay = ref<HTMLElement | null>(null);
const showOverlay = ref<boolean>(false);

const {height: sheetHeight} = useElementSize(sheet)

const {transform} = useElementTransform(sheet)

const initialBreakpoint = 0.5;
const currentBreakpointIndex = ref(0);
const breakpoints = new Set([0.25, 0.5, 1]);
const sortedBreakpoints = computed(() => {
  return [...breakpoints].sort((a, b) => a - b)
});

const translateY = ref(0)
const closestBreakpoint = ref(0)

const canSwiperClose = ref(true)
const canOverlayClose = ref(true)
const canDragContent = ref(true)

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

const open = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  translateY.value = (initialBreakpoint * sheetHeight.value - sheetHeight.value) * -1;
  transform.translateY = translateY.value
  showOverlay.value = true;

  window.addEventListener('keydown', handleEscapeKey)
}

const close = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  translateY.value = sheetHeight.value;
  transform.translateY = translateY.value
  showOverlay.value = false;

  window.removeEventListener('keydown', handleEscapeKey)
}
const overlayClick = () => {
  if (canOverlayClose.value) {
    close()
  }
}

function snapToBreakpoint() {
  const breakpointToSheet = sortedBreakpoints.value.map(breakpoint => (breakpoint * sheetHeight.value - sheetHeight.value) * -1)

  closestBreakpoint.value = breakpointToSheet.reduce((prev, curr) => {
    return Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev;
  });

  sheet.value!.style.transition = 'all 0.3s ease-in-out'

  translateY.value = closestBreakpoint.value

  if (canSwiperClose.value && translateY.value === sheetHeight.value) {
    close();
  }
}

useGesture(
    {
      onDrag: ({delta}) => {
        if (!sheet.value) return

        translateY.value += delta[1];
        if (translateY.value < 0) {
          translateY.value = 0
        }
        if (translateY.value < (sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * sheetHeight.value - sheetHeight.value) * -1) {
          translateY.value = (sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * sheetHeight.value - sheetHeight.value) * -1
        }

        sheet.value.style.transition = ''
        transform.translateY = translateY.value
      },
      onDragEnd: () => {
        snapToBreakpoint();
        transform.translateY = translateY.value
      },
    },
    {
      domTarget: sheetHandle,
    }
)

if (canDragContent.value) {
  useGesture(
      {
        onDrag: ({delta}) => {
          if (!sheet.value) return

          translateY.value += delta[1];
          if (translateY.value < 0) {
            translateY.value = 0
          }
          if (translateY.value < (sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * sheetHeight.value - sheetHeight.value) * -1) {
            translateY.value = (sortedBreakpoints.value[sortedBreakpoints.value.length - 1] * sheetHeight.value - sheetHeight.value) * -1
          }

          sheet.value.style.transition = ''
          transform.translateY = translateY.value
        },
        onDragEnd: () => {
          snapToBreakpoint();
          transform.translateY = translateY.value
        },
      },
      {
        domTarget: sheetContent,
        drag: {
          filterTaps: true,
          delay: 300,
        }
      }
  )
}

watch(
    sheetHeight,
    async () => {
      snapToBreakpoint()
    }
)

onMounted(() => {
  transform.translateY = sheetHeight.value;
})
</script>

<style>
body {
  width: 100%;
  min-height: 100dvh;
}

#app {
  padding: 0;
  width: 100%;
}

.sheet-container {
  z-index: 99999;
  max-height: 100dvh;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
  position: absolute;
  inset: 0;
  pointer-events: none;
  isolation: isolate;
}

.sheet {
  display: flex;
  flex-direction: column;
  position: absolute;
  width: 640px;
  height: fit-content;
  max-height: inherit;
  border-radius: 16px 16px 0 0;
  background-color: #535bf2;
  bottom: 0;
  pointer-events: all;
}

.sheet-handle {
  height: 36px;
  flex-shrink: 0;
  background: red;
}

.sheet-overlay {
  z-index: -1;
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  user-select: none;
}

.sheet-content {
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.5s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>