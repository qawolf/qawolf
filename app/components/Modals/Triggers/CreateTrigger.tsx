import { Box } from "grommet";
import { useState } from "react";

import { copy } from "../../../theme/copy";
import Header from "../../shared-new/Modal/Header";
import Tabs from "../../shared-new/Tabs";
import Tab from "../../shared-new/Tabs/Tab";
import ScheduleForm from "./ScheduleForm";

type Props = { closeModal: () => void };

type Mode = "deployment" | "onDemand" | "schedule";

const options: Mode[] = ["schedule", "deployment", "onDemand"];

export default function CreateTrigger({ closeModal }: Props): JSX.Element {
  const [mode, setMode] = useState<Mode>("schedule");

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

  return (
    <>
      <Header closeModal={closeModal} label={copy.createTrigger} />
      <Box margin={{ top: "xxsmall" }}>
        <Tabs type="light">{tabs}</Tabs>
        <Box margin={{ top: "medium" }}>
          {mode === "schedule" && <ScheduleForm />}
        </Box>
      </Box>
    </>
  );
}
