import { Box } from "grommet";
import { EnvironmentVariable } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { overflowStyle } from "../../../theme/theme-new";
import Text from "../../shared-new/Text";
import EditDeleteButtons, {
  StyledBox,
} from "../../shared-new/EditDeleteButtons";

type Props = {
  environmentVariable: EnvironmentVariable;
};

export const nameWidth = "220px";

export default function ListItem({ environmentVariable }: Props): JSX.Element {
  return (
    <StyledBox align="center" direction="row" flex={false}>
      <Box
        flex={false}
        margin={{ right: "xxsmall", vertical: "small" }}
        width={nameWidth}
      >
        <Text color="gray9" size="component" style={overflowStyle}>
          {environmentVariable.name}
        </Text>
      </Box>
      <Box align="center" direction="row" justify="between" width="full">
        <Text color="gray7" size="component">
          {copy.encrypted}
        </Text>
        <EditDeleteButtons onDeleteClick={() => {}} onEditClick={() => {}} />
      </Box>
    </StyledBox>
  );
}
