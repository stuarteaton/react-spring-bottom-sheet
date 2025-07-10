export declare function useSnapPoints(snapPoints: Array<number | `${number}%`>, height: number, windowHeight: number): {
    currentSnapPointIndex: number;
    setCurrentSnapPointIndex: import("react").Dispatch<import("react").SetStateAction<number>>;
    flattenedSnapPoints: number[];
    minSnapPoint: number;
    maxSnapPoint: number;
    closestSnapPointIndex: number;
};
