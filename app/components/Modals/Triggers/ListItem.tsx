import { Box, Button } from "grommet";
import styled from "styled-components";
import { Trigger } from "../../../lib/types";
import {
  borderSize,
  colors,
  edgeSize,
  transitionDuration,
} from "../../../theme/theme-new";
import Check from "../../shared-new/icons/Check";
import Text from "../../shared-new/Text";
import { getTriggerIconComponent } from "./helpers";

type Props = {
  className?: string;
  isSelected: boolean;
  onClick: () => void;
  trigger: Trigger;
};

function ListItem({
  className,
  isSelected,
  onClick,
  trigger,
}: Props): JSX.Element {
  const IconComponent = getTriggerIconComponent(trigger);
  const color = isSelected ? colors.gray0 : colors.gray9;

  return (
    <Button
      a11yTitle={`toggle ${trigger.name}`}
      className={className}
      onClick={onClick}
      plain
    >
      <Box align="center" direction="row" justify="between" pad="xxsmall">
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

const StyledListItem = styled(ListItem)`
  background: ${(props) => (props.isSelected ? colors.primary : "transparent")};
  border-radius: ${borderSize.small};
  transition: background ${transitionDuration};

  &:hover {
    background: ${(props) =>
      props.isSelected ? colors.primaryDark : colors.gray2};
  }

  &:active {
    background: ${(props) =>
      props.isSelected ? colors.primaryDarker : colors.gray3};
  }
`;

export default StyledListItem;
