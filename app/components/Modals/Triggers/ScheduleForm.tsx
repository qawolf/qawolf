import { RadioButtonGroup } from "grommet";
import { ChangeEvent, useContext, useState } from "react";

import { copy } from "../../../theme/copy";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import Environment from "./Environment";

const repeatMinutesOptions = [
  { label: copy.frequencyDaily, value: 1440 },
  { label: copy.frequencyHourly, value: 60 },
];

export default function ScheduleForm(): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<
    string | null
  >(environmentId);
  const [name, setname] = useState("");
  const [repeatMinutes, setRepeatMinutes] = useState(
    repeatMinutesOptions[0].value
  );

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRepeatMinutes(Number(e.target.value));
  };

  // TODO: name input
  return (
    <>
      <Text color="gray9" margin={{ bottom: "small" }} size="componentBold">
        {copy.frequency}
      </Text>
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="schedule"
        onChange={handleChange}
        options={repeatMinutesOptions}
        value={repeatMinutes}
      />
      <Environment
        selectedEnvironmentId={selectedEnvironmentId}
        setSelectedEnvironmentId={setSelectedEnvironmentId}
      />
    </>
  );
}
