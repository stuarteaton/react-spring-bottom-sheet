import {computed, ref, type Ref} from 'vue';

export function useSnapPoints(snapPoints: Ref<number[]>, height: Ref<number>) {
    const sortedSnapPoints = computed(() => snapPoints.value.slice().sort((a, b) => a - b));

    const currentSnapPoint = ref(0);

    const minSnap = computed(() => sortedSnapPoints.value[0]);
    const maxSnap = computed(() => sortedSnapPoints.value[sortedSnapPoints.value.length - 1]);

    const findClosestSnapPoint = computed(() => {
        const closestBreakpoint = sortedSnapPoints.value.reduce((prev, curr) =>
            Math.abs(curr - height.value) < Math.abs(prev - height.value) ? curr : prev
        );

        return sortedSnapPoints.value.indexOf(closestBreakpoint);
    });

    const snapToPoint = (index: number) => {
        currentSnapPoint.value = index;
    };

    return {
        minSnap,
        maxSnap,
        snapPoints,
        currentSnapPoint,
        findClosestSnapPoint,
        snapToPoint
    };
}
