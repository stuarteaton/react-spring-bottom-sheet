<script lang="ts" setup>
import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue'

import { clamp, funnel } from 'remeda'
import { useElementBounding, useWindowSize, useScrollLock } from '@vueuse/core'
import { type Handler, rubberbandIfOutOfBounds, useGesture } from '@vueuse/gesture'
import { useMotionControls, useMotionProperties, useMotionTransitions } from '@vueuse/motion'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'

import { useSnapPoints } from './composables/useSnapPoints.ts'

interface IProps {
  duration?: number
  snapPoints?: number[]
  defaultSnapPoint?: number
  blocking?: boolean
  canSwipeClose?: boolean
  canBackdropClose?: boolean
  expandOnContentDrag?: boolean
}

const props = withDefaults(defineProps<IProps>(), {
  blocking: true,
  canSwipeClose: true,
  canBackdropClose: true,
  expandOnContentDrag: true,
  duration: 250,
})

const emit = defineEmits<{
  (e: 'opened'): void
  (e: 'closed'): void
  (e: 'ready'): void
  (e: 'dragging-up'): void
  (e: 'dragging-down'): void
  (e: 'minHeight', minSheetHeight: number): void
  (e: 'maxHeight', maxSheetHeight: number): void
}>()

// Refs for DOM elements
const sheet = ref<HTMLElement | null>(null)
const sheetHeader = ref<HTMLElement | null>(null)
const sheetFooter = ref<HTMLElement | null>(null)
const sheetScroll = ref<HTMLElement | null>(null)
const sheetContentWrapper = ref<HTMLElement | null>(null)
const sheetContent = ref<HTMLElement | null>(null)

// State management refs
const backdrop = ref<HTMLElement | null>(null)
const showSheet = ref(false)
const preventScroll = ref(props.expandOnContentDrag)

// Element dimensions
const { height: windowHeight } = useWindowSize()
const { height: sheetHeight } = useElementBounding(sheet)
const { height: sheetHeaderHeight } = useElementBounding(sheetHeader)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)
const { height: sheetContentHeight } = useElementBounding(sheetContent)

// Focus trap
let focusTrap = useFocusTrap([sheet, backdrop], {
  immediate: false,
  fallbackFocus: () => sheet.value || document.body,
})

// Computed values
const minHeightComputed = computed(() =>
  Math.ceil(sheetContentHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value),
)
const transitionVisibility = computed(() => `visibility ${props.duration}ms ease-in-out`)
const transitionOpacity = computed(() => `opacity ${props.duration}ms ease-in-out`)

// Element styling and transforms
const { motionProperties } = useMotionProperties(sheet)
const { push, stop, motionValues } = useMotionTransitions()
const { set, stop: stopMotion } = useMotionControls(
  motionProperties,
  {},
  { push, motionValues, stop },
)

// Height and translation management
const height = ref<number>(0)
const translateY = ref(0)

// Snap points management
const { snapPoints: propSnapPoints } = toRefs(props)
const snapPointsRef = computed(() => propSnapPoints.value ?? [minHeightComputed.value])
const {
  minSnap,
  maxSnap,
  snapPoints: sortedSnapPoint,
  closestSnapPointIndex,
} = useSnapPoints(snapPointsRef, height)

const isWindowScrollLocked = useScrollLock(document.body)
const isWindowRootScrollLocked = useScrollLock(document.documentElement)

// Keyboard event handler
const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

// Open sheet method
const open = () => {
  if (!sheet.value) return

  height.value = Math.min(props.defaultSnapPoint ?? minSnap.value, windowHeight.value)

  set({
    height: height.value,
    y: height.value,
  })
  push('y', 0, motionProperties, {
    type: 'tween',
    easings: 'easeInOut',
    bounce: 0,
    duration: props.duration,
  })
  showSheet.value = true
  isWindowScrollLocked.value = true
  isWindowRootScrollLocked.value = true

  window.addEventListener('keydown', handleEscapeKey)

  if (props.blocking) {
    setTimeout(() => {
      if (motionValues.value.y!.get() - 0 < 0.1) {
        emit('opened')
        focusTrap.activate()
      }
    }, props.duration)
  }
}
// Close sheet method
const close = () => {
  if (!sheet.value) return

  push('y', sheetHeight.value, motionProperties, {
    type: 'tween',
    bounce: 0,
    duration: props.duration,
  })

  showSheet.value = false
  isWindowScrollLocked.value = false
  isWindowRootScrollLocked.value = false

  if (props.blocking) {
    focusTrap.deactivate()
  }

  window.removeEventListener('keydown', handleEscapeKey)

  setTimeout(() => {
    if (motionValues.value.y!.get() - sheetHeight.value < 0.1) {
      emit('closed')
    }
  }, props.duration)
}

// Backdrop click handler
const backdropClick = () => {
  if (props.canBackdropClose) close()
}

// Scroll prevention handler
function handleSheetScroll(event: TouchEvent) {
  if (preventScroll.value) {
    event.preventDefault()
  }
}

const snapToPoint = (snapPoint: number) => {
  height.value = snapPoint
  push('height', height.value, motionProperties, {
    type: 'tween',
    easings: 'easeInOut',
    bounce: 0,
    duration: props.duration,
  })
}

const handleDrag: Handler<'drag', PointerEvent> | undefined = ({
  delta: [_deltaX, _deltaY],
  direction: [_directionX, _directionY],
}) => {
  if (!sheet.value) return

  if (translateY.value <= 0) {
    height.value -= _deltaY
  }

  if (height.value <= minSnap.value) {
    height.value = minSnap.value

    translateY.value += _deltaY

    set({
      y: props.canSwipeClose
        ? clamp(translateY.value, { min: 0 })
        : clamp(rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5), { min: 0 }),
    })
  }

  set({
    height: clamp(rubberbandIfOutOfBounds(height.value, 0, maxSnap.value, 0.25), {
      min: 0,
      max: windowHeight.value,
    }),
  })

  if (_directionY > 0) {
    emit('dragging-down')
  } else if (_directionY < 0) {
    emit('dragging-up')
  }
}

const handleDragEnd: Handler<'drag', PointerEvent> | undefined = () => {
  if (!sheet.value) return

  translateY.value = props.canSwipeClose
    ? [0, height.value].reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev,
      )
    : 0
  push('y', translateY.value, motionProperties, {
    type: 'tween',
    easings: 'easeInOut',
    bounce: 0,
    duration: props.duration,
  })

  if (translateY.value === height.value) {
    translateY.value = 0
    close()
  }

  height.value = Math.min(sortedSnapPoint.value[closestSnapPointIndex.value], windowHeight.value)
  push('height', height.value, motionProperties, {
    type: 'tween',
    easings: 'easeInOut',
    bounce: 0,
    duration: props.duration,
  })
}

useGesture(
  {
    onDragStart: () => {
      height.value = sheetHeight.value
      translateY.value = motionValues.value.y!.get()
      stopMotion()
    },
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
  },
  {
    domTarget: sheetHeader,
    drag: { filterTaps: true },
  },
)

useGesture(
  {
    onDragStart: () => {
      height.value = sheetHeight.value
      translateY.value = motionValues.value.y!.get()
      stopMotion()
    },
    onDrag: handleDrag,
    onDragEnd: handleDragEnd,
  },
  {
    domTarget: sheetFooter,
    drag: { filterTaps: true },
  },
)

useGesture(
  {
    onDragStart: ({ direction: [_directionX, _directionY] }) => {
      height.value = sheetHeight.value
      translateY.value = motionValues.value.y!.get()
      stopMotion()

      const isAtTop = sheetScroll.value!.scrollTop === 0
      const isDraggingDown = _directionY > 0
      const hasSingleSnapPoint = sortedSnapPoint.value.length === 1

      if (hasSingleSnapPoint) {
        if (translateY.value === 0 && isAtTop) {
          preventScroll.value = isDraggingDown
        }
      } else {
        if (props.expandOnContentDrag && height.value !== maxSnap.value) {
          preventScroll.value = true
        }

        if (height.value === maxSnap.value && isAtTop) {
          preventScroll.value = isDraggingDown
        }
      }
    },
    onDrag: ({ delta: [_deltaX, _deltaY], direction: [_directionX, _directionY] }) => {
      if (!props.expandOnContentDrag) {
        preventScroll.value = false
        return
      }

      if (!sheet.value) return

      if (translateY.value === 0 && preventScroll.value && props.expandOnContentDrag) {
        height.value -= _deltaY
      }

      if (height.value <= minSnap.value) {
        height.value = minSnap.value

        if (preventScroll.value && props.expandOnContentDrag) {
          translateY.value += _deltaY
        }

        translateY.value = clamp(translateY.value, { min: 0, max: minSnap.value })

        set({
          y: props.canSwipeClose
            ? translateY.value
            : rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5),
        })
      }

      if (height.value > maxSnap.value) {
        height.value = maxSnap.value
      }

      height.value = Math.min(height.value, windowHeight.value)

      const isAtTop = sheetScroll.value!.scrollTop === 0
      if (sortedSnapPoint.value.length === 1) {
        if (_deltaY < 0 && translateY.value === 0 && isAtTop) {
          preventScroll.value = false
        }
      } else {
        if (height.value === maxSnap.value) {
          preventScroll.value = false
        }
      }

      set({
        height: height.value,
      })

      if (_directionY > 0) {
        emit('dragging-down')
      } else if (_directionY < 0) {
        emit('dragging-up')
      }
    },
    onDragEnd: handleDragEnd,
  },
  {
    domTarget: sheetContentWrapper,
    drag: { filterTaps: true },
  },
)

const debouncedMaxHeightUpdate = funnel(
  () => {
    emit('maxHeight', windowHeight.value)

    nextTick(() => {
      height.value = sortedSnapPoint.value[closestSnapPointIndex.value]
      snapToPoint(sortedSnapPoint.value[closestSnapPointIndex.value])
    })
  },
  { minQuietPeriodMs: 50 },
)

// Watchers
watch(windowHeight, () => {
  debouncedMaxHeightUpdate.call()
})

watch(minHeightComputed, () => {
  emit('minHeight', minHeightComputed.value)

  if (sortedSnapPoint.value.length === 1) {
    nextTick(() => {
      if (sortedSnapPoint.value[0] === minHeightComputed.value) {
        snapToPoint(Math.min(minHeightComputed.value, windowHeight.value))
      }
    })
  }
})

// Lifecycle hook
onMounted(() => {
  emit('minHeight', minHeightComputed.value)
  emit('maxHeight', windowHeight.value)

  height.value = props.defaultSnapPoint ?? Number(minHeightComputed.value)

  set({
    height: height.value,
    y: height.value,
  })

  nextTick(() => {
    emit('ready')
  })
})

// Expose methods
defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport to="body">
    <div data-vsbs-container>
      <Transition name="fade">
        <div
          v-show="showSheet && blocking"
          ref="backdrop"
          data-vsbs-backdrop
          @click="backdropClick()"
        />
      </Transition>
      <div
        ref="sheet"
        :data-vsbs-shadow="!blocking"
        :data-vsbs-sheet-show="showSheet"
        aria-modal="true"
        data-vsbs-sheet
        tabindex="-1"
      >
        <div ref="sheetHeader" data-vsbs-header>
          <slot name="header" />
        </div>

        <div ref="sheetScroll" data-vsbs-scroll @touchmove="handleSheetScroll">
          <div ref="sheetContentWrapper" data-vsbs-content-wrapper>
            <div ref="sheetContent" data-vsbs-content>
              <slot />
            </div>
          </div>
        </div>

        <div ref="sheetFooter" data-vsbs-footer>
          <slot name="footer" />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
[data-vsbs-container] {
  position: fixed;
  inset: 0px;
  overflow: hidden;
  pointer-events: none;
  z-index: 9999;
  visibility: visible;
}

[data-vsbs-backdrop] {
  background-color: var(--vsbs-backdrop-bg, rgba(0, 0, 0, 0.5));
  inset: 0;
  pointer-events: auto;
  position: fixed;
  user-select: none;
  will-change: opacity;
  z-index: 1;
}

[data-vsbs-shadow='true'] {
  box-shadow: 0 -5px 60px 0 var(--vsbs-shadow-color, rgba(89, 89, 89, 0.2));
}

[data-vsbs-sheet] {
  background-color: var(--vsbs-background, #fff);
  border-top-left-radius: var(--vsbs-border-radius, 16px);
  border-top-right-radius: var(--vsbs-border-radius, 16px);
  bottom: 0;
  display: flex;
  flex-direction: column;
  left: 0;
  margin-left: auto;
  margin-right: auto;
  max-height: inherit;
  max-width: var(--vsbs-max-width, 640px);
  pointer-events: all;
  position: fixed;
  right: 0;
  transition: v-bind(transitionVisibility);
  visibility: hidden;
  width: 100%;
  will-change: height;
  z-index: 2;
}

[data-vsbs-sheet-show='true'] {
  visibility: visible;
}

[data-vsbs-header] {
  box-shadow: 0 1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
  flex-shrink: 0;
  padding: 20px var(--vsbs-padding-x, 16px) 8px;
  user-select: none;
  z-index: 3;
}

[data-vsbs-header]:before {
  background-color: var(--vsbs-handle-background, rgba(0, 0, 0, 0.28));
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

[data-vsbs-header]:empty {
  box-shadow: none;
  padding: 12px var(--vsbs-padding-x, 16px) 8px;
}

[data-vsbs-footer] {
  box-shadow: 0 -1px 0 var(--vsbs-border-color, rgba(46, 59, 66, 0.125));
  flex-grow: 0;
  flex-shrink: 0;
  padding: 16px var(--vsbs-padding-x, 16px);
  user-select: none;
}

[data-vsbs-footer]:empty {
  display: none;
}

[data-vsbs-scroll] {
  flex-grow: 1;
  overflow-y: auto;
  overscroll-behavior: contain;
}

[data-vsbs-content-wrapper] {
  height: 100%;
}

[data-vsbs-content] {
  display: grid;
  padding: 1vh var(--vsbs-padding-x, 16px);
  user-select: none;
}

.fade-enter-active,
.fade-leave-active {
  transition: v-bind(transitionOpacity);
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
