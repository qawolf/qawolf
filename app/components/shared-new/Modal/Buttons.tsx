import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Button from "../AppButton";
import Add from "../icons/Add";

type Props = {
  closeModal: () => void;
  hideSecondary?: boolean;
  onCreate: () => void;
  secondaryLabel: string;
};

export default function Buttons({
  closeModal,
  hideSecondary,
  onCreate,
  secondaryLabel,
}: Props): JSX.Element {
  return (
    <Box
      direction="row"
      flex={false}
      justify={hideSecondary ? "end" : "between"}
      margin={{ top: "medium" }}
    >
      {!hideSecondary && (
        <Button
          IconComponent={Add}
          label={secondaryLabel}
          onClick={onCreate}
          type="secondary"
        />
      )}
      <Button label={copy.done} onClick={closeModal} type="primary" />
    </Box>
  );
}
