import { Box } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { routes } from "../../lib/routes";
import { AuthMode } from "../../lib/types";
import { edgeSize } from "../../theme/theme";
import { UserContext } from "../UserContext";
import Email from "./Email";
import GitHub from "./GitHub";
import Header from "./Header";
import LoginCode from "./LoginCode";
import MailingList from "./MailingList";
import Or from "./Or";
import SwitchMode from "./SwitchMode";

type Props = { mode: AuthMode };

const pad = edgeSize.medium;
const maxWidth = `calc(400px + 2 * ${pad})`; // include padding for mobile

export default function Auth({ mode }: Props): JSX.Element {
  const { replace } = useRouter();

  const { user } = useContext(UserContext);

  // redirect if already logged in
  useEffect(() => {
    if (user) replace(routes.tests);
  }, [replace, user]);

  return (
    <Box
      background="white"
      justify="center"
      overflow={{ vertical: "auto" }}
      style={{ minHeight: "100vh" }}
    >
      <Box align="center" width="full">
        <Box flex={false} pad={pad} style={{ maxWidth }} width="full">
          <Header mode={mode} />
          <GitHub mode={mode} />
          <Or />
          <Email mode={mode} />
          <LoginCode mode={mode} />
          <MailingList mode={mode} />
          <SwitchMode mode={mode} />
        </Box>
      </Box>
    </Box>
  );
}
