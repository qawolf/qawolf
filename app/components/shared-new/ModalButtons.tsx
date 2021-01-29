import { Box } from "grommet";

import { copy } from "../../theme/copy";
import Button from "./AppButton";
import Add from "./icons/Add";

type Props = {
  closeModal: () => void;
  onCreateClick: () => void;
  secondaryLabel: string;
};

export default function ModalButtons({
  closeModal,
  onCreateClick,
  secondaryLabel,
}: Props): JSX.Element {
  return (
    <Box
      direction="row"
      flex={false}
      justify="between"
      margin={{ top: "medium" }}
    >
      <Button
        IconComponent={Add}
        label={secondaryLabel}
        onClick={onCreateClick}
        type="secondary"
      />
      <Button label={copy.done} onClick={closeModal} type="primary" />
    </Box>
  );
}
