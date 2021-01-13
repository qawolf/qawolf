import {
  wolfAnimationEasing,
  wolfAnimationOptions,
} from "../../../../theme/theme";

export const LARGE_SWIRL_SIZE = "184px";
export const MAX_SWIRL_SIZE = "144px";
export const SWIRL_SIZE = "72px";

const MAX_OFFSET = `calc(50% - ${MAX_SWIRL_SIZE} / 2)`;
const LARGE_OFFSET = `calc(50% - ${LARGE_SWIRL_SIZE} / 2)`;
const OFFSET = `calc(50% - ${SWIRL_SIZE} / 2)`;

const SWIRL_EASING = "cubic-bezier(0.165, 0.84, 0.44, 1)";
const SWIRL_ROTATE = "rotate(5000deg)";

export const animateSwirls = (): void => {
  animateSwirl1();
  animateSwirl2();
  animateSwirl3();
};

const animateSwirl1 = (): void => {
  const swirl1Container = document.getElementById("swirl-1-container");
  const swirl1 = document.getElementById("swirl-1");
  if (!swirl1Container || !swirl1) return;

  swirl1Container.style.left = OFFSET;
  swirl1Container.style.top = OFFSET;
  swirl1.style.width = SWIRL_SIZE;

  swirl1.animate(
    [
      {
        transform: "rotate(0deg)",
        offset: 0,
        easing: SWIRL_EASING,
      },
      { transform: SWIRL_ROTATE, offset: 1 },
    ],
    wolfAnimationOptions
  );

  swirl1Container.animate(
    {
      opacity: [1, 0],
      transform: ["scale(1)", "scale(2)"],
      easing: wolfAnimationEasing,
    },
    wolfAnimationOptions
  );
};

const animateSwirl2 = (): void => {
  const swirl2Container = document.getElementById("swirl-2-container");
  const swirl2 = document.getElementById("swirl-2");
  if (!swirl2Container || !swirl2) return;

  swirl2Container.style.left = MAX_OFFSET;
  swirl2Container.style.top = MAX_OFFSET;
  swirl2.style.width = MAX_SWIRL_SIZE;

  swirl2Container.animate(
    {
      opacity: [1, 0],
      transform: ["scale(1)", "scale(0.5)"],
      easing: wolfAnimationEasing,
    },
    wolfAnimationOptions
  );
};

const animateSwirl3 = (): void => {
  const swirl3Container = document.getElementById("swirl-3-container");
  const swirl3 = document.getElementById("swirl-3");
  if (!swirl3Container || !swirl3) return;

  swirl3Container.style.left = LARGE_OFFSET;
  swirl3Container.style.top = LARGE_OFFSET;
  swirl3.style.width = LARGE_SWIRL_SIZE;

  swirl3.animate(
    [
      {
        transform: "rotate(0deg)",
        offset: 0,
        easing: SWIRL_EASING,
      },
      { transform: SWIRL_ROTATE, offset: 1 },
    ],
    wolfAnimationOptions
  );

  swirl3Container.animate(
    {
      opacity: [1, 0],
      transform: ["scale(1)", "scale(0.5)"],
      easing: wolfAnimationEasing,
    },
    wolfAnimationOptions
  );
};
