import { Box } from "grommet";

import { NavigationOption } from "../../../lib/types";
import CodeOptions from "./CodeOptions";
import Tabs from "../../shared-new/Tabs";
import Tab from "../../shared-new/Tabs/Tab";
import { copy } from "../../../theme/copy";

type Props = {
  selected: NavigationOption;
  setSelected: (selected: NavigationOption) => void;
};

const options = ["code", "helpers", "logs"] as NavigationOption[];

export default function Navigation({
  selected,
  setSelected,
}: Props): JSX.Element {
  const tabs = options.map((option) => {
    return (
      <Tab
        isSelected={option === selected}
        key={option}
        label={copy[option]}
        onClick={() => setSelected(option)}
      />
    );
  });

  return (
    <Box
      flex={false}
      margin={{ bottom: "xxsmall" }}
      style={{ position: "relative" }}
    >
      <Tabs>{tabs}</Tabs>
      {selected === "code" && <CodeOptions />}
    </Box>
  );
}
