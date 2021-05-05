import { Box } from "grommet";
import { useRouter } from "next/router";

import { routes } from "../../../lib/routes";
import { borderSize } from "../../../theme/theme";
import Header from "./Header";
import Wolf from "./Wolf";

const width = "280px";

export default function Sidebar(): JSX.Element {
  const { asPath } = useRouter();
  const showWolf = !asPath.includes(routes.getStarted);

  return (
    <Box
      border={{ color: "gray3", side: "right", size: borderSize.xsmall }}
      height="full"
      flex={false}
      justify="between"
      pad={{ top: "medium" }}
      width={width}
    >
      <Header />
      {showWolf && <Wolf />}
    </Box>
  );
}
