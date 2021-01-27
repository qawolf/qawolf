import { Box, Keyboard } from "grommet";
import { ChangeEvent, useContext, useEffect, useState } from "react";

import {
  useCreateEnvironment,
  useUpdateEnvironment,
} from "../../../hooks/mutations";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Button from "../../shared-new/AppButton";
import TextInput from "../../shared-new/AppTextInput";
import { StateContext } from "../../StateContext";

type Props = {
  environment?: Environment;
  onCancelClick: () => void;
};

export const id = "environment";

export default function Form({
  environment,
  onCancelClick,
}: Props): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState(environment?.name || "");

  const { teamId } = useContext(StateContext);

  const [
    createEnvironment,
    { loading: createLoading },
  ] = useCreateEnvironment();
  const [updateEnvironment, { loading: editLoading }] = useUpdateEnvironment();

  // focus input when form renders
  useEffect(() => {
    document.getElementById(id)?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSaveClick = (): void => {
    if (!name) {
      setHasError(true);
      return;
    }

    setHasError(false);

    if (environment) {
      updateEnvironment({ variables: { id: environment.id, name } }).then(
        onCancelClick // close form after environment is updated
      );
    } else {
      createEnvironment({ variables: { name, team_id: teamId } }).then(
        onCancelClick // close form after environment is updated
      );
    }
  };

  return (
    <Keyboard onEnter={handleSaveClick}>
      <Box align="center" direction="row" margin={{ vertical: "xxsmall" }}>
        <TextInput
          hasError={hasError}
          id={id}
          onChange={handleChange}
          placeholder={copy.environmentName}
          value={name}
        />
        <Button
          label={copy.cancel}
          margin={{ horizontal: "xxsmall" }}
          onClick={onCancelClick}
          type="secondary"
        />
        <Button
          isDisabled={createLoading || editLoading}
          label={copy.save}
          onClick={handleSaveClick}
          type="primary"
        />
      </Box>
    </Keyboard>
  );
}
