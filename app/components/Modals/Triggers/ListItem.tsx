import { Box } from "grommet";

import { Trigger } from "../../../lib/types";
import { borderSize, overflowStyle } from "../../../theme/theme-new";
import CheckBox from "../../shared-new/CheckBox";
import EditDeleteButtons, {
  StyledBox,
} from "../../shared-new/EditDeleteButtons";
import Text from "../../shared-new/Text";
import TriggerIcon from "../../shared-new/TriggerIcon";
import { SelectState } from "./helpers";

type Props = {
  isDisabled?: boolean;
  noBorder: boolean;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  selectState: SelectState;
  trigger: Trigger;
};

export default function ListItem({
  isDisabled,
  noBorder,
  onClick,
  onDelete,
  onEdit,
  selectState,
  trigger,
}: Props): JSX.Element {
  return (
    <StyledBox
      align="center"
      border={
        noBorder
          ? undefined
          : { color: "gray3", side: "bottom", size: borderSize.xsmall }
      }
      direction="row"
      flex={false}
      justify="between"
    >
      <Box align="center" direction="row">
        {!isDisabled && (
          <Box margin={{ right: "small" }}>
            <CheckBox
              a11yTitle={`assign ${trigger.name}`}
              checked={selectState === "all"}
              indeterminate={selectState === "some"}
              onChange={onClick}
            />
          </Box>
        )}
        <TriggerIcon trigger={trigger} />
        <Text color="gray9" size="component" style={overflowStyle}>
          {trigger.name}
        </Text>
      </Box>
      <EditDeleteButtons
        name={trigger.name}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </StyledBox>
  );
}
