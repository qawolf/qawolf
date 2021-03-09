import { Box } from "grommet";

import { Trigger } from "../../../lib/types";
import { borderSize, overflowStyle } from "../../../theme/theme";
import CheckBox from "../../shared/CheckBox";
import EditDeleteButtons, { StyledBox } from "../../shared/EditDeleteButtons";
import Text from "../../shared/Text";
import TriggerIcon from "../../shared/TriggerIcon";
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
  const labelHtml = (
    <Box align="center" direction="row" margin={{ left: "xxsmall" }}>
      <TriggerIcon trigger={trigger} />
      <Text color="gray9" size="component" style={overflowStyle}>
        {trigger.name}
      </Text>
    </Box>
  );

  const triggerHtml = isDisabled ? (
    labelHtml
  ) : (
    <Box align="center" direction="row">
      <Box margin={{ right: "small" }}>
        <CheckBox
          a11yTitle={`assign ${trigger.name}`}
          checked={selectState === "all"}
          indeterminate={selectState === "some"}
          label={labelHtml}
          onChange={onClick}
        />
      </Box>
    </Box>
  );

  return (
    <StyledBox
      a11yTitle={`trigger ${trigger.name}`}
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
      {triggerHtml}
      <EditDeleteButtons
        name={trigger.name}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </StyledBox>
  );
}
