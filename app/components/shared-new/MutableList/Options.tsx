import { Box, Button } from "grommet";
import { MouseEvent, useRef } from "react";
import styled from "styled-components";

import { MutableListType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { colors, edgeSize, transitionDuration } from "../../../theme/theme-new";
import Drop from "../Drop";
import More from "../icons/More";
import Option from "../Select/Option";

type Props = {
  isOpen: boolean;
  onClick: (e: MouseEvent) => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  type: MutableListType;
};

export const className = "item-options";

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
  type,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box ref={ref}>
      <StyledButton
        a11yTitle={`${type} options`}
        className={className}
        onClick={onClick}
        plain
      >
        <Box>
          <More size={edgeSize.small} />
        </Box>
      </StyledButton>
      {isOpen && (
        <Drop
          align={{ right: "right", top: "bottom" }}
          onClick={onClose}
          onClickOutside={onClose}
          target={ref.current}
          style={{ marginLeft: edgeSize.xxsmall, marginTop: edgeSize.xxxsmall }}
          width={width}
        >
          <Option label={copy.rename} noIcon onClick={onEdit} />
          <Option label={copy.delete} noIcon onClick={onDelete} type="danger" />
        </Drop>
      )}
    </Box>
  );
}
