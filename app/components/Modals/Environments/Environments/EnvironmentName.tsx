import { Box } from "grommet";
import { ChangeEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import {
  useCreateEnvironment,
  useUpdateEnvironment,
} from "../../../../hooks/mutations";
import { useOnClickOutside } from "../../../../hooks/onClickOutside";
import { Environment } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import TextInput from "../../../shared-new/AppTextInput";

type Props = {
  environment?: Environment;
  onCancel: () => void;
  teamId: string;
};

export const id = "environment";

export default function EnvironmentName({
  environment,
  onCancel,
  teamId,
}: Props): JSX.Element {
  const ref = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(environment?.name || "");

  const [
    createEnvironment,
    { loading: isCreateLoading },
  ] = useCreateEnvironment();
  const [
    updateEnvironment,
    { loading: isEditLoading },
  ] = useUpdateEnvironment();

  // focus input
  useEffect(() => ref.current?.focus(), []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (isCreateLoading || isEditLoading) return;

    if (!name) {
      onCancel();
      return;
    }

    if (environment) {
      updateEnvironment({
        optimisticResponse: {
          updateEnvironment: {
            ...environment,
            name,
          },
        },
        variables: { id: environment.id, name },
      }).then(onCancel); // close form after environment is updated
    } else {
      createEnvironment({ variables: { name, team_id: teamId } }).then(
        onCancel
      );
    }
  };

  const handleBlur = (): void => {
    handleSave();
    ref.current?.blur();
  };

  const handleClickOutside = (): void => {
    if (environment) handleBlur();
  };

  useOnClickOutside({ onClickOutside: handleClickOutside, ref });

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter") handleBlur();
  };

  return (
    <Box margin={{ bottom: "2px" }}>
      <TextInput
        id={id}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={copy.environment}
        ref={ref}
        value={name}
      />
    </Box>
  );
}
