import { Box } from "grommet";

import { border } from "../../../../theme/theme";
import Action from "./Action";
import Buttons from "./Buttons";
import Selector from "./Selector";

type Props = { isVisible: boolean };

export default function Snippet({ isVisible }: Props): JSX.Element {
  if (!isVisible) return null;

  return (
    <Box
      background="gray9"
      border={{ ...border, color: "gray8", side: "top" }}
      flex={false}
      pad="medium"
    >
      <Box align="center" direction="row" justify="between">
        <Action />
        <Selector />
      </Box>
      <Buttons />
    </Box>
  );
}
