import { Box } from "grommet";

import {
  colors,
  edgeSize,
  overflowStyle,
} from "../../../../../theme/theme-new";
import Folder from "../../../../shared/icons/Folder";
import Text from "../../../../shared/Text";

type Props = {
  groupName: string | null;
  testName: string;
};

export default function TestName({ groupName, testName }: Props): JSX.Element {
  return (
    <Box margin={{ left: "small" }}>
      <Text color="gray9" size="componentMedium" style={overflowStyle}>
        {testName}
      </Text>
      {!!groupName && (
        <Box align="center" direction="row" margin={{ top: "xxsmall" }}>
          <Folder color={colors.gray7} size={edgeSize.small} />
          <Text
            color="gray7"
            margin={{ left: "xxsmall" }}
            size="componentSmall"
            style={overflowStyle}
          >
            {groupName}
          </Text>
        </Box>
      )}
    </Box>
  );
}
