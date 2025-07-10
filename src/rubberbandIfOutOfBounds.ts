export function rubberbandIfOutOfBounds(val: number, min: number, max: number, constant = 0.15) {
  if (val < min) {
    return min - (min - val) * constant;
  }
  if (val > max) {
    return max + (val - max) * constant;
  }
  return val;
} 