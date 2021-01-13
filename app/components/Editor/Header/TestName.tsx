import { Box } from "grommet";

import { Test } from "../../../lib/types";
import { overflowStyle } from "../../../theme/theme";
import Text from "../../shared/Text";
import EditTestName from "./EditTestName";

type Props = {
  isMobile?: boolean;
  test: Test;
};

export default function TestName({ isMobile, test }: Props): JSX.Element {
  const innerHtml = isMobile ? (
    <Text color="black" size="large" style={overflowStyle}>
      {test.name}
    </Text>
  ) : (
    <EditTestName test={test} />
  );

  return (
    <Box align="center" direction="row" fill="horizontal" justify="center">
      {innerHtml}
    </Box>
  );
}
