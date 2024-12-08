<script setup lang="ts">
import {computed, onMounted, ref} from 'vue'
import {useElementSize, useWindowSize} from '@vueuse/core'
import {rubberbandIfOutOfBounds, useGesture} from '@vueuse/gesture'
import {useElementStyle, useElementTransform} from '@vueuse/motion'

interface IProps {
  snapPoints: number[]
  defaultBreakpoint?: number
  canSwipeClose?: boolean
  canOverlayClose?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  canSwipeClose: true,
  canOverlayClose: true
})

const maxHeight = defineModel('maxHeight')
const minHeight = defineModel('minHeight')

const sheet = ref<HTMLElement | null>(null);
const sheetHandle = ref<HTMLElement | null>(null);
const sheetContentWrapper = ref<HTMLElement | null>(null);

const overlay = ref<HTMLElement | null>(null);
const showOverlay = ref<boolean>(false);

const {height: windowHeight} = useWindowSize()
const {height: sheetHeight} = useElementSize(sheet)
const {height: sheetContentWrapperHeight} = useElementSize(sheetContentWrapper)
const {height: sheetHandleHeight} = useElementSize(sheetHandle)
const minHeightComputed = computed(() => {
  return sheetContentWrapperHeight.value + sheetHandleHeight.value
})

const {style} = useElementStyle(sheet)
const {transform} = useElementTransform(sheet)

const currentBreakpointIndex = ref(0);
const sortedBreakpoints = computed(() => {
  return [...props.snapPoints].sort((a, b) => a - b)
});

const height = ref()
const translateY = ref(0)

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') {
    close()
  }
}

const open = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  height.value = props.defaultBreakpoint ? props.defaultBreakpoint : sortedBreakpoints.value[0];
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
        if (!sheet.value) return;


        if (translateY.value === 0) {
          height.value -= delta[1];
        }

        if (height.value <= sortedBreakpoints.value[0]) {
          height.value = sortedBreakpoints.value[0];

          translateY.value += delta[1];

          if (translateY.value >= sortedBreakpoints.value[0]) {
            translateY.value = sortedBreakpoints.value[0];
          }
          if (translateY.value <= 0) {
            translateY.value = 0;
          }

          if (props.canSwipeClose) {
            transform.translateY = translateY.value;
          } else {
            transform.translateY = rubberbandIfOutOfBounds(translateY.value, - sheetHeight.value, 0, 0.5);
          }
        }

        sheet.value.style.transition = '';
        style.height = rubberbandIfOutOfBounds(height.value, 0, sortedBreakpoints.value[sortedBreakpoints.value.length - 1], 0.25);
      },
      onDragEnd: () => {
        if (!sheet.value) return;

        findClosestIndexBreakpoint();


        translateY.value = props.canSwipeClose
            ? [0, height.value].reduce((prev, curr) => {
              return Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value)
                  ? curr
                  : prev
            })
            : 0;
        transform.translateY = translateY.value;

        if (translateY.value === height.value) {
          translateY.value = 0;
          close();
        }

        sheet.value.style.transition = 'all 0.3s ease-in-out';
        height.value = sortedBreakpoints.value[currentBreakpointIndex.value];
        style.height = sortedBreakpoints.value[currentBreakpointIndex.value];
      },
    },
    {
      domTarget: sheetHandle,
      drag: {
        preventWindowScrollY: true,
        filterTaps: false,
      },
    }
);


onMounted(() => {
  maxHeight.value = windowHeight.value;
  minHeight.value = minHeightComputed.value;

  height.value = props.defaultBreakpoint ? props.defaultBreakpoint : Number(minHeight.value);
  style.height = props.defaultBreakpoint ? props.defaultBreakpoint : Number(minHeight.value);

  transform.translateY = props.defaultBreakpoint ? props.defaultBreakpoint : Number(minHeight.value);
})

defineExpose({open, close})
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
          <div ref="sheetContentWrapper">
            <div class="sheet-content">
              <slot></slot>
            </div>
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
  display: grid;
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