export function heightPercentToPixels(heightStr: string, windowHeight: number): number {
  const percentage = parseFloat(heightStr)

  return (windowHeight * percentage) / 100
}
