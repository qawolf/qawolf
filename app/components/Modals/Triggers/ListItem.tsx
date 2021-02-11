import { Box, Button } from "grommet";
import { Trigger } from "../../../lib/types";
import { borderSize, colors, edgeSize } from "../../../theme/theme-new";
import Check from "../../shared-new/icons/Check";
import Text from "../../shared-new/Text";
import { getTriggerIconComponent } from "./helpers";

type Props = {
  isSelected: boolean;
  onClick: () => void;
  trigger: Trigger;
};

export default function ListItem({
  isSelected,
  onClick,
  trigger,
}: Props): JSX.Element {
  const IconComponent = getTriggerIconComponent(trigger);
  const color = isSelected ? colors.gray0 : colors.gray9;

  return (
    <Button a11yTitle={`toggle ${trigger.name}`} onClick={onClick} plain>
      <Box
        align="center"
        background={isSelected ? colors.primary : "transparent"}
        direction="row"
        justify="between"
        pad="xxsmall"
        round={borderSize.small}
      >
        <Box align="center" direction="row">
          <IconComponent color={color} size={edgeSize.small} />
          <Text color={color} margin={{ left: "xxsmall" }} size="component">
            {trigger.name}
          </Text>
        </Box>
        {isSelected && (
          <Box background="primaryDarker" round={borderSize.small}>
            <Check color={color} size={edgeSize.small} />
          </Box>
        )}
      </Box>
    </Button>
  );
}
