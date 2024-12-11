import { computed, type Ref } from 'vue'

export function useSnapPoints(snapPoints: Ref<number[]>, height: Ref<number>) {
  const sortedSnapPoints = computed(() => snapPoints.value.slice().sort((a, b) => a - b))

  const minSnap = computed(() => sortedSnapPoints.value[0])
  const maxSnap = computed(() => sortedSnapPoints.value[sortedSnapPoints.value.length - 1])

  const closestSnapPoint = computed(() => {
    const closestBreakpoint = sortedSnapPoints.value.reduce((prev, curr) =>
      Math.abs(curr - height.value) < Math.abs(prev - height.value) ? curr : prev,
    )

    return sortedSnapPoints.value.indexOf(closestBreakpoint)
  })

  return {
    minSnap,
    maxSnap,
    snapPoints,
    closestSnapPoint,
  }
}
