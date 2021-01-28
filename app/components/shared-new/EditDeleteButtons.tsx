import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../theme/copy";
import { transitionDuration } from "../../theme/theme-new";
import Button from "./AppButton";
import Edit from "./icons/Edit";
import Trash from "./icons/Trash";

type Props = {
  onDeleteClick: () => void;
  onEditClick: () => void;
};

export const StyledBox = styled(Box)`
  button {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    button {
      opacity: 1;
    }
  }
`;

export default function EditDeleteButtons({
  onDeleteClick,
  onEditClick,
}: Props) {
  return (
    <Box direction="row" flex={false} margin={{ vertical: "xxsmall" }}>
      <Button
        IconComponent={Edit}
        a11yTitle={copy.edit}
        onClick={onEditClick}
        type="ghost"
      />
      <Button
        IconComponent={Trash}
        a11yTitle={copy.delete}
        hoverType="danger"
        margin={{ left: "xxsmall" }}
        onClick={onDeleteClick}
        type="ghost"
      />
    </Box>
  );
}
