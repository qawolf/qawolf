import { Box } from "grommet";
import { Icon } from "grommet-icons";

import { copy } from "../../../theme/copy";
import Button from "../AppButton";

type Props = {
  SecondaryIconComponent?: Icon;
  hideSecondary?: boolean;
  onPrimaryClick: () => void;
  onSecondaryClick: () => void;
  primaryIsDisabled?: boolean;
  primaryLabel?: string;
  secondaryLabel: string;
};

export default function Buttons({
  SecondaryIconComponent,
  hideSecondary,
  onPrimaryClick,
  onSecondaryClick,
  primaryIsDisabled,
  primaryLabel,
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
          IconComponent={SecondaryIconComponent}
          label={secondaryLabel}
          onClick={onSecondaryClick}
          type="secondary"
        />
      )}
      <Button
        isDisabled={primaryIsDisabled}
        label={primaryLabel || copy.done}
        onClick={onPrimaryClick}
        type="primary"
      />
    </Box>
  );
}
