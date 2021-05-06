import { Box } from "grommet";

import RunTests from "./RunTests";

type Props = { testIds: string[] };

export default function Actions({ testIds }: Props): JSX.Element {
  return (
    <Box align="center" direction="row">
      <RunTests testIds={testIds} />
    </Box>
  );
}
