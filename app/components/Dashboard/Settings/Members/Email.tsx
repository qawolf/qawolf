import { Box, Button } from "grommet";

import { border, colors, edgeSize } from "../../../../theme/theme-new";
import Close from "../../../shared-new/icons/Close";
import Text from "../../../shared-new/Text";

type Props = {
  email: string;
  removeEmail: (email: string) => void;
};

export default function Email({ email, removeEmail }: Props): JSX.Element {
  return (
    <Box
      align="center"
      border={border}
      direction="row"
      margin={{ right: "xxsmall" }}
      pad={{ horizontal: "xxsmall", vertical: "xxxsmall" }}
      round="xlarge"
    >
      <Text color="gray9" margin={{ right: "xxxsmall" }} size="component">
        {email}
      </Text>
      <Button a11yTitle={`remove ${email}`} plain>
        <Box>
          <Close color={colors.gray5} size={edgeSize.xsmall} />
        </Box>
      </Button>
    </Box>
  );
}
