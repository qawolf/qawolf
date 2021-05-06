import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { ShortTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../theme/theme";
import Button from "../../../shared/AppButton";
import Divider from "../../../shared/Divider";
import Lightning from "../../../shared/icons/Lightning";
import Tag from "../../../shared/icons/Tag";
import Trash from "../../../shared/icons/Trash";

type Props = {
  checkedTests: ShortTest[];
};

export default function Actions({ checkedTests }: Props): JSX.Element {
  if (!checkedTests.length) return null;

  const testIds = checkedTests.map((t) => t.id);

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", testIds });
  };

  const handleTagsClick = (): void => {
    state.setModal({ name: "tags", testIds });
  };

  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds });
  };

  return (
    <Box align="center" direction="row">
      <Button
        IconComponent={Tag}
        label={copy.editTags}
        onClick={handleTagsClick}
        type="ghost"
      />
      <Button
        IconComponent={Lightning}
        label={copy.editTriggers}
        margin={{ horizontal: "xxsmall" }}
        onClick={handleTriggersClick}
        type="ghost"
      />
      <Button
        IconComponent={Trash}
        color={colors.danger5}
        hoverType="danger"
        label={copy.delete}
        onClick={handleDeleteClick}
        type="ghost"
      />
      <Divider
        height={edgeSize.large}
        margin={{ horizontal: "small" }}
        width={borderSize.xsmall}
      />
    </Box>
  );
}
