import { Box } from "grommet";

import Link from "../../components/shared/Link";
import Header from "../../components/shared/playground/Header";
import { routes } from "../../lib/routes";

export default function Playground(): JSX.Element {
  return (
    <Box align="center">
      <Header label="Welcome to the QA Wolf playground!" />
      <Box gap="xxsmall">
        <Link href={`${routes.playground}/log-in`}>Log in form</Link>
        <Link href={`${routes.playground}/editable-list`}>Editable list</Link>
      </Box>
    </Box>
  );
}
