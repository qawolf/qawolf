import { Box, Button } from "grommet";
import styled from "styled-components";

import { getTriggerIconComponent } from "../../../lib/helpers";
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
import Edit from "../../shared-new/icons/Edit";
import Indeterminate from "../../shared-new/icons/Indeterminate";
import Trash from "../../shared-new/icons/Trash";
import Text from "../../shared-new/Text";
import { SelectState } from "./helpers";

type Props = {
  className?: string;
  isDisabled?: boolean;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  selectState: SelectState;
  trigger: Trigger;
};

function ListItem({
  className,
  onClick,
  onDelete,
  onEdit,
  selectState,
  trigger,
}: Props): JSX.Element {
  const IconComponent = getTriggerIconComponent(trigger);
  const SelectIconComponent = selectState === "all" ? Check : Indeterminate;

  const color = selectState !== "none" ? colors.gray0 : colors.gray9;

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
          {selectState !== "none" && (
            <Box background="primaryDarker" round={borderSize.small}>
              <SelectIconComponent color={color} size={edgeSize.small} />
            </Box>
          )}
        </Box>
      </Button>
      <AppButton
        IconComponent={Edit}
        a11yTitle={`Edit ${trigger.name}`}
        onClick={onEdit}
        margin={{ horizontal: "xxsmall" }}
        type="ghost"
      />
      <AppButton
        IconComponent={Trash}
        a11yTitle={`Delete ${trigger.name}`}
        hoverType="danger"
        onClick={onDelete}
        type="ghost"
      />
    </Box>
  );
}

const StyledListItem = styled(ListItem)`
  background: ${(props) =>
    props.selectState !== "none" ? colors.primary : "transparent"};
  border-radius: ${borderSize.small};
  transition: background ${transitionDuration};

  p {
    transition: color ${transitionDuration};
  }

  svg {
    transition: fill ${transitionDuration};
  }

  ${(props) => props.isDisabled && "cursor: default;"}

  ${(props) =>
    !props.isDisabled &&
    `
  &:hover {
    background: ${
      props.selectState !== "none" ? colors.primaryDark : colors.gray2
    };
  }

  &:active {
    background: ${
      props.selectState !== "none" ? colors.primaryDarker : colors.gray3
    };
  }
  `}
`;

export default StyledListItem;
