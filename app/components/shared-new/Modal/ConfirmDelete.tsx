import { Box, Keyboard } from "grommet";
import { ReactNode } from "react";

import { copy } from "../../../theme/copy";
import Button from "../AppButton";

type Props = {
  children: ReactNode;
  isDeleteDisabled: boolean;
  onCancel: () => void;
  onDelete: () => void;
};

export default function ConfirmDelete({
  children,
  isDeleteDisabled,
  onCancel,
  onDelete,
}: Props): JSX.Element {
  return (
    <Keyboard onEnter={onDelete}>
      <Box>
        {children}
        <Box direction="row" justify="between" margin={{ top: "medium" }}>
          <Button label={copy.cancel} onClick={onCancel} type="secondary" />
          <Button
            isDisabled={isDeleteDisabled}
            label={copy.delete}
            onClick={onDelete}
            type="danger"
          />
        </Box>
      </Box>
    </Keyboard>
  );
}
