import { Box, Keyboard } from "grommet";
import { ReactNode, useEffect } from "react";

import { copy } from "../../theme/copy";
import Button from "./AppButton";

type Props = {
  children: ReactNode;
  focusId: string;
  isSaveDisabled: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function ListItemForm({
  children,
  focusId,
  isSaveDisabled,
  onCancel,
  onSave,
}: Props): JSX.Element {
  // focus input when form renders
  useEffect(() => {
    if (!focusId) return;
    document.getElementById(focusId)?.focus();
  }, [focusId]);

  return (
    <Keyboard onEnter={onSave}>
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
          onClick={onCancel}
          type="secondary"
        />
        <Button
          isDisabled={isSaveDisabled}
          label={copy.save}
          onClick={onSave}
          type="primary"
        />
      </Box>
    </Keyboard>
  );
}
