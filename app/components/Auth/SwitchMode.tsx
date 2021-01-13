import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../lib/routes";
import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import Text from "../shared-new/Text";

type Props = { mode: AuthMode };

export default function SwitchMode({ mode }: Props): JSX.Element {
  const question =
    mode === "signUp" ? copy.accountExists : copy.accountNotExists;
  const message = mode === "signUp" ? copy.logIn : copy.signUp;

  const href = mode === "signUp" ? routes.logIn : routes.signUp;

  return (
    <Box
      align="center"
      direction="row"
      justify="center"
      margin={{ top: "large" }}
    >
      <Text
        color="textDark"
        margin={{ right: "xxxsmall" }}
        size="xsmall"
        weight="normal"
      >
        {question}
      </Text>
      <Link href={href} replace>
        <a>
          <Text color="primaryFill" hover size="xsmall" weight="medium">
            {message}
          </Text>
        </a>
      </Link>
    </Box>
  );
}
