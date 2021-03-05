import { Box } from "grommet";
import styled from "styled-components";

import { copy } from "../../theme/copy";
import { transitionDuration } from "../../theme/theme-new";
import Button from "./AppButton";
import Edit from "./icons/Edit";
import Trash from "./icons/Trash";

type Props = {
  name?: string;
  onDelete: () => void;
  onEdit: () => void;
};

const className = "button";

export const StyledBox = styled(Box)`
  .${className} {
    opacity: 0;
    transition: opacity ${transitionDuration};
  }

  &:hover {
    .${className} {
      opacity: 1;
    }
  }
`;

export default function EditDeleteButtons({
  name,
  onDelete,
  onEdit,
}: Props): JSX.Element {
  const nameText = name ? ` ${name}` : "";

  return (
    <Box direction="row" flex={false} margin={{ vertical: "xxsmall" }}>
      <Button
        IconComponent={Edit}
        a11yTitle={`${copy.edit}${nameText}`}
        className={className}
        onClick={onEdit}
        type="ghost"
      />
      <Button
        IconComponent={Trash}
        a11yTitle={`${copy.delete}${nameText}`}
        className={className}
        hoverType="danger"
        margin={{ left: "xxsmall" }}
        onClick={onDelete}
        type="ghost"
      />
    </Box>
  );
}
