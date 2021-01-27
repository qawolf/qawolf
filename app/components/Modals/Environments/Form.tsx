import { Box } from "grommet";
import { ChangeEvent, useEffect, useState } from "react";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import TextInput from "../../shared-new/AppTextInput";
import Button from "../../shared-new/AppButton";

type Props = {
  environment?: Environment;
  onCancelClick: () => void;
};

const id = "environment";

export default function Form({
  environment,
  onCancelClick,
}: Props): JSX.Element {
  const [name, setName] = useState(environment?.name || "");

  // focus input when form renders
  useEffect(() => {
    document.getElementById(id)?.focus();
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleSaveClick = (): void => {};

  return (
    <Box align="center" direction="row" margin={{ vertical: "xxsmall" }}>
      <TextInput
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
      <Button label={copy.save} onClick={handleSaveClick} type="primary" />
    </Box>
  );
}
