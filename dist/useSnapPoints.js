import { useMemo, useState } from 'react';
import { heightPercentToPixels } from './heightPercentToPixels';
export function useSnapPoints(snapPoints, height, windowHeight) {
    const [currentSnapPointIndex, setCurrentSnapPointIndex] = useState(0);
    const flattenedSnapPoints = useMemo(() => {
        return snapPoints.map((snapPoint) => {
            if (typeof snapPoint === 'string') {
                return heightPercentToPixels(snapPoint, windowHeight);
            }
            return snapPoint;
        });
    }, [snapPoints, windowHeight]);
    const minSnapPoint = useMemo(() => Math.min(...flattenedSnapPoints), [flattenedSnapPoints]);
    const maxSnapPoint = useMemo(() => Math.max(...flattenedSnapPoints), [flattenedSnapPoints]);
    const closestSnapPointIndex = useMemo(() => {
        const closest = flattenedSnapPoints.reduce((prev, curr) => Math.abs(curr - height) < Math.abs(prev - height) ? curr : prev);
        return flattenedSnapPoints.indexOf(closest);
    }, [flattenedSnapPoints, height]);
    return {
        currentSnapPointIndex,
        setCurrentSnapPointIndex,
        flattenedSnapPoints,
        minSnapPoint,
        maxSnapPoint,
        closestSnapPointIndex,
    };
}
