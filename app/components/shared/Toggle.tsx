import { Box, Button } from "grommet";

import { borderSize, transitionDuration } from "../../theme/theme";

type Props = {
  a11yTitle: string;
  disabled?: boolean;
  isOn: boolean;
  onClick: () => void;
};

const toggleWidth = "36px";
const switchWidth = "18px";

export default function Toggle({
  a11yTitle,
  disabled,
  isOn,
  onClick,
}: Props): JSX.Element {
  const align = isOn ? "end" : "start";
  const background = isOn ? "primary" : "gray4";

  return (
    <Button a11yTitle={a11yTitle} disabled={disabled} onClick={onClick} plain>
      <Box
        align={align}
        background={background}
        height={`calc(${switchWidth} + 2 * ${borderSize.xsmall})`}
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
    </Button>
  );
}
