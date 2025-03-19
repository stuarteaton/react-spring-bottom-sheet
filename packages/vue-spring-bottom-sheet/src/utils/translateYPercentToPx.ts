export function translateYToNumber(value: string, elementHeight: number): number {
  if (value.endsWith('px')) {
    return parseFloat(value.replace('px', ''))
  }

  const percent = parseFloat(value.replace('%', ''))
  const pxValue = (percent / 100) * elementHeight

  return pxValue
}
