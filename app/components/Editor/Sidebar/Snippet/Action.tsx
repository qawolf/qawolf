import { Box } from "grommet";

import { copy } from "../../../../theme/copy";
import Text from "../../../shared/Text";
import { ActionType, buildActionOptions, labelProps } from "./helpers";
import Select from "./Select";

type Props = {
  hasText: boolean;
  isFillable?: boolean;
  onSelectAction: (option: ActionType) => void;
  value: ActionType | null;
};

const width = "156px";

export default function Action({
  hasText,
  isFillable,
  onSelectAction,
  value,
}: Props): JSX.Element {
  const options = buildActionOptions(hasText, isFillable);

  if (!value || !options.includes(value)) {
    const defaultAction = options.includes("Fill") ? "Fill" : "Click";
    onSelectAction(defaultAction);
  }

  return (
    <Box flex={false} width={width}>
      <Text {...labelProps}>{copy.action}</Text>
      <Select onClick={onSelectAction} options={options} value={value} />
    </Box>
  );
}
