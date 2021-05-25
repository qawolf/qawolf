import { Box } from "grommet";
import { useEffect } from "react";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { labelProps } from "./helpers";
import Select from "./Select";

type Props = {
  onSelectOption: (option: string) => void;
  options: string[];
  isDisabled?: boolean;
  value?: string;
};

export default function Selector({
  isDisabled,
  onSelectOption,
  options,
  value,
}: Props): JSX.Element {
  useEffect(() => {
    if (!onSelectOption) return;

    // clear the selector when it is no longer an option
    if (value && !options.includes(value)) {
      onSelectOption(null);
    }
    // choose the first available selector
    // if nothing is selected
    else if (!value && options.length) {
      onSelectOption(options[0]);
    }
  }, [onSelectOption, options, value]);

  return (
    <Box fill="horizontal" margin={{ left: "small" }}>
      <Text {...labelProps}>{copy.selector}</Text>
      <Select
        isDisabled={isDisabled}
        onClick={onSelectOption}
        options={options}
        value={value || (isDisabled ? "" : "...")}
      />
    </Box>
  );
}
