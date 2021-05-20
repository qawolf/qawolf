import { Box } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import { useOnHotKey } from "../../../../hooks/onHotKey";
import {
  DeploymentProvider,
  Tag,
  Trigger,
  TriggerFields,
} from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared/AppTextInput";
import Buttons from "../../../shared/Modal/Buttons";
import Text from "../../../shared/Text";
import { StateContext } from "../../../StateContext";
import {
  buildTriggerFields,
  defaultRepeatMinutes,
  getDefaultMode,
  getDefaultName,
  labelTextProps,
  TriggerMode,
} from "../helpers";
import DeployFields from "./DeployFields";
import Environment from "./Environment";
import ModeTabs from "./ModeTabs";
import ScheduleFields from "./ScheduleFields";
import Tags from "./Tags";

type Props = {
  editTrigger: Trigger | null;
  isLoading: boolean;
  onBack: () => void;
  onSave: (fields: TriggerFields) => void;
  tags: Tag[];
  triggers: Trigger[];
};

export default function Form({
  editTrigger,
  isLoading,
  onBack,
  onSave,
  tags,
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
  const [deployEnv, setDeployEnv] = useState(
    editTrigger?.deployment_environment || "all"
  );
  const [deployIntegrationId, setDeployIntegrationId] = useState<string | null>(
    editTrigger?.deployment_integration_id || null
  );
  const [deployPreviewUrl, setDeployPreviewUrl] = useState<string | null>(
    editTrigger?.deployment_preview_url || null
  );
  const [deployProvider, setDeployProvider] = useState<DeploymentProvider>(
    editTrigger?.deployment_provider || "vercel"
  );
  const [hasDeployError, setHasDeployError] = useState(false);
  const [hasDeployPreviewUrlError, setHasDeployPreviewUrlError] = useState(
    false
  );

  // tags
  const [tagIds, setTagIds] = useState<string[]>(
    editTrigger ? editTrigger.tags.map((t) => t.id) : []
  );

  // environment
  const [environmentId, setEnvironmentId] = useState<string>(
    editTrigger ? editTrigger.environment_id || "" : stateEnvironmentId || ""
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
    setHasDeployPreviewUrlError(false);
    setNameError("");

    if (
      mode === "deployment" &&
      !deployIntegrationId &&
      ["render", "vercel"].includes(deployProvider)
    ) {
      setHasDeployError(true);
      return;
    }
    if (
      mode === "deployment" &&
      deployProvider === "render" &&
      !deployPreviewUrl
    ) {
      setHasDeployPreviewUrlError(true);
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
        deployPreviewUrl,
        deployProvider,
        environmentId,
        mode,
        name,
        repeatMinutes,
        tagIds,
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
          <DeployFields
            deployBranches={deployBranches}
            deployEnv={deployEnv}
            deployIntegrationId={deployIntegrationId}
            deployPreviewUrl={deployPreviewUrl}
            deployProvider={deployProvider}
            hasDeployError={hasDeployError}
            hasDeployPreviewUrlError={hasDeployPreviewUrlError}
            setDeployBranches={setDeployBranches}
            setDeployEnv={setDeployEnv}
            setDeployIntegrationId={setDeployIntegrationId}
            setDeployPreviewUrl={setDeployPreviewUrl}
            setDeployProvider={setDeployProvider}
          />
        )}
        <Tags setTagIds={setTagIds} tagIds={tagIds} tags={tags} />
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
