import { computed, ref, type Ref } from 'vue'
import { heightPercentToPixels } from '../utils/heightPercentToPixels'

export function useSnapPoints(
  snapPoints: Ref<Array<number | `${number}%`>>,
  height: Ref<number | `${number}%`>,
) {
  const currentSnapPointIndex = ref(0)

  const flattenedSnapPoints = computed(() => {
    return snapPoints.value.map((snapPoint) => {
      if (typeof snapPoint === 'string' && snapPoint.endsWith('%')) {
        return heightPercentToPixels(snapPoint)
      }

      return snapPoint as number
    })
  })

  const minSnapPoint = computed(() => Math.min(...flattenedSnapPoints.value))
  const maxSnapPoint = computed(() => Math.max(...flattenedSnapPoints.value))

  const closestSnapPointIndex = computed(() => {
    const heightValue =
      typeof height.value === 'string' ? heightPercentToPixels(height.value) : height.value

    const closest = flattenedSnapPoints.value.reduce((prev, curr) =>
      Math.abs(curr - heightValue) < Math.abs(prev - heightValue) ? curr : prev,
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
