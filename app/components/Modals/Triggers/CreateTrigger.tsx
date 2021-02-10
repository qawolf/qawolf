import { Box } from "grommet";
import { useContext, useState } from "react";
import { useCreateTrigger } from "../../../hooks/mutations";

import { Trigger, TriggerFields } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Header from "../../shared-new/Modal/Header";
import Tabs from "../../shared-new/Tabs";
import Tab from "../../shared-new/Tabs/Tab";
import { StateContext } from "../../StateContext";
import ScheduleForm from "./ScheduleForm";

type Props = {
  closeModal: () => void;
  hideBack: boolean;
  onBack: () => void;
  triggers: Trigger[];
};

type Mode = "deployment" | "onDemand" | "schedule";

const options: Mode[] = ["schedule", "deployment", "onDemand"];

export default function CreateTrigger({
  closeModal,
  hideBack,
  onBack,
  triggers,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [createTrigger, { loading }] = useCreateTrigger();

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

  // TODO: create test_trigger records in mutation
  const handleSave = (fields: TriggerFields): void => {
    createTrigger({ variables: { ...fields, team_id: teamId } }).then(onBack);
  };

  return (
    <Box flex={false}>
      <Header closeModal={closeModal} label={copy.createTrigger} />
      <Box margin={{ top: "xxsmall" }}>
        <Tabs type="light">{tabs}</Tabs>
        <Box margin={{ top: "medium" }}>
          {mode === "schedule" && (
            <ScheduleForm
              hideBack={hideBack}
              isLoading={loading}
              onBack={onBack}
              onSave={handleSave}
              triggers={triggers}
            />
          )}
        </Box>
      </Box>
    </Box>
  );
}
