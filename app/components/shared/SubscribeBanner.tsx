import { Box } from "grommet";
import { copy } from "../../theme/copy";
import { border } from "../../theme/theme";

import Button from "./AppButton";

export default function SubscribeBanner(): JSX.Element {
  // TODO: return null if already paid or not near limit

  return (
    <Box
      align="center"
      background="gray2"
      border={{ ...border, side: "bottom" }}
      direction="row"
      flex={false}
      pad="xxsmall"
    >
      <Button label={copy.subscribe} type="primary" />
    </Box>
  );
}
