import { Box } from "grommet";

import { Trigger } from "../../../lib/types";
import { borderSize, overflowStyle } from "../../../theme/theme";
import EditDeleteButtons, { StyledBox } from "../../shared/EditDeleteButtons";
import Text from "../../shared/Text";
import TriggerIcon from "../../shared/TriggerIcon";

type Props = {
  noBorder: boolean;
  onDelete: () => void;
  onEdit: () => void;
  trigger: Trigger;
};

export default function ListItem({
  noBorder,
  onDelete,
  onEdit,
  trigger,
}: Props): JSX.Element {
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
      <Box align="center" direction="row">
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
