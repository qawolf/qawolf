import { Box } from "grommet";
import { useOnHotKey } from "../../../hooks/onHotKey";

import { NavigationOption } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Tabs from "../../shared-new/Tabs";
import Tab from "../../shared-new/Tabs/Tab";
import CodeOptions from "./CodeOptions";

type Props = {
  selected: NavigationOption;
  setSelected: (selected: NavigationOption) => void;
};

const options = ["code", "helpers", "logs"] as NavigationOption[];

export default function Navigation({
  selected,
  setSelected,
}: Props): JSX.Element {
  const handleHotKey = (backwards: boolean = false): void => {
    const optionIndex = options.indexOf(selected);
    if (optionIndex < 0) return;

    const newOptionIndex = backwards
      ? optionIndex - 1 >= 0
        ? optionIndex - 1
        : options.length - 1
      : (optionIndex + 1) % options.length;

    setSelected(options[newOptionIndex]);
  };

  useOnHotKey({ hotKey: "ArrowDown", onHotKey: () => handleHotKey(true) });
  useOnHotKey({ hotKey: "ArrowUp", onHotKey: handleHotKey });

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
    <Box flex={false} style={{ position: "relative" }}>
      <Tabs>{tabs}</Tabs>
      {selected === "code" && <CodeOptions />}
    </Box>
  );
}
