import { Squash as HamburgerIcon } from "hamburger-react";
import styled from "styled-components";

import { breakpoints, colors } from "../../theme/theme";

type Props = {
  breakpoint?: string;
  className?: string;
  color?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const size = 20;

function Hamburger({
  className,
  color,
  isOpen,
  setIsOpen,
}: Props): JSX.Element {
  return (
    <div className={className}>
      <HamburgerIcon
        color={color || colors.white}
        label="toggle navigation"
        toggle={setIsOpen}
        toggled={isOpen}
        size={size}
      />
    </div>
  );
}

const StyledHamburger = styled(Hamburger)`
  // icon container is 48px wide, icon is 20px wide, want 24px margin left of icon
  // 48 - 20 = 28 / 2 = 14px margin, need 10px to equal 24px margin
  margin-left: 10px;

  @media screen and (min-width: ${(props) =>
      props.breakpoint || `${breakpoints.small.value}px`}) {
    display: none;
  }
`;

export default StyledHamburger;
