import * as EmailValidator from "email-validator";
import { Box, Button } from "grommet";
import { Close } from "grommet-icons";

import { hoverTransition } from "../../../theme/theme";
import Text from "../../shared/Text";
import styles from "./TeamSettings.module.css";

type Props = {
  email: string;
  removeEmail: (email: string) => void;
};

const ICON_SIZE = "12px";

export default function Email({ email, removeEmail }: Props): JSX.Element {
  const background = EmailValidator.validate(email) ? "fadedBlue" : "red";
  const handleClick = () => removeEmail(email);

  return (
    <Box
      align="center"
      background={background}
      direction="row"
      margin={{ right: "small", vertical: "xsmall" }}
      pad={{ horizontal: "small", vertical: "xsmall" }}
      round="small"
    >
      <Text color="white" margin={{ right: "small" }} size="small">
        {email}
      </Text>
      <Button
        a11yTitle="remove email"
        className={styles.removeEmail}
        onClick={handleClick}
        plain
        style={{ transition: hoverTransition }}
      >
        <Close color="white" size={ICON_SIZE} />
      </Button>
    </Box>
  );
}
