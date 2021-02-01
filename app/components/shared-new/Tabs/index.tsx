import { Box } from "grommet";
import { borderSize } from "../../../theme/theme-new";

type Props = { children: JSX.Element[] };

export default function Tabs({ children }: Props): JSX.Element {
  return (
    <Box
      border={{ color: "gray9", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      gap="small"
      pad={{ horizontal: "small" }}
    >
      {children}
    </Box>
  );
}
