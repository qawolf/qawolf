import { Box } from "grommet";
import { useEffect } from "react";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { labelProps, selectWidth } from "./helpers";
import Select from "./Select";

type Props = {
  hasText: boolean;
  isFillable?: boolean;
  onSelectAction: (option: string) => void;
  value: string;
};

export default function Action({
  hasText,
  isFillable,
  onSelectAction,
  value,
}: Props): JSX.Element {
  const options = isFillable
    ? ["Fill", "Fill email", "Hover"]
    : ["Click", "Hover", "Upload file"];

  if (hasText) options.unshift("Assert text");

  useEffect(() => {
    const defaultAction = options.includes("Fill") ? "Fill" : "Click";
    onSelectAction(defaultAction);
  }, [onSelectAction, isFillable]);

  return (
    <Box width={selectWidth}>
      <Text {...labelProps}>{copy.action}</Text>
      <Select onClick={onSelectAction} options={options} value={value}></Select>
    </Box>
  );
}
