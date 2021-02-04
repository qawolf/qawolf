import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Button from "../AppButton";
import Add from "../icons/Add";

type Props = {
  closeModal: () => void;
  onCreate: () => void;
  secondaryLabel: string;
};

export default function Buttons({
  closeModal,
  onCreate,
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
        onClick={onCreate}
        type="secondary"
      />
      <Button label={copy.done} onClick={closeModal} type="primary" />
    </Box>
  );
}
