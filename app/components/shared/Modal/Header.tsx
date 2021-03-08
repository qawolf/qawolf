import { Box } from "grommet";

import { copy } from "../../../theme/copy";
import Button from "../AppButton";
import Close from "../icons/Close";
import Text from "../Text";

type Props = {
  closeModal: () => void;
  label: string;
};

export default function Header({ closeModal, label }: Props): JSX.Element {
  return (
    <Box align="center" direction="row" flex={false} justify="between">
      <Text color="gray9" size="componentHeader">
        {label}
      </Text>
      <Button
        IconComponent={Close}
        a11yTitle={copy.close}
        onClick={closeModal}
        type="ghost"
      />
    </Box>
  );
}
