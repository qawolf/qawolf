import { Box } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import {
  DeploymentEnvironment,
  Trigger,
  TriggerFields,
} from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared-new/AppTextInput";
import ArrowLeft from "../../../shared-new/icons/ArrowLeft";
import Buttons from "../../../shared-new/Modal/Buttons";
import Text from "../../../shared-new/Text";
import { StateContext } from "../../../StateContext";
import Environment from "../Environment";
import {
  buildTriggerFields,
  defaultRepeatMinutes,
  getDefaultMode,
  getDefaultName,
  labelTextProps,
  TriggerMode,
} from "../helpers";
import DeploymentFields from "./DeploymentFields";
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

  const [deployBranches, setDeployBranches] = useState<string | null>(null);
  const [deployEnv, setDeployEnv] = useState<DeploymentEnvironment | null>(
    null
  );
  const [deployIntegrationId, setDeployIntegrationId] = useState<string | null>(
    null
  );

  const [environmentId, setEnvironmentId] = useState<string | null>(
    editTrigger?.environment_id || stateEnvironmentId
  );

  // try to use a sensible default name
  useEffect(() => {
    if (editTrigger || hasEditedName) return;

    setName(getDefaultName({ deployEnv, mode, repeatMinutes, triggers }));
  }, [deployEnv, editTrigger, hasEditedName, mode, repeatMinutes, triggers]);

  const handleNameChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (!hasEditedName) setHasEditedName(true);
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (!name) {
      setNameError(copy.required);
      return;
    }

    onSave(
      buildTriggerFields({
        deployBranches,
        deployEnv,
        deployIntegrationId,
        environmentId,
        mode,
        name,
        repeatMinutes,
      })
    );
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleSave });

  return (
    <Box margin={{ top: "xxsmall" }}>
      <ModeTabs mode={mode} setMode={setMode} />
      <Box margin={{ top: "medium" }}>
        <Text {...labelTextProps} margin={{ bottom: "small" }}>
          {copy.name}
        </Text>
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
        {mode === "deployment" && (
          <DeploymentFields
            deployBranches={deployBranches}
            deployEnv={deployEnv}
            deployIntegrationId={deployIntegrationId}
            setDeployBranches={setDeployBranches}
            setDeployEnv={setDeployEnv}
            setDeployIntegrationId={setDeployIntegrationId}
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
