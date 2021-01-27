import { Box } from "grommet";
import { copy } from "../../../theme/copy";

import Button from "../../shared-new/AppButton";
import Edit from "../../shared-new/icons/Edit";
import Trash from "../../shared-new/icons/Trash";

export default function Buttons(): JSX.Element {
  return (
    <Box direction="row" margin={{ vertical: "xxsmall" }}>
      <Button IconComponent={Edit} a11yTitle={copy.edit} onClick={() => null} />
      <Button
        IconComponent={Trash}
        a11yTitle={copy.delete}
        hoverType="danger"
        margin={{ left: "xxsmall" }}
        onClick={() => null}
      />
    </Box>
  );
}
