import { Box, Button } from "grommet";
import styled from "styled-components";

import { Trigger } from "../../../lib/types";
import {
  borderSize,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme-new";
import AppButton from "../../shared-new/AppButton";
import Check from "../../shared-new/icons/Check";
import Trash from "../../shared-new/icons/Trash";
import Text from "../../shared-new/Text";
import { getTriggerIconComponent } from "./helpers";

type Props = {
  className?: string;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
  trigger: Trigger;
};

function ListItem({
  className,
  isSelected,
  onClick,
  onDelete,
  trigger,
}: Props): JSX.Element {
  const IconComponent = getTriggerIconComponent(trigger);
  const color = isSelected ? colors.gray0 : colors.gray9;

  return (
    <Box align="center" direction="row">
      <Button
        a11yTitle={`toggle ${trigger.name}`}
        className={className}
        onClick={onClick}
        plain
        style={{ width: "100%" }}
      >
        <Box align="center" direction="row" justify="between" pad="xxsmall">
          <Box align="center" direction="row">
            <IconComponent color={color} size={edgeSize.small} />
            <Text
              color={color}
              margin={{ left: "xxsmall" }}
              size="component"
              style={overflowStyle}
            >
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
      <AppButton
        IconComponent={Trash}
        hoverType="danger"
        onClick={onDelete}
        margin={{ left: "xxsmall" }}
        type="ghost"
      />
    </Box>
  );
}

const StyledListItem = styled(ListItem)`
  background: ${(props) => (props.isSelected ? colors.primary : "transparent")};
  border-radius: ${borderSize.small};
  transition: background ${transitionDuration};

  p {
    transition: color ${transitionDuration};
  }

  svg {
    transition: fill ${transitionDuration};
  }

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
