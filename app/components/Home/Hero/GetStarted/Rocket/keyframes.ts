import { keyframes } from "styled-components";

export const flame = keyframes`
0%,
100% {
transform: translate(0px, 0px);
}
25% {
transform: translate(-5px, 5px);
}
50% {
transform: translate(2px, -2px);
}
75% {
transform: translate(-1px, 2px);
}
`;

export const rocket = keyframes`
0%,
100% {
  transform: translate(0px, 0px);
}
33% {
  transform: translate(1px, -1px);
}
67% {
  transform: translate(-1px, 1px);
}
`;
