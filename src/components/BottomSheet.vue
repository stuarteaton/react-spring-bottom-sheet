<script lang="ts" setup>
import { ref, computed, onMounted, toRefs } from 'vue'
import { useElementBounding, useWindowSize } from '@vueuse/core'
import { rubberbandIfOutOfBounds, useGesture } from '@vueuse/gesture'
import { useElementStyle, useElementTransform } from '@vueuse/motion'
import { useSnapPoints } from '../composables/useSnapPoints'

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
  expandOnContentDrag: true,
})

const maxHeight = defineModel<number>('maxHeight')
const minHeight = defineModel<number>('minHeight')

// Refs for DOM elements
const sheet = ref<HTMLElement | null>(null)
const sheetHeader = ref<HTMLElement | null>(null)
const sheetFooter = ref<HTMLElement | null>(null)
const sheetScroll = ref<HTMLElement | null>(null)
const sheetContentWrapper = ref<HTMLElement | null>(null)

// State management refs
const preventScroll = ref(true)
const overlay = ref<HTMLElement | null>(null)
const showSheet = ref(false)

// Element dimensions
const { height: windowHeight } = useWindowSize()
const { height: sheetHeight } = useElementBounding(sheet)
const { height: sheetHeaderHeight } = useElementBounding(sheetHeader)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)
const { height: sheetContentWrapperHeight } = useElementBounding(sheetContentWrapper)

// Computed minimum height
const minHeightComputed = computed(() => Math.ceil(sheetContentWrapperHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value))

// Element styling and transforms
const { style } = useElementStyle(sheet)
const { transform } = useElementTransform(sheet)

// Height and translation management
const height = ref<number>(0)
const translateY = ref(0)

// Snap points management
const { snapPoints: propSnapPoints } = toRefs(props)
const { minSnap, maxSnap, snapPoints, closestSnapPoint } = useSnapPoints(propSnapPoints, height)

// Keyboard event handler
const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

// Open sheet method
const open = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 250ms ease-in-out'
  height.value = props.defaultBreakpoint ?? minSnap.value
  style.height = height.value
  transform.translateY = 0
  showSheet.value = true

  window.addEventListener('keydown', handleEscapeKey)
}

// Close sheet method
const close = () => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 250ms ease-in-out'
  transform.translateY = sheetHeight.value
  showSheet.value = false

  window.removeEventListener('keydown', handleEscapeKey)
}

// Overlay click handler
const overlayClick = () => {
  if (props.canOverlayClose) close()
}

// Scroll prevention handler
function handleSheetScroll(event: TouchEvent) {
  if (preventScroll.value) {
    event.preventDefault()
  }
}

const snapToPoint = (index: number) => {
  if (!sheet.value) return

  sheet.value.style.transition = 'all 250ms ease-in-out'
  height.value = snapPoints.value[index]
  style.height = height.value
}

// Header drag gesture
useGesture(
  {
    onDrag: ({ delta }) => {
      if (!sheet.value) return

      if (translateY.value === 0) {
        height.value -= delta[1]
      }

      if (height.value <= minSnap.value) {
        height.value = minSnap.value

        translateY.value += delta[1]
        translateY.value = Math.max(0, Math.min(translateY.value, minSnap.value))

        transform.translateY = props.canSwipeClose
          ? translateY.value
          : rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5)
      }

      sheet.value.style.transition = ''
      style.height = rubberbandIfOutOfBounds(height.value, 0, maxSnap.value, 0.25)
    },
    onDragEnd: () => {
      if (!sheet.value) return

      translateY.value = props.canSwipeClose
        ? [0, height.value].reduce((prev, curr) => (Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev))
        : 0
      transform.translateY = translateY.value

      if (translateY.value === height.value) {
        translateY.value = 0
        close()
      }

      sheet.value.style.transition = 'all 250ms ease-in-out'
      height.value = snapPoints.value[closestSnapPoint.value]
      style.height = height.value
    },
  },
  {
    domTarget: sheetHeader,
    drag: { filterTaps: true },
  },
)

// Content wrapper drag gesture
if (props.expandOnContentDrag) {
  useGesture(
    {
      onDragStart: ({ direction }) => {
        const isAtTop = sheetScroll.value!.scrollTop === 0
        const isDraggingDown = direction[1] > 0
        const hasSingleSnapPoint = snapPoints.value.length === 1

        if (hasSingleSnapPoint) {
          if (translateY.value === 0 && isAtTop) {
            preventScroll.value = isDraggingDown
          }
        } else {
          if (height.value === maxSnap.value && isAtTop) {
            preventScroll.value = isDraggingDown
          }
        }
      },
      onDrag: ({ delta }) => {
        if (!sheet.value) return

        if (translateY.value === 0 && preventScroll.value) {
          height.value -= delta[1]
        }

        if (height.value <= minSnap.value) {
          height.value = minSnap.value

          if (preventScroll.value) {
            translateY.value += delta[1]
          }

          translateY.value = Math.max(0, Math.min(translateY.value, minSnap.value))

          transform.translateY = props.canSwipeClose
            ? translateY.value
            : rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5)
        }

        if (height.value > maxSnap.value) {
          height.value = maxSnap.value
        }

        const isAtTop = sheetScroll.value!.scrollTop === 0
        if (snapPoints.value.length === 1) {
          if (delta[1] < 0 && translateY.value === 0 && isAtTop) {
            preventScroll.value = false
          }
        } else {
          if (height.value === maxSnap.value) {
            preventScroll.value = false
          }
        }

        sheet.value.style.transition = ''
        style.height = height.value
      },
      onDragEnd: () => {
        if (!sheet.value) return

        translateY.value = props.canSwipeClose
          ? [0, height.value].reduce((prev, curr) => (Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev))
          : 0
        transform.translateY = translateY.value

        if (translateY.value === height.value) {
          translateY.value = 0
          close()
        }

        sheet.value.style.transition = 'all 250ms ease-in-out'
        height.value = snapPoints.value[closestSnapPoint.value]
        style.height = height.value
      },
    },
    {
      domTarget: sheetContentWrapper,
      drag: { filterTaps: true },
    },
  )
}

// Lifecycle hook
onMounted(() => {
  maxHeight.value = windowHeight.value
  minHeight.value = minHeightComputed.value

  height.value = props.defaultBreakpoint ?? Number(minHeightComputed.value)
  style.height = height.value
  transform.translateY = height.value
})

// Expose methods
defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport to="body">
    <div class="sheet-container" tabindex="-1" :aria-hidden="!showSheet">
      <Transition name="fade">
        <div v-show="showSheet" ref="overlay" class="sheet-overlay" @click="overlayClick()" />
      </Transition>
      <div ref="sheet" :class="showSheet && 'sheet-show'" class="sheet">
        <div ref="sheetHeader" class="sheet-header">
          <slot name="header"></slot>
        </div>

        <div ref="sheetScroll" class="sheet-scroll" @touchmove="handleSheetScroll">
          <div ref="sheetContentWrapper">
            <div class="sheet-content">
              <slot></slot>
            </div>
          </div>
        </div>

        <div ref="sheetFooter" class="sheet-footer">
          <slot name="footer"></slot>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.sheet-overlay {
  background-color: rgba(0, 0, 0, 0.5);
  inset: 0;
  pointer-events: auto;
  position: absolute;
  user-select: none;
  will-change: opacity;
  z-index: -1;
}

.sheet-container {
  align-items: center;
  display: flex;
  inset: 0;
  isolation: isolate;
  justify-content: center;
  max-height: 100dvh;
  overflow: hidden;
  pointer-events: none;
  position: absolute;
  width: 100%;
  z-index: 99999;
}

.sheet {
  background-color: #ffffff;
  border-radius: 16px 16px 0 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
  max-height: inherit;
  pointer-events: all;
  position: absolute;
  visibility: hidden;
  width: 640px;
  will-change: height;
}

.sheet-show {
  visibility: visible;
}

.sheet-header {
  box-shadow: 0 1px 0 rgba(46, 59, 66, 0.125);
  flex-shrink: 0;
  padding: 20px 16px 8px 16px;
  user-select: none;
}

.sheet-header:before {
  background-color: rgba(0, 0, 0, 0.28);
  border-radius: 2px;
  content: '';
  display: block;
  height: 4px;
  left: 50%;
  position: absolute;
  top: 8px;
  transform: translateX(-50%);
  width: 36px;
}

.sheet-footer {
  box-shadow: 0 -1px 0 rgba(46, 59, 66, 0.125);
  flex-grow: 0;
  flex-shrink: 0;
  padding: 16px;
  user-select: none;
}

.sheet-scroll {
  flex-grow: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
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

  .sheet-header {
    box-shadow: 0 1px 0 rgba(255, 255, 255, 0.16);
  }

  .sheet-header:before {
    background-color: rgba(255, 255, 255, 0.38);
  }

  .sheet-footer {
    box-shadow: 0 -1px 0 rgba(255, 255, 255, 0.16);
  }
}

.sheet-header:empty {
  box-shadow: none;
  padding: 12px 16px 8px 16px;
}

.sheet-footer:empty {
  display: none;
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
