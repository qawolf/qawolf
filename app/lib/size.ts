import { canvasSize } from "../theme/theme";

type Size = {
  height: number;
  width: number;
};

export const getCanvasSize = ({ height, width }: Size): Size => {
  let finalHeight = canvasSize.height;
  let finalWidth = canvasSize.width;
  const aspectRatio = canvasSize.width / canvasSize.height;

  if (height < finalHeight) {
    finalHeight = height;
    finalWidth = aspectRatio * height;
  }
  if (width < finalWidth) {
    finalWidth = width;
    finalHeight = width / aspectRatio;
  }

  return { height: Math.round(finalHeight), width: Math.round(finalWidth) };
};
