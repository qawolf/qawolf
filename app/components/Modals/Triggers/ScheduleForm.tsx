import { RadioButtonGroup } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useOnHotKey } from "../../../hooks/onHotKey";
import { Trigger, TriggerFields } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared-new/AppTextInput";
import ArrowLeft from "../../shared-new/icons/ArrowLeft";
import Buttons from "../../shared-new/Modal/Buttons";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import Environment from "./Environment";
import { getDefaultScheduleName, labelTextProps } from "./helpers";

type Props = {
  isLoading: boolean;
  onBack: () => void;
  onSave: (fields: TriggerFields) => void;
  triggers: Trigger[];
};

const repeatMinutesOptions = [
  { label: copy.frequencyDaily, value: 1440 },
  { label: copy.frequencyHourly, value: 60 },
];

export default function ScheduleForm({
  isLoading,
  onBack,
  onSave,
  triggers,
}: Props): JSX.Element {
  const { environmentId } = useContext(StateContext);

  const [error, setError] = useState("");
  const [hasEditedName, setHasEditedName] = useState(false);
  const [name, setName] = useState("");

  const [repeatMinutes, setRepeatMinutes] = useState(
    repeatMinutesOptions[0].value
  );
  const [selectedEnvironmentId, setSelectedEnvironmentId] = useState<
    string | null
  >(environmentId);

  // try to use a sensible default name
  useEffect(() => {
    if (hasEditedName) return;
    setName(getDefaultScheduleName(repeatMinutes, triggers));
  }, [hasEditedName, repeatMinutes, triggers]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!hasEditedName) setHasEditedName(true);
    setName(e.target.value);
  };

  const handleScheduleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setRepeatMinutes(Number(e.target.value));
  };

  const handleSave = (): void => {
    if (!name) {
      setError(copy.required);
      return;
    }

    onSave({
      environment_id: selectedEnvironmentId,
      name,
      repeat_minutes: repeatMinutes,
    });
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleSave });

  return (
    <>
      <Text {...labelTextProps}>{copy.name}</Text>
      <TextInput
        error={error}
        onChange={handleNameChange}
        placeholder={copy.triggerNamePlaceholder}
        value={name}
      />
      <Text {...labelTextProps} margin={{ bottom: "small", top: "medium" }}>
        {copy.frequency}
      </Text>
      <RadioButtonGroup
        direction="row"
        gap="medium"
        name="schedule"
        onChange={handleScheduleChange}
        options={repeatMinutesOptions}
        value={repeatMinutes}
      />
      <Environment
        selectedEnvironmentId={selectedEnvironmentId}
        setSelectedEnvironmentId={setSelectedEnvironmentId}
      />
      <Buttons
        SecondaryIconComponent={ArrowLeft}
        onPrimaryClick={handleSave}
        onSecondaryClick={onBack}
        primaryIsDisabled={isLoading}
        primaryLabel={copy.createTrigger}
        secondaryLabel={copy.back}
        showDivider
      />
    </>
  );
}
