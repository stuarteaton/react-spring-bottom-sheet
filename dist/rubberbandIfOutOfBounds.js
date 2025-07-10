function minMax(value, min, max) {
    return Math.max(min, Math.min(value, max));
}
function rubberband2(distance, constant) {
    return Math.pow(distance, constant * 5);
}
function rubberband(distance, dimension, constant) {
    if (dimension === 0 || Math.abs(dimension) === Infinity)
        return rubberband2(distance, constant);
    return (distance * dimension * constant) / (dimension + constant * distance);
}
export function rubberbandIfOutOfBounds(position, min, max, constant = 0.15) {
    if (constant === 0)
        return minMax(position, min, max);
    if (position < min)
        return -rubberband(min - position, max - min, constant) + min;
    if (position > max)
        return +rubberband(position - max, max - min, constant) + max;
    return position;
}
