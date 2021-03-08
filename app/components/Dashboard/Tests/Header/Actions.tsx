import { Box } from "grommet";

import { state } from "../../../../lib/state";
import { ShortTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../theme/theme";
import Button from "../../../shared/AppButton";
import Divider from "../../../shared/Divider";
import Folder from "../../../shared/icons/Folder";
import Lightning from "../../../shared/icons/Lightning";
import Trash from "../../../shared/icons/Trash";

type Props = {
  checkedTests: ShortTest[];
  hasGroups: boolean;
};

export default function Actions({
  checkedTests,
  hasGroups,
}: Props): JSX.Element {
  if (!checkedTests.length) return null;

  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", tests: checkedTests });
  };

  const handleGroupClick = (): void => {
    state.setModal({ name: "editTestsGroup", tests: checkedTests });
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
      {hasGroups && (
        <Button
          IconComponent={Folder}
          label={copy.addToGroup}
          margin={{ horizontal: "xxsmall" }}
          onClick={handleGroupClick}
          type="ghost"
        ></Button>
      )}
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
