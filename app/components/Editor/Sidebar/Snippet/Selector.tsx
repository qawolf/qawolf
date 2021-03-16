import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { labelProps, selectWidth } from "./helpers";
import Select from "./Select";

export default function Selector(): JSX.Element {
  // TODO
  const options = ["..."];

  // TODO
  const handleClick = (option: string): void => {};

  return (
    <Box width={selectWidth}>
      <Text {...labelProps}>{copy.selector}</Text>
      <Select onClick={handleClick} options={options} value="..."></Select>
    </Box>
  );
}
