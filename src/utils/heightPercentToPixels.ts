export function heightPercentToPixels(heightStr: `${number}%`): number {
  const percentage = parseFloat(heightStr)

  return (window.innerHeight * percentage) / 100
}
