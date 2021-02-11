import { Box } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import { Trigger, TriggerFields } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared-new/AppTextInput";
import ArrowLeft from "../../../shared-new/icons/ArrowLeft";
import Buttons from "../../../shared-new/Modal/Buttons";
import Text from "../../../shared-new/Text";
import { StateContext } from "../../../StateContext";
import Environment from "../Environment";
import {
  defaultRepeatMinutes,
  getDefaultMode,
  getDefaultScheduleName,
  labelTextProps,
  TriggerMode,
} from "../helpers";
import ModeTabs from "./ModeTabs";
import ScheduleFields from "./ScheduleFields";

type Props = {
  editTrigger: Trigger | null;
  isLoading: boolean;
  onBack: () => void;
  onSave: (fields: TriggerFields) => void;
  triggers: Trigger[];
};

export default function Form({
  editTrigger,
  isLoading,
  onBack,
  onSave,
  triggers,
}: Props): JSX.Element {
  const { environmentId: stateEnvironmentId } = useContext(StateContext);

  const [mode, setMode] = useState<TriggerMode>(getDefaultMode(editTrigger));

  const [hasEditedName, setHasEditedName] = useState(false);
  const [name, setName] = useState(editTrigger?.name || "");
  const [nameError, setNameError] = useState("");

  const [repeatMinutes, setRepeatMinutes] = useState(
    editTrigger?.repeat_minutes || defaultRepeatMinutes
  );

  const [environmentId, setEnvironmentId] = useState<string | null>(
    editTrigger?.environment_id || stateEnvironmentId
  );

  // try to use a sensible default name
  useEffect(() => {
    if (editTrigger || hasEditedName) return;

    setName(getDefaultScheduleName(repeatMinutes, triggers));
  }, [editTrigger, hasEditedName, repeatMinutes, triggers]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!hasEditedName) setHasEditedName(true);
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name) {
      setNameError(copy.required);
      return;
    }

    onSave({
      environment_id: environmentId,
      name,
      repeat_minutes: repeatMinutes,
    });
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleSave });

  return (
    <Box margin={{ top: "xxsmall" }}>
      <ModeTabs mode={mode} setMode={setMode} />
      <Box margin={{ top: "medium" }}>
        <Text {...labelTextProps}>{copy.name}</Text>
        <TextInput
          error={nameError}
          onChange={handleNameChange}
          placeholder={copy.triggerNamePlaceholder}
          value={name}
        />
        {mode === "schedule" && (
          <ScheduleFields
            repeatMinutes={repeatMinutes}
            setRepeatMinutes={setRepeatMinutes}
          />
        )}
        <Environment
          environmentId={environmentId}
          setEnvironmentId={setEnvironmentId}
        />
        <Buttons
          SecondaryIconComponent={ArrowLeft}
          onPrimaryClick={handleSave}
          onSecondaryClick={onBack}
          primaryIsDisabled={isLoading}
          primaryLabel={editTrigger ? copy.save : copy.createTrigger}
          secondaryLabel={copy.back}
          showDivider
        />
      </Box>
    </Box>
  );
}
