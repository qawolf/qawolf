import { Box, Button } from "grommet";

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
  const innerHtml = (
    <Box align="center" direction="row">
      {!isDisabled && (
        <Box margin={{ right: "small" }}>
          <CheckBox
            checked={selectState === "all"}
            indeterminate={selectState === "some"}
          />
        </Box>
      )}
      <TriggerIcon trigger={trigger} />
      <Text color="gray9" size="component" style={overflowStyle}>
        {trigger.name}
      </Text>
    </Box>
  );

  const triggerHtml = isDisabled ? (
    innerHtml
  ) : (
    <Button a11yTitle={`assign ${trigger.name}`} onClick={onClick} plain>
      {innerHtml}
    </Button>
  );

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
      {triggerHtml}
      <EditDeleteButtons
        name={trigger.name}
        onDelete={onDelete}
        onEdit={onEdit}
      />
    </StyledBox>
  );
}
