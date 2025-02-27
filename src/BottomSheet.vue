<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { Motion, AnimatePresence, useAnimationControls } from 'motion-v'
import type { PanInfo, TransformProperties } from 'motion-v'

import { computed, nextTick, onMounted, ref, toRefs, watch } from 'vue'
import { useElementBounding, useScrollLock, useWindowSize } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useSnapPoints } from './composables/useSnapPoints'
import { clamp, funnel } from 'remeda'

const props = withDefaults(defineProps<BottomSheetProps>(), {
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
  (e: 'instinctHeight', instinctHeight: number): void
}>()

// Refs for DOM elements
const sheet = ref()
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
const { height: sheetContentHeight } = useElementBounding(sheetContent)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)

// Focus trap
const focusTrap = useFocusTrap([sheet, backdrop], {
  immediate: false,
  fallbackFocus: () => sheet.value || document.body,
})

// Computed values
const instinctHeightComputed = computed({
  get() {
    return Math.ceil(sheetContentHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value)
  },
  set(newValue: number[]) {
    ;[sheetHeaderHeight.value, sheetContentHeight.value, sheetFooterHeight.value] = newValue
  },
})

// Height and translation management.value
const height = ref<number>(0)
const translateY = ref<number>(0)
let currentTranslateY: string = '0%'
// const currentTranslateY = () => parseInt(currentTranslateYPX.value.replace('px', ''))

// Snap points management
const { snapPoints: propSnapPoints } = toRefs(props)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeightComputed.value])
const { flattenedSnapPoints, currentSnapPointIndex, minSnapPoint } = useSnapPoints(
  snapPointsRef,
  height,
)

// Element transforms
function template({ y }: TransformProperties) {
  currentTranslateY = y as string

  return `translateY(${y})`
}

const controls = useAnimationControls()

const isWindowScrollLocked = useScrollLock(document.body)
const isWindowRootScrollLocked = useScrollLock(document.documentElement)

function handleTouchMove(event: TouchEvent) {
  preventScroll.value = true
  handleSheetScroll(event)
}

function handleSheetScroll(event: TouchEvent) {
  if (preventScroll.value) {
    event.preventDefault()
  }
}

const handleEscapeKey = (e: KeyboardEvent) => {
  if (e.key === 'Escape') close()
}

const backdropClick = () => {
  if (props.canBackdropClose) close()
}

const open = async () => {
  showSheet.value = true

  if (props.blocking) {
    isWindowScrollLocked.value = true
    isWindowRootScrollLocked.value = true
  }

  await nextTick()

  const sheetElement = sheet.value.$el as HTMLElement
  sheetHeight.value = sheetElement.getBoundingClientRect().height

  const sheetContentElement = sheetElement.querySelector('[data-vsbs-content]') as HTMLElement
  const sheetHeaderElement = sheetElement.querySelector('[data-vsbs-header]') as HTMLElement
  const sheetFooterElement = sheetElement.querySelector('[data-vsbs-footer]') as HTMLElement

  instinctHeightComputed.value = [
    sheetHeaderElement.getBoundingClientRect().height,
    sheetContentElement.getBoundingClientRect().height,
    sheetFooterElement.getBoundingClientRect().height,
  ]

  await nextTick()

  currentSnapPointIndex.value = flattenedSnapPoints.value.findIndex(
    (point) => point === minSnapPoint.value,
  )

  controls.set({
    height: clamp(minSnapPoint.value, {
      max: windowHeight.value,
    }),
  })

  controls.start({
    height: clamp(minSnapPoint.value, {
      max: windowHeight.value,
    }),
    y: 0,
  })

  window.addEventListener('keydown', handleEscapeKey)

  if (props.blocking) {
    setTimeout(() => {
      if (parseInt(currentTranslateY.replace('%', '')) - 0 < 0.1) {
        emit('opened')
        focusTrap.activate()
      }
    }, props.duration)
  }
}

const close = () => {
  showSheet.value = false

  if (props.blocking) {
    isWindowScrollLocked.value = false
    isWindowRootScrollLocked.value = false
  }

  window.removeEventListener('keydown', handleEscapeKey)

  if (props.blocking) {
    focusTrap.deactivate()
  }
}

const snapToPoint = (index: number) => {
  if (!props.snapPoints) return

  currentSnapPointIndex.value = index

  const snapPoint =
    typeof props.snapPoints[index] === 'number'
      ? clamp(props.snapPoints[index], {
          max: windowHeight.value,
        })
      : props.snapPoints[index]

  controls.start({
    height: snapPoint,
    y: 0,
  })
}

const debouncedSnapping = funnel(
  // Callback receives accumulated state from reducer
  ([value, oldValue]: number[][]) => {
    if (value[currentSnapPointIndex.value] !== oldValue[currentSnapPointIndex.value]) {
      controls.start({
        height: clamp(value[currentSnapPointIndex.value], {
          max: windowHeight.value,
        }),
        y: 0,
      })
    }
  },
  {
    minQuietPeriodMs: props.duration,
    // Reducer accumulates arguments from .call() invocations
    reducer: (prev: number[][] | undefined, value: number[], oldValue: number[]) => [
      value,
      oldValue,
    ],
  },
)

// Pass arguments to .call()
// messageFunnel.call('Hello')

watch(flattenedSnapPoints, async (value, oldValue) => {
  controls.stop()

  debouncedSnapping.call(value, oldValue)
})

watch(instinctHeightComputed, (value) => {
  emit('instinctHeight', value)
})

defineExpose({ open, close, snapToPoint })
</script>

<template>
  <Teleport to="body">
    <div data-vsbs-container>
      <AnimatePresence>
        <Motion
          v-if="showSheet && blocking"
          ref="backdrop"
          data-vsbs-backdrop
          @click="backdropClick()"
          :transition="{
            ease: 'easeInOut',
            duration: duration / 1000,
          }"
          :initial="{ opacity: 0 }"
          :animate="{ opacity: 1 }"
          :exit="{ opacity: 0 }"
        />
      </AnimatePresence>

      <AnimatePresence>
        <Motion
          v-if="showSheet"
          ref="sheet"
          :transition="{
            ease: 'easeInOut',
            duration: duration / 1000,
          }"
          :initial="{ y: '100%' }"
          :exit="{ y: '100%' }"
          :transform-template="template"
          :data-vsbs-shadow="!blocking"
          :animate="controls"
          :data-vsbs-sheet-show="showSheet"
          aria-modal="true"
          data-vsbs-sheet
          tabindex="-1"
        >
          <Motion ref="sheetHeader" data-vsbs-header @touchmove="handleTouchMove">
            <!-- @pan-start="handlePanStart" -->
            <!-- @pan="handlePan" -->
            <!-- @pan-end="handlePanEnd" -->
            <slot name="header" />
          </Motion>
          <div ref="sheetScroll" data-vsbs-scroll>
            <Motion
              ref="sheetContentWrapper"
              data-vsbs-content-wrapper
              @touchmove="handleSheetScroll"
            >
              <!-- @pan-start="handleContentPanStart" -->
              <!-- @pan="handleContentPan" -->
              <!-- @pan-end="handlePanEnd" -->
              <div ref="sheetContent" data-vsbs-content>
                <slot />
              </div>
            </Motion>
          </div>
          <Motion ref="sheetFooter" data-vsbs-footer @touchmove="handleTouchMove">
            <!-- @pan-start="handlePanStart" -->
            <!-- @pan="handlePan" -->
            <!-- @pan-end="handlePanEnd" -->
            <slot name="footer" />
          </Motion>
        </Motion>
      </AnimatePresence>
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
</style>
