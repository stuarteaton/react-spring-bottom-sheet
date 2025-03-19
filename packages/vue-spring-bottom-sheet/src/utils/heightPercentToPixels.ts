export function heightPercentToPixels(heightStr: string): number {
  const percentage = parseFloat(heightStr)

  return (window.innerHeight * percentage) / 100
}
