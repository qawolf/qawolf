import { Box } from "grommet";
import WolfRight from "./icons/WolfRight";

export default function Wolf(): JSX.Element {
  return (
    <Box background="green" flex={false}>
      <WolfRight />
    </Box>
  );
}
