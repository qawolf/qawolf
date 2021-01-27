import { Box } from "grommet";
import { copy } from "../../../theme/copy";

import Button from "../../shared-new/AppButton";
import Edit from "../../shared-new/icons/Edit";
import Trash from "../../shared-new/icons/Trash";

type Props = {
  onDeleteClick: () => void;
  onEditClick: () => void;
};

export default function EnvironmentActions({
  onDeleteClick,
  onEditClick,
}: Props): JSX.Element {
  return (
    <Box direction="row" margin={{ vertical: "xxsmall" }}>
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