import {
  wolfAnimationEasing,
  wolfAnimationOptions,
} from "../../../../theme/theme";

type AnimateRampHelper = {
  id: string;
  left: string;
  top: string;
  width: string;
};

type GrowHelper = {
  id: string;
  width: string;
};

const WIDTH = "136px";
const LEFT = `calc(50% - ${WIDTH} / 2)`;
const TOP = "96px";

export const startScalePosition = {
  transform: "scale(0)",
  easing: wolfAnimationEasing,
};

export const endScalePosition = {
  transform: "scale(1)",
  easing: wolfAnimationEasing,
};

export const startTranslatePosition = {
  transform: "translateY(0)",
  easing: wolfAnimationEasing,
};

export const endTranslatePosition = {
  transform: "translateY(8px)",
  easing: wolfAnimationEasing,
};

export const animateRampHelper = ({
  id,
  left,
  top,
  width,
}: AnimateRampHelper): void => {
  const element = document.getElementById(`${id}-container`);
  if (!element) return;

  element.style.left = left;
  element.style.top = top;

  element.animate(
    [
      {
        ...startTranslatePosition,
        offset: 0,
      },
      {
        ...startTranslatePosition,
        offset: 0.4,
      },
      {
        ...startTranslatePosition,
        offset: 0.6,
      },
      {
        ...endTranslatePosition,
        offset: 1,
      },
    ],
    wolfAnimationOptions
  );

  growElement({ id, width });
};

const growElement = ({ id, width }: GrowHelper): void => {
  const element = document.getElementById(id);
  if (!element) return;

  element.style.width = width;

  element.animate(
    [
      {
        ...startScalePosition,
        offset: 0,
      },
      {
        ...startScalePosition,
        offset: 0.4,
      },
      {
        ...endScalePosition,
        offset: 0.6,
      },
      {
        ...endScalePosition,
        offset: 1,
      },
    ],
    wolfAnimationOptions
  );
};

export const animateRamp = (): void => {
  animateRampHelper({ id: "ramp", left: LEFT, top: TOP, width: WIDTH });
};
