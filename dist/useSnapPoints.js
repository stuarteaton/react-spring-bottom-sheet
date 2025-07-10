import { useMemo } from 'react';
export function useSnapPoints(snapPoints, windowHeight) {
    return useMemo(() => {
        return snapPoints.map(point => {
            if (typeof point === 'number') {
                return (windowHeight * point) / 100;
            }
            if (typeof point === 'string' && point.endsWith('%')) {
                return (windowHeight * parseFloat(point) / 100);
            }
            return parseFloat(point);
        });
    }, [snapPoints, windowHeight]);
}
