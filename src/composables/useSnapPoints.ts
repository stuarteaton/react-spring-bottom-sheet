import { computed, ref, type Ref } from 'vue'
import { heightPercentToPixels } from '../utils/heightPercentToPixels'

export function useSnapPoints(snapPoints: Ref<Array<number | `${number}%`>>, height: Ref<number>) {
  const currentSnapPointIndex = ref(0)

  const flattenedSnapPoints = computed(() => {
    return snapPoints.value.map((snapPoint) => {
      if (typeof snapPoint === 'string' && snapPoint.endsWith('%')) {
        return heightPercentToPixels(snapPoint)
      }

      return snapPoint as number
    })
  })

  const minSnapPoint = computed(() => {
    return Math.min(...flattenedSnapPoints.value)
  })

  const maxSnapPoint = computed(() => {
    return Math.max(...flattenedSnapPoints.value)
  })

  // const closestSnapPointIndex = computed(() => {
  //   const closest = sortedSnapPoints.value.reduce((prev, curr) =>
  //     Math.abs(curr - height.value) < Math.abs(prev - height.value) ? curr : prev,
  //   )

  //   return sortedSnapPoints.value.indexOf(closest)
  // })

  return { currentSnapPointIndex, flattenedSnapPoints, minSnapPoint, maxSnapPoint }
}
