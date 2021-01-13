import { wolfAnimationOptions } from "../../../../theme/theme";

const PORTAL_ROTATE = "rotate(250deg)";

export const animatePortal = (): void => {
  const portal = document.getElementById("portal");
  if (!portal) return;

  portal.animate(
    [
      {
        transform: "rotate(0deg)",
        offset: 0,
        easing: "ease-out",
      },
      { transform: PORTAL_ROTATE, offset: 1 },
      { transform: PORTAL_ROTATE, offset: 1 },
    ],
    wolfAnimationOptions
  );
};
