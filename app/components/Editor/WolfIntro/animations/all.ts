import { animatePortal } from "./portal";
import { animateRamp } from "./ramp";
import { animateRampShadow } from "./rampShadow";
import { animateSwirls } from "./swirls";
import { animateWolf } from "./wolf";

export const animateAll = (isBlue: boolean): void => {
  animatePortal();
  animateRamp();
  animateRampShadow();
  animateSwirls();
  animateWolf(isBlue);
};
