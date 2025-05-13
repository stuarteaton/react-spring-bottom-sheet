import type { RendererElement } from 'vue'

export interface BottomSheetProps {
  duration?: number
  snapPoints?: Array<number | `${number}%`>
  initialSnapPoint?: number
  blocking?: boolean
  canSwipeClose?: boolean
  canBackdropClose?: boolean
  expandOnContentDrag?: boolean
  modelValue?: boolean
  teleportTo?: string | RendererElement
  teleportDefer?: boolean
}
