import { Box } from "grommet";

import Welcome from "./Welcome";

const width = "752px";

export default function GetStarted(): JSX.Element {
  return (
    <Box
      align="center"
      background="gray2"
      overflow={{ vertical: "auto" }}
      pad={{ vertical: "xxlarge" }}
      width="full"
    >
      <Box flex={false} width={width}>
        <Welcome wolfColor="white" />
      </Box>
    </Box>
  );
}
