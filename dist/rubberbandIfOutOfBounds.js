export function rubberbandIfOutOfBounds(val, min, max, constant = 0.15) {
    if (val < min) {
        return min - (min - val) * constant;
    }
    if (val > max) {
        return max + (val - max) * constant;
    }
    return val;
}
