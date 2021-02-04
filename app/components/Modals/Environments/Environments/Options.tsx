import { Box, Button } from "grommet";
import { useRef } from "react";
import styled from "styled-components";
import { useOnClickOutside } from "../../../../hooks/onClickOutside";
import {
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme-new";
import More from "../../../shared-new/icons/More";
import Menu from "../../../shared-new/Menu";

type Props = {
  isOpen: boolean;
  onClick: () => void;
  onClose: () => void;
};

const StyledButton = styled(Button)`
  svg {
    fill: ${colors.gray6};
    transition: fill ${transitionDuration};
  }

  &:hover {
    svg {
      fill: ${colors.gray9};
    }
  }
`;

const width = "160px";

export default function Options({
  isOpen,
  onClick,
  onClose,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside({ onClickOutside: onClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <StyledButton onClick={onClick} plain>
        <Box>
          <More size={edgeSize.small} />
        </Box>
      </StyledButton>
      {isOpen && (
        <Menu
          direction="down"
          onClick={onClose}
          top={`calc(${edgeSize.xxxsmall} + ${edgeSize.small})`}
          width={width}
        >
          <h1>menu</h1>
        </Menu>
      )}
    </Box>
  );
}
