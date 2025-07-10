export function heightPercentToPixels(heightStr, windowHeight) {
    const percentage = parseFloat(heightStr);
    return (windowHeight * percentage) / 100;
}
