import { Box, Button } from "grommet";
import styled from "styled-components";

import { borderSize, colors, transitionDuration } from "../../theme/theme";
import Text from "./Text";

type Props = {
  className?: string;
  isDisabled: boolean;
  isOn: boolean;
  label: string;
  onClick: () => void;
};
const toggleWidth = "36px";
const switchWidth = "18px";

const toggleId = "toggle";

function Toggle({
  className,
  isDisabled,
  isOn,
  label,
  onClick,
}: Props): JSX.Element {
  const align = isOn ? "end" : "start";
  const background = isOn ? "primary" : "gray4";

  return (
    <Button
      a11yTitle={`toggle ${label}`}
      className={className}
      disabled={isDisabled}
      onClick={onClick}
      plain
    >
      <Box
        align="center"
        direction="row"
        style={{ opacity: isDisabled ? 0.4 : 1 }}
      >
        <Box
          align={align}
          background={background}
          height={`calc(${switchWidth} + 2 * ${borderSize.xsmall})`}
          id={toggleId}
          round="xlarge"
          style={{ transition: `background ${transitionDuration}` }}
          width={toggleWidth}
        >
          <Box
            background="gray0"
            height={switchWidth}
            margin={{ horizontal: borderSize.xsmall, top: borderSize.xsmall }}
            round="full"
            width={switchWidth}
          />
        </Box>
        <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
          {label}
        </Text>
      </Box>
    </Button>
  );
}

const StyledToggle = styled(Toggle)`
  &:hover {
    #${toggleId} {
      background: ${(props) =>
        props.isOn ? colors.primaryDark : colors.gray5};
    }
  }

  &:active {
    #${toggleId} {
      background: ${(props) =>
        props.isOn ? colors.primaryDark : colors.gray6};
    }
  }
`;

export default StyledToggle;
