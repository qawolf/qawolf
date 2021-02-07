import { Box, Keyboard } from "grommet";
import { ReactNode } from "react";

import { copy } from "../../theme/copy";
import Button from "./AppButton";

type Props = {
  children: ReactNode;
  isSaveDisabled: boolean;
  onCancel: () => void;
  onSave: () => void;
};

export default function ListItemForm({
  children,
  isSaveDisabled,
  onCancel,
  onSave,
}: Props): JSX.Element {
  return (
    <Keyboard onEnter={onSave}>
      <Box
        align="center"
        direction="row"
        flex={false}
        margin={{ vertical: "xxsmall" }}
      >
        <Box direction="row" justify="between">
          {children}
        </Box>
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
