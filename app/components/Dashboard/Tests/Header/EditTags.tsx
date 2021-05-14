import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import { colors, edgeSize } from "../../../../theme/theme";
import Tag from "../../../shared/icons/Tag";
import Text from "../../../shared/Text";
import Option from "./Option";

type Props = {
  onClose: () => void;
};

export default function EditTags({ onClose }: Props): JSX.Element {
  const handleClick = (): void => {
    state.setModal({ name: "tags", testIds: [] });
    onClose();
  };

  return (
    <Option a11yTitle="edit tags" onClick={handleClick}>
      <Box
        align="center"
        direction="row"
        pad={{ horizontal: "xsmall", vertical: "xxsmall" }}
      >
        <Tag color={colors.gray9} size={edgeSize.small} />
        <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
          {copy.editTags}
        </Text>
      </Box>
    </Option>
  );
}
