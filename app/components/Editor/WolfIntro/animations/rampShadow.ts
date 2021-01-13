import { animateRampHelper } from "./ramp";

const WIDTH = "128px";
const TOP = "240px";
const LEFT = `calc(50% - ${WIDTH} / 2)`;

export const animateRampShadow = (): void => {
  animateRampHelper({ id: "ramp-shadow", left: LEFT, top: TOP, width: WIDTH });
};
