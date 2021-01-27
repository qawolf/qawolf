import { Box, Keyboard } from "grommet";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";

import Button from "../../shared-new/AppButton";
import TextInput from "../../shared-new/AppTextInput";
import Text from "../../shared-new/Text";
import { ChangeEvent, useEffect, useRef, useState } from "react";

type Props = {
  environment: Environment;
  onCancelClick: () => void;
};

export default function ConfirmDelete({
  environment,
  onCancelClick,
}: Props): JSX.Element {
  const [hasError, setHasError] = useState(false);
  const [name, setName] = useState("");

  const ref = useRef<HTMLInputElement>(null);

  // focus text input
  useEffect(() => {
    if (ref.current) ref.current.focus();
  }, [ref.current]);

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setName(e.target.value);
  };

  const handleDeleteClick = (): void => {
    if (name !== environment.name) {
      setHasError(true);
      return;
    }

    setHasError(false);
  };

  return (
    <Keyboard onEnter={handleDeleteClick}>
      <Box>
        <Text
          color="gray9"
          margin={{ bottom: "medium" }}
          size="componentParagraph"
          style={{ display: "inline" }}
        >
          {copy.environmentDeleteConfirm} <b>{environment.name}</b>{" "}
          {copy.environmentDeleteConfirm2}
        </Text>
        <TextInput
          hasError={hasError}
          onChange={handleChange}
          placeholder={environment.name}
          ref={ref}
          value={name}
        />
        <Box direction="row" justify="between" margin={{ top: "medium" }}>
          <Button
            label={copy.cancel}
            onClick={onCancelClick}
            type="secondary"
          />
          <Button
            label={copy.delete}
            onClick={handleDeleteClick}
            type="danger"
          />
        </Box>
      </Box>
    </Keyboard>
  );
}
