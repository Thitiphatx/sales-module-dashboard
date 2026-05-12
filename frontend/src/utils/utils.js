export const getChartColor = (index) => {
    // Random the color by index
    const hue = (13.43 + (index * 137.5)) % 360;
    return `oklch(0.8 0.16 ${hue})`;
};