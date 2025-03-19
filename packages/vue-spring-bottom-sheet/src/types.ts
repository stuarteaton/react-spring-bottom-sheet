export interface BottomSheetProps {
  duration?: number
  snapPoints?: Array<number | `${number}%`>
  defaultSnapPoint?: number
  blocking?: boolean
  canSwipeClose?: boolean
  canBackdropClose?: boolean
  expandOnContentDrag?: boolean
}
