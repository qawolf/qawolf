import styled from "styled-components";

import { breakpoints } from "../../../../theme/theme-new";
import Star from "./Star";

const sizes = {
  small: "16",
  medium: "24",
  large: "32",
};

const StyledDiv = styled.div`
  display: none;

  @media screen and (min-width: ${breakpoints.medium.value}px) {
    display: block;
  }
`;

// count is clockwise from top right
export default function Stars(): JSX.Element {
  return (
    <StyledDiv>
      <Star right="6%" size={sizes.large} top="12%" />
      <Star animationDelay="-4s" right="10%" size={sizes.small} top="30%" />
      <Star animationDelay="-5s" right="4%" size={sizes.medium} top="36%" />
      <Star animationDelay="-1s" right="16%" size={sizes.small} top="78%" />
      <Star animationDelay="-3s" right="20%" size={sizes.medium} top="84%" />
      <Star left="4%" size={sizes.medium} top="48%" />
      <Star animationDelay="-2s" left="6%" size={sizes.large} top="24%" />
      <Star animationDelay="-1s" left="4%" size={sizes.small} top="12%" />
    </StyledDiv>
  );
}
