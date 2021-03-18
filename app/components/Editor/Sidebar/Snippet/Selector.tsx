import { Box } from "grommet";
import { useEffect } from "react";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { labelProps, selectWidth } from "./helpers";
import Select from "./Select";

type Props = {
  onSelectOption: (option: string) => void;
  options: string[];
  value?: string;
};

export default function Selector({
  onSelectOption,
  options,
  value,
}: Props): JSX.Element {
  // choose the first available selector
  // if nothing is selected
  useEffect(() => {
    if (!value && options.length) {
      onSelectOption(options[0]);
    }
  }, [onSelectOption, options, value]);

  // clear the selector when it is no longer an option
  if (value && !options.includes(value)) {
    onSelectOption(null);
  }

  return (
    <Box width={selectWidth}>
      <Text {...labelProps}>{copy.selector}</Text>
      <Select
        onClick={onSelectOption}
        options={options}
        value={value || "..."}
      ></Select>
    </Box>
  );
}
