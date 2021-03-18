import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Button from "../../../shared/AppButton";

type Props = {
  onCancel: () => void;
};

export default function Buttons({ onCancel }: Props): JSX.Element {
  return (
    <Box align="center" direction="row" justify="between">
      <Button onClick={onCancel} label={copy.cancel} type="snippet" />
      <Button label={copy.addSnippet} type="primary" />
    </Box>
  );
}
