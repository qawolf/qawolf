import { Box, Button, Drop, DropProps } from "grommet";
import { Configure } from "grommet-icons";
import { useRef, useState } from "react";

import { state } from "../../lib/state";
import { Group } from "../../lib/types";
import { copy } from "../../theme/copy";
import { lineHeight } from "../../theme/theme";
import ConfigureFill from "./icons/ConfigureFill";
import Text from "./Text";

type Props = {
  color?: string;
  dropAlign?: DropProps["align"];
  group: Group;
};

export default function EnvVariableSettings({
  color,
  dropAlign,
  group,
}: Props): JSX.Element {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const handleClick = () => {
    state.setModal({
      group: { id: group.id, name: group.name },
      name: "envVariables",
    });
  };

  const IconComponent = showTooltip ? ConfigureFill : Configure;

  return (
    <Button
      a11yTitle={copy.setEnvVariables}
      margin={{ left: "small" }}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <Box ref={ref}>
        <IconComponent
          color={color || "black"}
          size={lineHeight.medium}
          style={{ fillRule: "nonzero" }}
        />
      </Box>
      {showTooltip && (
        <Drop align={dropAlign || { bottom: "top" }} plain target={ref.current}>
          <Box background="black" pad={{ horizontal: "small" }} round="xsmall">
            <Text color="white" size="small">
              {copy.setEnvVariables}
            </Text>
          </Box>
        </Drop>
      )}
    </Button>
  );
}
