import { useMemo } from 'react';

export function useSnapPoints(snapPoints: (number | string)[], windowHeight: number) {
  return useMemo(() => {
    return snapPoints.map(point => {
      if (typeof point === 'number') {
        return (windowHeight * point) / 100;
      }
      if (typeof point === 'string' && point.endsWith('%')) {
        return (windowHeight * parseFloat(point) / 100);
      }
      return parseFloat(point as string);
    });
  }, [snapPoints, windowHeight]);
} 