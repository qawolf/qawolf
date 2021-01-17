import { Box } from "grommet";

import { NavigationOption } from "../../../lib/types";
import { edgeSize } from "../../../theme/theme";
import CodeOptions from "./CodeOptions";
import Option from "./Option";

type Props = {
  selected: NavigationOption;
  setSelected: (selected: NavigationOption) => void;
};

export default function Navigation({
  selected,
  setSelected,
}: Props): JSX.Element {
  const options = (["code", "logs", "helpers"] as NavigationOption[]).map(
    (option) => {
      return (
        <Option
          isSelected={option === selected}
          key={option}
          onClick={() => setSelected(option)}
          option={option}
        />
      );
    }
  );

  const isCodeSelected = selected === "code";

  return (
    <Box
      align="center"
      direction="row"
      flex={false}
      justify="between"
      margin={{
        horizontal: "large",
        vertical: `calc(${edgeSize.large} + ${edgeSize.small} + ${edgeSize.xsmall})`,
      }}
    >
      <Box align="center" direction="row">
        {options}
      </Box>
      {isCodeSelected && <CodeOptions />}
    </Box>
  );
}
