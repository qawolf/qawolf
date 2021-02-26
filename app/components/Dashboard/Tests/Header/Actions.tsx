import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { ShortTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../theme/theme-new";
import Button from "../../../shared-new/AppButton";
import Divider from "../../../shared-new/Divider";
import Folder from "../../../shared-new/icons/Folder";
import Lightning from "../../../shared-new/icons/Lightning";
import Trash from "../../../shared-new/icons/Trash";

type Props = {
  checkedTests: ShortTest[];
};

export default function Actions({ checkedTests }: Props): JSX.Element {
  if (!checkedTests.length) return null;

  const tests = checkedTests.map(({ id, name }) => {
    return { id, name };
  });

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", tests });
  };

  const handleGroupClick = (): void => {
    state.setModal({ name: "editTestsGroup", tests });
  };

  const handleTriggersClick = (): void => {
    state.setModal({
      name: "triggers",
      testIds: checkedTests.map((t) => t.id),
    });
  };

  return (
    <Box align="center" direction="row">
      <Button
        IconComponent={Lightning}
        label={copy.editTriggers}
        onClick={handleTriggersClick}
        type="ghost"
      />
      <Button
        IconComponent={Folder}
        label={copy.assignToGroup}
        margin={{ horizontal: "xxsmall" }}
        onClick={handleGroupClick}
        type="ghost"
      ></Button>
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
