import { Box } from "grommet";
import { useRef, useState } from "react";
import styled from "styled-components";

import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";
import Button from "../../shared/AppButton";
import Select from "../../shared/icons/Select";
import Tooltip from "../../shared/Tooltip";

type Props = {
  className?: string;
  isActive: boolean;
  isDisabled: boolean;
  onClick?: () => void;
};

function SelectButton({
  className,
  isActive,
  isDisabled,
  onClick,
}: Props): JSX.Element {
  const ref = useRef<HTMLDivElement>(null);
  const [isHover, setIsHover] = useState(false);

  return (
    <>
      <Box
        onMouseEnter={() => setIsHover(true)}
        onMouseLeave={() => setIsHover(false)}
        ref={ref}
      >
        <Button
          IconComponent={Select}
          a11yTitle="choose element"
          className={className}
          isDisabled={isDisabled}
          onClick={onClick}
          type="ghost"
        />
      </Box>
      <Tooltip
        align={{ right: "right", top: "bottom" }}
        isVisible={isHover}
        label={isActive ? copy.cancel : copy.chooseElement}
        style={{ marginTop: edgeSize.xxxsmall }}
        target={ref.current}
      />
    </>
  );
}

const StyledSelectButton = styled(SelectButton)`
  ${(props) =>
    props.isActive &&
    `
    background: ${colors.primaryLight};
    border: 1px solid ${colors.primary};

    svg {
        fill: ${colors.primary};
    }

    &:hover {
        border-color: ${colors.primaryDark};

        svg {
            fill: ${colors.primaryDark};
        }
    }

    &:active {
        border-color: ${colors.primaryDarker};

        svg {
            fill: ${colors.primaryDarker};
        }
    }
    `}
`;

export default StyledSelectButton;
