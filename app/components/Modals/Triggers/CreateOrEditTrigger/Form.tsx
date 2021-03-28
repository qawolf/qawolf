import { Box } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import {
  DeploymentEnvironment,
  DeploymentProvider,
  NetlifyEvent,
  Trigger,
  TriggerFields,
} from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared/AppTextInput";
import Buttons from "../../../shared/Modal/Buttons";
import Text from "../../../shared/Text";
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
import ApiFields from "./ApiFields";
import DeploymentFields from "./DeployFields";
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
  // schedule fields
  const [repeatMinutes, setRepeatMinutes] = useState(
    editTrigger?.repeat_minutes || defaultRepeatMinutes
  );
  // deployment fields
  const [deployBranches, setDeployBranches] = useState<string | null>(
    editTrigger?.deployment_branches || null
  );
  const [deployEnv, setDeployEnv] = useState<DeploymentEnvironment | null>(
    editTrigger?.deployment_environment || "all"
  );
  const [deployIntegrationId, setDeployIntegrationId] = useState<string | null>(
    editTrigger?.deployment_integration_id || null
  );
  const [deployProvider, setDeployProvider] = useState<DeploymentProvider>(
    editTrigger?.deployment_provider || "vercel"
  );
  const [hasDeployError, setHasDeployError] = useState(false);
  const [netlifyEvent, setNetlifyEvent] = useState<NetlifyEvent | null>(
    editTrigger?.netlify_event || "onSuccess"
  );
  // environment
  const [environmentId, setEnvironmentId] = useState<string>(
    editTrigger?.environment_id || stateEnvironmentId || ""
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
    setHasDeployError(false);
    setNameError("");

    if (!deployIntegrationId && deployProvider === "vercel") {
      setHasDeployError(true);
      return;
    }
    if (!name) {
      setNameError(copy.required);
      return;
    }

    onSave(
      buildTriggerFields({
        deployBranches,
        deployEnv,
        deployIntegrationId,
        deployProvider,
        environmentId,
        mode,
        name,
        netlifyEvent,
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
            deployProvider={deployProvider}
            hasDeployError={hasDeployError}
            netlifyEvent={netlifyEvent}
            setDeployBranches={setDeployBranches}
            setDeployEnv={setDeployEnv}
            setDeployIntegrationId={setDeployIntegrationId}
            setDeployProvider={setDeployProvider}
            setNetlifyEvent={setNetlifyEvent}
          />
        )}
        {mode === "api" && <ApiFields editTriggerId={editTrigger?.id} />}
        <Environment
          environmentId={environmentId}
          setEnvironmentId={setEnvironmentId}
        />
        <Buttons
          onPrimaryClick={handleSave}
          onSecondaryClick={onBack}
          primaryIsDisabled={isLoading}
          primaryLabel={editTrigger ? copy.save : copy.createTrigger}
          secondaryLabel={copy.cancel}
          showDivider
        />
      </Box>
    </Box>
  );
}
