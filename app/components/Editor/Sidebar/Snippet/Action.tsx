import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { labelProps, selectWidth } from "./helpers";
import Select from "./Select";

export default function Action(): JSX.Element {
  // TODO
  const options = [
    "Assert text",
    "Click",
    "Fill",
    "Fill email",
    "Hover",
    "Upload file",
  ];

  // TODO
  const handleClick = (option: string): void => {};

  return (
    <Box width={selectWidth}>
      <Text {...labelProps}>{copy.action}</Text>
      <Select
        onClick={handleClick}
        options={options}
        value="Assert text"
      ></Select>
    </Box>
  );
}
