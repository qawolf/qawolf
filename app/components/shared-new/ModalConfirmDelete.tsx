import { Box, Keyboard } from "grommet";
import { ReactNode } from "react";

import { copy } from "../../theme/copy";
import Button from "./AppButton";

type Props = {
  children: ReactNode;
  isDeleteDisabled: boolean;
  onCancelClick: () => void;
  onDeleteClick: () => void;
};

export default function ModalConfirmDelete({
  children,
  isDeleteDisabled,
  onCancelClick,
  onDeleteClick,
}: Props): JSX.Element {
  return (
    <Keyboard onEnter={onDeleteClick}>
      <Box>
        {children}
        <Box direction="row" justify="between" margin={{ top: "medium" }}>
          <Button
            label={copy.cancel}
            onClick={onCancelClick}
            type="secondary"
          />
          <Button
            isDisabled={isDeleteDisabled}
            label={copy.delete}
            onClick={onDeleteClick}
            type="danger"
          />
        </Box>
      </Box>
    </Keyboard>
  );
}
