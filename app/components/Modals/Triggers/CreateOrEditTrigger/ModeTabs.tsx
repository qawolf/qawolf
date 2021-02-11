import { copy } from "../../../../theme/copy";
import Tabs from "../../../shared-new/Tabs";
import Tab from "../../../shared-new/Tabs/Tab";
import { TriggerMode } from "../helpers";

const options: TriggerMode[] = ["schedule", "deployment", "onDemand"];

type Props = {
  mode: TriggerMode;
  setMode: (mode: TriggerMode) => void;
};

export default function ModeTabs({ mode, setMode }: Props): JSX.Element {
  const tabs = options.map((option) => {
    return (
      <Tab
        isSelected={option === mode}
        key={option}
        label={copy[option]}
        onClick={() => setMode(option)}
        style={{ width: "33.3333%" }}
        type="light"
      />
    );
  });

  return <Tabs type="light">{tabs}</Tabs>;
}
