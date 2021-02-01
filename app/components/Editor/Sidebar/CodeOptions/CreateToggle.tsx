import { Box } from "grommet";
import { FaMagic, FaPause } from "react-icons/fa";

import { edgeSize } from "../../../../theme/theme-new";
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
  if (!isVisible) return null;

  const IconComponent = isCreateOn ? FaMagic : FaPause;

  return (
    <Box
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
    </Box>
  );
}
