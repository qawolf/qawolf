import { Box, Drop } from "grommet";
import { useRef, useState } from "react";
import { FaMagic, FaPause } from "react-icons/fa";

import { copy } from "../../../../theme/copy";
import { edgeSize, hoverTransition } from "../../../../theme/theme";
import Text from "../../../shared/Text";
import Toggle, { TOGGLE_SIZE } from "../../../shared/Toggle";

type Props = {
  isCreateOn: boolean;
  isEnabled: boolean;
  isVisible: boolean;
  onClick: () => void;
};

export default function CreateToggle({
  isCreateOn,
  isEnabled,
  isVisible,
  onClick,
}: Props): JSX.Element {
  const [showTooltip, setShowTooltip] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  if (!isVisible) return null;

  const IconComponent = isCreateOn ? FaMagic : FaPause;
  const message = isCreateOn ? copy.createStop : copy.createStart;

  return (
    <Box
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      ref={ref}
      style={{
        right: edgeSize.large,
        position: "absolute",
        top: `calc(-${TOGGLE_SIZE} / 2)`,
      }}
    >
      <Toggle
        IconComponent={IconComponent}
        disabled={!isEnabled}
        isOn={isCreateOn}
        onClick={onClick}
      />
      {!!ref.current && (
        <Drop align={{ bottom: "top" }} plain target={ref.current}>
          <Text
            color="white"
            margin={{ bottom: "small" }}
            size="small"
            style={{
              opacity: showTooltip ? 1 : 0,
              transition: hoverTransition,
            }}
          >
            {isEnabled ? message : copy.createDisabled}
          </Text>
        </Drop>
      )}
    </Box>
  );
}
