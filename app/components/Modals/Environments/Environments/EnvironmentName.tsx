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
  onClose: () => void;
  setSelectedEnvironmentId?: (environmentId: string) => void;
  teamId: string;
};

export const id = "environment";

export default function EnvironmentName({
  environment,
  onClose,
  setSelectedEnvironmentId,
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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSave = (): void => {
    if (isCreateLoading || isEditLoading) return;

    if (!name) {
      onClose();
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
      }).then(onClose);
    } else {
      createEnvironment({ variables: { name, team_id: teamId } }).then(
        ({ data }) => {
          // show newly created environment if possible
          if (setSelectedEnvironmentId) {
            setSelectedEnvironmentId(data?.createEnvironment.id);
          }

          onClose();
        }
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
        autoFocus
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
