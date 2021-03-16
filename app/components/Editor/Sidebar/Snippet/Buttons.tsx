import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";

export default function Buttons(): JSX.Element {
  return (
    <Box align="center" direction="row" justify="between">
      <Button label={copy.cancel} type="snippet" />
      <Button label={copy.addSnippet} type="primary" />
    </Box>
  );
}
