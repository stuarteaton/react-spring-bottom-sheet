import { computed, ref, type Ref } from 'vue'
import { heightPercentToPixels } from '../utils/heightPercentToPixels'

export function useSnapPoints(
  snapPoints: Ref<Array<number | `${number}%`>>,
  height: Ref<number>,
  windowHeight: Ref<number>,
) {
  const currentSnapPointIndex = ref(0)

  const flattenedSnapPoints = computed(() => {
    return snapPoints.value.map((snapPoint) => {
      if (typeof snapPoint === 'string') {
        return heightPercentToPixels(snapPoint, windowHeight.value)
      }

      return snapPoint as number
    })
  })

  const minSnapPoint = computed(() => Math.min(...flattenedSnapPoints.value))
  const maxSnapPoint = computed(() => Math.max(...flattenedSnapPoints.value))

  const closestSnapPointIndex = computed(() => {
    const closest = flattenedSnapPoints.value.reduce((prev, curr) =>
      Math.abs(curr - height.value) < Math.abs(prev - height.value) ? curr : prev,
    )

    return flattenedSnapPoints.value.indexOf(closest)
  })

  return {
    currentSnapPointIndex,
    flattenedSnapPoints,
    minSnapPoint,
    maxSnapPoint,
    closestSnapPointIndex,
  }
}
