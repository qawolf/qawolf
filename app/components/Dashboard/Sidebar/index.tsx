import { Box } from "grommet";

import { Group } from "../../../lib/types";
import { borderSize } from "../../../theme/theme";
import Header from "./Header";
import Wolf from "./Wolf";

const width = "280px";

type Props = { groups: Group[] | null };

export default function Sidebar({ groups }: Props): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "right", size: borderSize.xsmall }}
      height="full"
      flex={false}
      justify="between"
      pad={{ top: "medium" }}
      width={width}
    >
      <Header groups={groups} />
      <Wolf />
    </Box>
  );
}
