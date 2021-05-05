export const COLORS = [
  "#4545E5",
  "#C54BDE",
  "#56BBD6",
  "#8BC22D",
  "#E59C59",
  "#DA4E94",
  "#ABB3C2",
  "#667080",
];

export const buildColor = (
  teamColors: string[],
  colors: string[] = COLORS
): string => {
  const availableColor = colors.find((color) => !teamColors.includes(color));

  if (availableColor) return availableColor;

  return colors[teamColors.length % colors.length];
};
