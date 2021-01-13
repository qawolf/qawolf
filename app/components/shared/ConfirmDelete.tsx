import { Box } from "grommet";

import { copy } from "../../theme/copy";
import Button from "./Button";
import Layer from "./Layer";
import Text from "./Text";

type Props = {
  closeModal: () => void;
  disabled?: boolean;
  message: string;
  namesToDelete: string[];
  onClick: () => void;
};

const BUTTON_WIDTH = "120px";

export default function ConfirmDelete({
  closeModal,
  disabled,
  message,
  namesToDelete,
  onClick,
}: Props): JSX.Element {
  const namesHtml = namesToDelete.map((name, i) => {
    return (
      <Text color="black" key={i} margin={{ bottom: "small" }} size="medium">
        {name}
      </Text>
    );
  });

  return (
    <Layer onClickOutside={closeModal} onEsc={closeModal}>
      <Box pad="large">
        <Text color="black" size="medium" weight="bold">
          {message}
        </Text>
        <Box align="center" margin={{ bottom: "small", top: "medium" }}>
          {namesHtml}
        </Box>
        <Box direction="row" justify="around">
          <Button
            isSecondary
            onClick={closeModal}
            message={copy.cancel}
            width={BUTTON_WIDTH}
          />
          <Button
            disabled={disabled}
            message={copy.deleteOk}
            onClick={onClick}
            width={BUTTON_WIDTH}
          />
        </Box>
      </Box>
    </Layer>
  );
}
