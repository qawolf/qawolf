import { Box, Keyboard } from "grommet";
import { ChangeEvent, useEffect, useState } from "react";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared-new/AppTextInput";
import Button from "../../shared-new/AppButton";
import { useUpdateEnvironment } from "../../../hooks/mutations";

type Props = {
  environment?: Environment;
  onCancelClick: () => void;
};

const id = "environment";

export default function Form({
  environment,
  onCancelClick,
}: Props): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState(environment?.name || "");

  const [updateEnvironment, { loading }] = useUpdateEnvironment();

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
    // TODO: create environment
    if (!environment) return;

    // close form after environment is updated
    updateEnvironment({ variables: { id: environment.id, name } }).then(
      onCancelClick
    );
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
          isDisabled={loading}
          label={copy.save}
          onClick={handleSaveClick}
          type="primary"
        />
      </Box>
    </Keyboard>
  );
}
