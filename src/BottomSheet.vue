<script setup lang="ts">
import type { BottomSheetProps } from './types'

import { Motion, AnimatePresence, useAnimationControls } from 'motion-v'
import type { PanInfo, TransformProperties } from 'motion-v'

import { computed, nextTick, ref, toRefs, watch } from 'vue'
import { useElementBounding, useScrollLock, useWindowSize } from '@vueuse/core'
import { useFocusTrap } from '@vueuse/integrations/useFocusTrap'
import { useSnapPoints } from './composables/useSnapPoints'
import { clamp, funnel, round } from 'remeda'
import { rubberbandIfOutOfBounds } from './utils/rubberbandIfOutOfBounds'
import { translateYToNumber } from './utils/translateYPercentToPx'
import { heightPercentToPixels } from './utils/heightPercentToPixels'

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

const sheet = ref()
const sheetHeader = ref<HTMLElement | null>(null)
const sheetFooter = ref<HTMLElement | null>(null)
const sheetScroll = ref<HTMLElement | null>(null)
const sheetContentWrapper = ref<HTMLElement | null>(null)
const sheetContent = ref<HTMLElement | null>(null)

const backdrop = ref<HTMLElement | null>(null)
const showSheet = ref(false)
const preventScroll = ref(props.expandOnContentDrag)

const { height: windowHeight } = useWindowSize()
const { height: sheetHeight } = useElementBounding(sheet)
const { height: sheetHeaderHeight } = useElementBounding(sheetHeader)
const { height: sheetContentHeight } = useElementBounding(sheetContent)
const { height: sheetFooterHeight } = useElementBounding(sheetFooter)

const focusTrap = useFocusTrap([sheet, backdrop], {
  immediate: false,
  fallbackFocus: () => sheet.value || document.body,
})

const instinctHeightComputed = computed({
  get() {
    return clamp(
      Math.ceil(sheetContentHeight.value + sheetHeaderHeight.value + sheetFooterHeight.value),
      {
        max: windowHeight.value,
      },
    )
  },
  set(newValue: number[]) {
    ;[sheetHeaderHeight.value, sheetContentHeight.value, sheetFooterHeight.value] = newValue
  },
})

const height = ref<number | `${number}%`>(0)
const translateY = ref<number>(0)
const currentTranslateYTemplate = ref('0%')
const currentTranslateY = computed(() =>
  translateYToNumber(currentTranslateYTemplate.value, sheetHeight.value),
)

const { snapPoints: propSnapPoints } = toRefs(props)
const snapPointsRef = computed(() => propSnapPoints.value ?? [instinctHeightComputed.value])
const {
  flattenedSnapPoints,
  currentSnapPointIndex,
  closestSnapPointIndex,
  minSnapPoint,
  maxSnapPoint,
} = useSnapPoints(snapPointsRef, height)

function template({ y }: TransformProperties) {
  currentTranslateYTemplate.value = y as string

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

  height.value = clamp(minSnapPoint.value, {
    max: windowHeight.value,
  })

  controls.set({
    height: height.value,
  })

  controls.start({
    height: height.value,
    y: 0,
  })

  window.addEventListener('keydown', handleEscapeKey)

  if (props.blocking) {
    setTimeout(() => {
      if (parseInt(currentTranslateYTemplate.value.replace('%', '')) - 0 < 0.1) {
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

  setTimeout(() => {
    emit('closed')
  }, props.duration)
}

const snapToPoint = (index: number) => {
  if (!snapPointsRef.value) return

  if (index < 0 || index >= snapPointsRef.value.length) {
    console.warn('Index out of bounds')
    return
  }

  currentSnapPointIndex.value = index

  const snapPoint =
    typeof snapPointsRef.value[index] === 'number'
      ? clamp(snapPointsRef.value[index], {
          max: windowHeight.value,
        })
      : snapPointsRef.value[index]

  height.value = snapPoint

  controls.start({
    height: height.value,
    y: 0,
  })
}

const handlePanStart = () => {
  isWindowScrollLocked.value = true
  isWindowRootScrollLocked.value = true

  height.value = sheetHeight.value

  translateY.value = currentTranslateY.value

  controls.stop()
}

const handlePan = (_: PointerEvent, info: PanInfo) => {
  if (!sheet.value) return
  if (typeof height.value == 'string') {
    height.value = heightPercentToPixels(height.value)
  }

  if (translateY.value <= 0) {
    height.value -= info.delta.y
  }

  if (height.value <= minSnapPoint.value) {
    height.value = minSnapPoint.value

    translateY.value += info.delta.y

    controls.set({
      y: props.canSwipeClose
        ? clamp(translateY.value, { min: 0 })
        : clamp(rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5), { min: 0 }),
    })
  }

  controls.set({
    height: clamp(rubberbandIfOutOfBounds(height.value, 0, maxSnapPoint.value, 0.25), {
      min: 0,
      max: windowHeight.value,
    }),
  })

  if (info.delta.y > 0) {
    emit('dragging-down')
  } else if (info.delta.y < 0) {
    emit('dragging-up')
  }
}

const handlePanEnd = () => {
  if (typeof height.value == 'string') {
    height.value = heightPercentToPixels(height.value)
  }

  if (!props.blocking) {
    isWindowScrollLocked.value = false
    isWindowRootScrollLocked.value = false
  }

  translateY.value = props.canSwipeClose
    ? [0, height.value].reduce((prev, curr) =>
        Math.abs(curr - translateY.value) < Math.abs(prev - translateY.value) ? curr : prev,
      )
    : 0
  controls.start({ y: translateY.value })

  if (translateY.value === height.value) {
    translateY.value = 0
    close()
  }

  currentSnapPointIndex.value = closestSnapPointIndex.value
  const snapPoint =
    typeof snapPointsRef.value[closestSnapPointIndex.value] === 'number'
      ? clamp(snapPointsRef.value[closestSnapPointIndex.value] as number, {
          max: windowHeight.value,
        })
      : snapPointsRef.value[closestSnapPointIndex.value]

  height.value = snapPoint

  controls.start({ y: 0, height: height.value })
}

const handleContentPanStart = (_: PointerEvent, info: PanInfo) => {
  isWindowScrollLocked.value = true
  isWindowRootScrollLocked.value = true

  height.value = sheetHeight.value
  translateY.value = currentTranslateY.value
  controls.stop()

  const isAtTop = sheetScroll.value!.scrollTop === 0
  const isDraggingDown = info.delta.y > 0
  const hasSingleSnapPoint = flattenedSnapPoints.value.length === 1

  if (hasSingleSnapPoint) {
    if (translateY.value === 0 && isAtTop) {
      preventScroll.value = isDraggingDown
    }
  } else {
    if (props.expandOnContentDrag && height.value !== maxSnapPoint.value) {
      preventScroll.value = true
    }

    if (round(height.value, 1) === maxSnapPoint.value && !isAtTop) {
      preventScroll.value = false
    }
  }
}

const handleContentPan = (_: PointerEvent, info: PanInfo) => {
  if (typeof height.value == 'string') {
    height.value = heightPercentToPixels(height.value)
  }

  if (!props.expandOnContentDrag) {
    preventScroll.value = false
    return
  }

  if (!sheet.value) return

  if (translateY.value === 0 && preventScroll.value && props.expandOnContentDrag) {
    height.value -= info.delta.y
  }

  if (height.value <= minSnapPoint.value) {
    height.value = minSnapPoint.value

    if (preventScroll.value && props.expandOnContentDrag) {
      translateY.value += info.delta.y
    }

    translateY.value = clamp(translateY.value, { min: 0, max: minSnapPoint.value })

    controls.set({
      y: props.canSwipeClose
        ? translateY.value
        : rubberbandIfOutOfBounds(translateY.value, -sheetHeight.value, 0, 0.5),
    })
  }

  if (height.value > maxSnapPoint.value) {
    height.value = maxSnapPoint.value
  }

  height.value = clamp(height.value, { max: windowHeight.value })

  const isAtTop = sheetScroll.value!.scrollTop === 0
  if (flattenedSnapPoints.value.length === 1) {
    if (info.delta.y < 0 && translateY.value === 0 && isAtTop) {
      preventScroll.value = false
    }
  } else {
    if (height.value === maxSnapPoint.value) {
      preventScroll.value = false
    }
  }

  controls.set({
    height: height.value,
  })

  if (info.delta.y > 0) {
    emit('dragging-down')
  } else if (info.delta.y < 0) {
    emit('dragging-up')
  }
}

const debouncedSnapToPoint = funnel((index) => snapToPoint(index), {
  minQuietPeriodMs: props.duration,
  reducer: (prev: number | undefined, index: number) => index,
})

watch(snapPointsRef, (value, oldValue) => {
  if (showSheet.value === false) return

  if (!value) return
  if (!oldValue) return

  const currentSnapPoint = value[currentSnapPointIndex.value]
  const previousSnapPoint = oldValue[currentSnapPointIndex.value]

  if (typeof currentSnapPoint === 'string') return
  if (typeof previousSnapPoint === 'string') return

  height.value = clamp(currentSnapPoint, {
    max: windowHeight.value,
  })

  if (currentSnapPoint !== previousSnapPoint) {
    controls.start({
      height: height.value,
      y: 0,
    })
  }
})

watch(windowHeight, () => {
  debouncedSnapToPoint.call(currentSnapPointIndex.value)
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
          :exit="{ y: '100%', height: sheetHeight }"
          :initial="{ y: '100%' }"
          :transform-template="template"
          :data-vsbs-shadow="!blocking"
          :animate="controls"
          :data-vsbs-sheet-show="showSheet"
          aria-modal="true"
          data-vsbs-sheet
          tabindex="-1"
        >
          <Motion
            ref="sheetHeader"
            data-vsbs-header
            @pan-start="handlePanStart"
            @pan="handlePan"
            @pan-end="handlePanEnd"
            @touchmove="handleTouchMove"
          >
            <slot name="header" />
          </Motion>
          <div ref="sheetScroll" data-vsbs-scroll>
            <Motion
              ref="sheetContentWrapper"
              data-vsbs-content-wrapper
              @pan-start="handleContentPanStart"
              @pan="handleContentPan"
              @pan-end="handlePanEnd"
              @touchmove="handleSheetScroll"
            >
              <div ref="sheetContent" data-vsbs-content>
                <slot />
              </div>
            </Motion>
          </div>
          <Motion
            ref="sheetFooter"
            data-vsbs-footer
            @pan-start="handlePanStart"
            @pan="handlePan"
            @pan-end="handlePanEnd"
            @touchmove="handleTouchMove"
          >
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
  padding: 8px var(--vsbs-padding-x, 16px);
  user-select: none;
}
</style>
