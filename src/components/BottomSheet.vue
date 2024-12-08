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
  expandOnContentDrag?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  canSwipeClose: true,
  canOverlayClose: true,
  expandOnContentDrag: true
})

const maxHeight = defineModel('maxHeight')
const minHeight = defineModel('minHeight')

const sheet = ref<HTMLElement | null>(null);
const sheetHeader = ref<HTMLElement | null>(null);
const sheetContentWrapper = ref<HTMLElement | null>(null);

const overlay = ref<HTMLElement | null>(null);
const showSheet = ref<boolean>(false);

const {height: windowHeight} = useWindowSize()
const {height: sheetHeight} = useElementSize(sheet)
const {height: sheetContentWrapperHeight} = useElementSize(sheetContentWrapper)
const {height: sheetHandleHeight} = useElementSize(sheetHeader)
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
  showSheet.value = true;

  window.addEventListener('keydown', handleEscapeKey)
}

const close = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 0.3s ease-in-out'
  transform.translateY = sheetHeight.value;
  showSheet.value = false;

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
            transform.translateY = rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5);
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
      domTarget: sheetHeader,
      drag: {
        // preventWindowScrollY: true,
        filterTaps: false,
      },
    }
);


if (props.expandOnContentDrag) {
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
              transform.translateY = rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5);
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
        domTarget: sheetContentWrapper,
        drag: {
          // preventWindowScrollY: true,
          filterTaps: false,
        },
      }
  );
}

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
        <div class="sheet-overlay" ref="overlay" @click="overlayClick()" v-show="showSheet"/>
      </Transition>
      <div class="sheet" :class="showSheet && 'sheet-show'" ref="sheet">
        <div class="sheet-header" ref="sheetHeader">
          <slot name="header"></slot>
        </div>

        <div class="sheet-scroll">
          <div ref="sheetContentWrapper">
            <div class="sheet-content">
              <slot></slot>
            </div>
          </div>
        </div>

        <div class="sheet-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-overlay {
  z-index: -1;
  position: absolute;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.5);
  pointer-events: auto;
  user-select: none;

  will-change: opacity;
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
  background-color: #ffffff;
  bottom: 0;
  pointer-events: all;
  visibility: hidden;

  will-change: height;
}

.sheet-show {
  visibility: visible;
}

.sheet-header {
  user-select: none;
  padding: 20px 16px 8px 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 0 rgba(46, 59, 66, calc(1 * .125));
}

.sheet-header:empty {
  padding: 12px 16px 8px 16px;
  box-shadow: none;
}

.sheet-header:before {
  position: absolute;
  content: "";
  display: block;
  width: 36px;
  height: 4px;
  top: 8px;
  left: 50%;
  transform: translateX(-50%);
  border-radius: 2px;
  background-color: rgba(0, 0, 0, .28);
}

.sheet-footer {
  padding: 16px;
  box-shadow: 0 -1px 0 rgba(46, 59, 66, 0.125), 0 2px 0 #fff;
}

.sheet-footer:empty {
  display: none;
}

.sheet-scroll {
  overflow-y: auto;
}

.sheet-content {
  display: grid;
  padding: 1vh 3vh 3vh;
  user-select: none;
}

@media (prefers-color-scheme: dark) {
  .sheet {
    background-color: #242424;
  }

  .sheet-header:before {
    background-color: rgba(255, 255, 255, 0.38);
  }
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