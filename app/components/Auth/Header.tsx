import { Box } from "grommet";
import Link from "next/link";

import { routes } from "../../lib/routes";
import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import { edgeSize } from "../../theme/theme-new";
import Logo from "../shared/icons/Logo";
import Text from "../shared/Text";

type Props = { mode: AuthMode };

export default function Header({ mode }: Props): JSX.Element {
  const message = mode === "signUp" ? copy.signUp : copy.logIn;

  return (
    <Box align="center">
      <Link href={routes.home}>
        <a>
          <Logo width={edgeSize.xxxlarge} />
        </a>
      </Link>
      <Text
        color="textDark"
        margin={{ vertical: "large" }}
        size="medium"
        weight="bold"
      >
        {message}
      </Text>
    </Box>
  );
}
