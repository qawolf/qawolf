import { Box, Button } from "grommet";
import { MouseEvent, useRef } from "react";
import styled from "styled-components";

import { useOnClickOutside } from "../../../../hooks/onClickOutside";
import { copy } from "../../../../theme/copy";
import {
  colors,
  edgeSize,
  transitionDuration,
} from "../../../../theme/theme-new";
import More from "../../../shared-new/icons/More";
import Menu from "../../../shared-new/Menu";
import Option from "../../../shared-new/Select/Option";

type Props = {
  isOpen: boolean;
  onClick: (e: MouseEvent) => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
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
  onDelete,
  onEdit,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  useOnClickOutside({ onClickOutside: onClose, ref });

  return (
    <Box ref={ref} style={{ position: "relative" }}>
      <StyledButton
        a11yTitle={"environment options"}
        className="env-options"
        onClick={onClick}
        plain
      >
        <Box>
          <More size={edgeSize.small} />
        </Box>
      </StyledButton>
      {isOpen && (
        <Menu
          direction="down"
          onClick={onClose}
          right={`-${edgeSize.xxsmall}`}
          top={`calc(${edgeSize.xxxsmall} + ${edgeSize.small})`}
          width={width}
        >
          <Option label={copy.rename} noIcon onClick={onEdit} />
          <Option label={copy.delete} noIcon onClick={onDelete} type="danger" />
        </Menu>
      )}
    </Box>
  );
}
