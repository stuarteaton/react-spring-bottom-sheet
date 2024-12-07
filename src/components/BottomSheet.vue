<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useElementSize, useWindowSize} from '@vueuse/core'
import {useGesture} from '@vueuse/gesture'
import {useElementStyle, useElementTransform} from '@vueuse/motion'

interface IProps {
  snapPoints: number[]
  defaultBreakpoint?: number
  canSwiperClose?: boolean
  canOverlayClose?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  canSwiperClose: true,
  canOverlayClose: true
})

const sheet = ref<HTMLElement | null>(null);
const sheetHandle = ref<HTMLElement | null>(null);
const sheetContent = ref<HTMLElement | null>(null);

const overlay = ref<HTMLElement | null>(null);
const showOverlay = ref<boolean>(false);

const {height: maxHeight} = useWindowSize()
const {height: sheetHeight} = useElementSize(sheet)
const {height: sheetContentHeight} = useElementSize(sheetContent)
const {height: sheetHandleHeight} = useElementSize(sheetHandle)
const minHeight = computed(() => {
  return sheetContentHeight.value + sheetHandleHeight.value
})

const {style} = useElementStyle(sheet)
const {transform} = useElementTransform(sheet)

const currentBreakpointIndex = ref(0);
const sortedBreakpoints = computed(() => {
  return [...props.snapPoints].sort((a, b) => a - b)
});

const height = ref(sheetHeight)
const translateY = ref(0)

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

const open = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  style.height = props.defaultBreakpoint ? props.defaultBreakpoint : sortedBreakpoints.value[0];
  transform.translateY = 0;
  showOverlay.value = true;

  window.addEventListener('keydown', handleEscapeKey)
}

const close = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  transform.translateY = sheetHeight.value;
  showOverlay.value = false;

  window.removeEventListener('keydown', handleEscapeKey)
}

const overlayClick = () => {
  if (props.canOverlayClose) {
    close()
  }
}

function findClosestIndexBreakpoint() {
  const closestBreakpoint = sortedBreakpoints.value.reduce((previous: number, current: number) => {
    return Math.abs(current - height.value) < Math.abs(previous - height.value) ? current : previous;
  });

  currentBreakpointIndex.value = sortedBreakpoints.value.indexOf(closestBreakpoint);
}

useGesture(
    {
      onDrag: ({delta}) => {
        if (!sheet.value) return

        height.value -= delta[1];
        if (height.value > sortedBreakpoints.value[sortedBreakpoints.value.length - 1]) {
          height.value = sortedBreakpoints.value[sortedBreakpoints.value.length - 1];
        }
        if (height.value <= sortedBreakpoints.value[0]) {
          height.value = sortedBreakpoints.value[0];

          translateY.value += delta[1];
          transform.translateY = translateY.value;

          if (translateY.value > sortedBreakpoints.value[0]) {
            translateY.value = sortedBreakpoints.value[0];
          }
          if (translateY.value <= 0) {
            translateY.value = 0;
          }
        }

        sheet.value.style.transition = ''
        style.height = height.value
      },
      onDragEnd: () => {
        if (!sheet.value) return

        findClosestIndexBreakpoint();

        translateY.value = props.canSwiperClose
            ? [0, height.value].reduce((prev, curr) => {
              return (Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev);
            }) : 0

        transform.translateY = translateY.value;

        if (translateY.value === height.value) {
          translateY.value = 0;
          close();
        }

        sheet.value.style.transition = 'all 0.3s ease-in-out'
        style.height = sortedBreakpoints.value[currentBreakpointIndex.value];
      },
    },
    {
      domTarget: sheetHandle,
      drag: {
        // bounds: {
        //   top: 0,
        //   bottom: 3000
        // },
        // rubberband: true,
      }
    }
)

onMounted(() => {
  style.height = props.defaultBreakpoint ? props.defaultBreakpoint : minHeight.value;
  transform.translateY = props.defaultBreakpoint ? props.defaultBreakpoint : minHeight.value;
})

defineExpose({open, close, maxHeight, minHeight})
</script>

<template>
  <Teleport to="body">
    <div class="sheet-container">
      <Transition name="fade">
        <div class="sheet-overlay" ref="overlay" @click="overlayClick()" v-show="showOverlay"/>
      </Transition>
      <div class="sheet" ref="sheet">
        <div class="sheet-handle" ref="sheetHandle"/>

        <div class="sheet-scroll">
          <div class="sheet-content" ref="sheetContent">
            <slot></slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
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

.sheet-scroll {
  overflow-y: auto;
}

.sheet-content {
  user-select: none;
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