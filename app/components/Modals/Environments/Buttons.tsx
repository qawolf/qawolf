import { Box } from "grommet";
import { copy } from "../../../theme/copy";

import Button from "../../shared-new/AppButton";
import Add from "../../shared-new/icons/Add";

type Props = {
  closeModal: () => void;
  onCreateClick: () => void;
};

export default function Buttons({
  closeModal,
  onCreateClick,
}: Props): JSX.Element {
  return (
    <Box direction="row" justify="between" margin={{ top: "medium" }}>
      <Button
        IconComponent={Add}
        label={copy.environmentNew}
        onClick={onCreateClick}
        type="secondary"
      />
      <Button label={copy.done} onClick={closeModal} type="primary" />
    </Box>
  );
}
