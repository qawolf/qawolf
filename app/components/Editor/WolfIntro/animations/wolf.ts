import { isSafari } from "../../../../lib/detection";
import {
  wolfAnimationEasing,
  wolfAnimationOptions,
} from "../../../../theme/theme";

const BASE_HEIGHT = 87;
const IS_SAFARI = isSafari();
const TOP_START = 82;
const WIDTH = "75px";

const EYE_OFFSET = IS_SAFARI
  ? [0, 0.36, 0.36, 0.42, 0.48, 0.54, 1]
  : [0, 0.78, 0.8, 0.82, 0.84, 0.86, 1];
const HEAD_OFFSET = IS_SAFARI ? [0, 0, 0.12, 0.72, 1] : [0, 0.7, 0.74, 0.94, 1];
const TONGUE_OFFSET = IS_SAFARI
  ? [0, 0, 0.3, 0.72, 1]
  : [0, 0.76, 0.8, 0.94, 1];

const HEAD_OPTIONS = {
  ...wolfAnimationOptions,
  duration: wolfAnimationOptions.duration + 2000,
};

const eyeSteps = [
  "scaleY(1)",
  "scaleY(1)",
  "scaleY(0.05)",
  "scaleY(1)",
  "scaleY(0.05)",
  "scaleY(1)",
  "scaleY(1)",
].map((transform, i) => {
  return {
    transform,
    offset: EYE_OFFSET[i],
  };
});

const headSteps = [
  "rotate(0)",
  "rotate(0)",
  "rotate(-8deg)",
  "rotate(-8deg)",
  "rotate(0)",
].map((transform, i) => {
  return {
    transform,
    offset: HEAD_OFFSET[i],
  };
});

const blueTongueSteps = [
  "rotate(0)",
  "rotate(0)",
  "rotate(8deg) translateY(-1px)",
  "rotate(8deg) translateY(-1px)",
  "rotate(0)",
].map((transform, i) => {
  return {
    transform,
    offset: TONGUE_OFFSET[i],
  };
});

const tongueSteps = [
  "rotate(0)",
  "rotate(0)",
  "rotate(8deg)",
  "rotate(8deg)",
  "rotate(0)",
].map((transform, i) => {
  return {
    transform,
    offset: TONGUE_OFFSET[i],
  };
});

export const animateWolf = (isBlue: boolean): void => {
  animateWolfBody();
  animateWolfShadow();
  animateWolfHead();
  animateWolfTongue(isBlue);
  animateWolfEyes();
};

const animateWolfBody = () => {
  const wolfContainer = document.getElementById("wolf-container");
  const wolf = document.getElementById("wolf");

  if (!wolfContainer || !wolf) return;

  const height = wolfContainer.clientHeight;
  const finalTop = 136 + (BASE_HEIGHT - height);
  const finalTranslateY = finalTop - TOP_START;

  wolfContainer.style.left = `calc(50% - ${WIDTH} / 2)`;
  wolfContainer.style.top = `${TOP_START}px`;

  wolfContainer.animate(
    [
      {
        transform: "rotate(0deg) translateY(0)",
        offset: 0,
        easing: "cubic-bezier(0.075, 0.82, 0.165, 1)",
      },
      {
        transform: "rotate(1080deg) translateY(0)",
        offset: 0.4,
        easing: wolfAnimationEasing,
      },
      {
        transform: `rotate(1080deg) translateY(${finalTranslateY}px)`,
        offset: 1,
        easing: wolfAnimationEasing,
      },
    ],
    wolfAnimationOptions
  );

  wolf.style.width = WIDTH;

  wolf.animate(
    [
      {
        transform: "scale(0)",
        offset: 0,
        easing: wolfAnimationEasing,
      },
      {
        transform: "scale(1)",
        offset: 0.6,
        easing: wolfAnimationEasing,
      },
      {
        transform: "scale(1)",
        offset: 1,
        easing: wolfAnimationEasing,
      },
    ],
    wolfAnimationOptions
  );
};

const animateWolfHead = (): void => {
  const wolfHead = document.getElementById("wolf-head");

  wolfHead?.animate(headSteps, HEAD_OPTIONS);
};

const animateWolfTongue = (isBlue?: boolean) => {
  document.querySelectorAll(".wolf-tongue").forEach((tongue) => {
    const steps = isBlue ? blueTongueSteps : tongueSteps;
    tongue.animate(steps, HEAD_OPTIONS);
  });
};

const animateWolfEyes = (): void => {
  document.querySelectorAll(".wolf-eye").forEach((eye) => {
    eye.animate(eyeSteps, HEAD_OPTIONS);
  });
};

const animateWolfShadow = (): void => {
  const shadow = document.getElementById("wolf-shadow");

  shadow?.animate(
    [
      {
        opacity: 0,
        offest: 0,
        easing: wolfAnimationEasing,
      },
      {
        opacity: 0,
        offest: 0.6,
        easing: wolfAnimationEasing,
      },
      {
        opacity: 1,
        offest: 1,
        easing: wolfAnimationEasing,
      },
    ],
    wolfAnimationOptions
  );
};
