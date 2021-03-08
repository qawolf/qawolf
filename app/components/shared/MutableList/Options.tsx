import { Box, Button } from "grommet";
import { MouseEvent, useRef } from "react";
import styled from "styled-components";

import { MutableListType } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { colors, edgeSize, transitionDuration } from "../../../theme/theme";
import Drop from "../Drop";
import More from "../icons/More";
import Option from "../Select/Option";

type Props = {
  className?: string;
  isOpen: boolean;
  onClick: (e: MouseEvent) => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  type: MutableListType;
};

export const id = "item-options";
const width = "160px";

function Options({
  className,
  isOpen,
  onClick,
  onClose,
  onDelete,
  onEdit,
  type,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);

  return (
    <Box flex={false} ref={ref}>
      <Button
        a11yTitle={`${type} options`}
        className={className}
        id={id}
        onClick={onClick}
        plain
      >
        <Box>
          <More size={edgeSize.small} />
        </Box>
      </Button>
      {isOpen && (
        <Drop
          align={{ right: "right", top: "bottom" }}
          onClick={onClose}
          onClickOutside={onClose}
          target={ref.current}
          style={{ marginLeft: edgeSize.xxsmall, marginTop: edgeSize.xxxsmall }}
          width={width}
        >
          <Option
            a11yTitle={`rename ${type}`}
            label={copy.rename}
            noIcon
            onClick={onEdit}
          />
          <Option
            a11yTitle={`delete ${type}`}
            label={copy.delete}
            noIcon
            onClick={onDelete}
            type="danger"
          />
        </Drop>
      )}
    </Box>
  );
}

const StyledOptions = styled(Options)`
  svg {
    fill: ${colors.gray6};
    transition: fill ${transitionDuration};
  }

  ${(props) =>
    props.isOpen &&
    `
  opacity: 1 !important;

  svg {
    fill: ${colors.gray9};
  }
`}

  &:hover {
    svg {
      fill: ${colors.gray9};
    }
  }
`;

export default StyledOptions;
