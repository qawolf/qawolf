import { keyframes } from "styled-components";

export const duration = "20s ease-in-out infinite";

export const bluePlanet = keyframes`
0%,
100% {
  transform: rotate(0) translate3d(0, 0, 0);
}
50% {
  transform: rotate(-16deg) translate3d(16px, 16px, 0);
}
`;

export const purplePlanet = keyframes`
0%,
100% {
  transform: rotate(0) translate3d(0, 0, 0);
}
50% {
  transform: rotate(8deg) translate3d(32px, 32px, 0);
}
`;

export const tealPlanet = keyframes`
0%,
100% {
  transform: rotate(0) translate3d(0, 0, 0);
}

50% {
  transform: rotate(-4deg) translate3d(32px, -16px, 0);
}
`;
