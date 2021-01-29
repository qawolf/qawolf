import { Box, Keyboard } from "grommet";
import { ReactNode, useEffect } from "react";

import { copy } from "../../theme/copy";
import Button from "./AppButton";

type Props = {
  children: ReactNode;
  focusId: string;
  isSaveDisabled: boolean;
  onCancelClick: () => void;
  onSaveClick: () => void;
};

export default function ListItemForm({
  children,
  focusId,
  isSaveDisabled,
  onCancelClick,
  onSaveClick,
}: Props): JSX.Element {
  // focus input when form renders
  useEffect(() => {
    if (!focusId) return;
    document.getElementById(focusId)?.focus();
  }, [focusId]);

  return (
    <Keyboard onEnter={onSaveClick}>
      <Box
        align="center"
        direction="row"
        flex={false}
        margin={{ vertical: "xxsmall" }}
      >
        {children}
        <Button
          label={copy.cancel}
          margin={{ horizontal: "xxsmall" }}
          onClick={onCancelClick}
          type="secondary"
        />
        <Button
          isDisabled={isSaveDisabled}
          label={copy.save}
          onClick={onSaveClick}
          type="primary"
        />
      </Box>
    </Keyboard>
  );
}
