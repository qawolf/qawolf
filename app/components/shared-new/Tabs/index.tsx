import { Box } from "grommet";
import Tab from "./Tab";

type Props = { children: Array<typeof Tab> };

export default function Tabs({ children }: Props): JSX.Element {
  return (
    <Box direction="row" gap="medium">
      {children}
    </Box>
  );
}
