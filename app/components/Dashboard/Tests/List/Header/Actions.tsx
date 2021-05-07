import { Box } from "grommet";

import { state } from "../../../../../lib/state";
import { copy } from "../../../../../theme/copy";
import { borderSize, colors, edgeSize } from "../../../../../theme/theme";
import Button from "../../../../shared/AppButton";
import Divider from "../../../../shared/Divider";
import Tag from "../../../../shared/icons/Tag";
import Trash from "../../../../shared/icons/Trash";
import RunTests from "./RunTests";

type Props = {
  hasCheckedTests: boolean;
  testIds: string[];
};

const buttonType = "secondary" as const;

export default function Actions({
  hasCheckedTests,
  testIds,
}: Props): JSX.Element {
  const handleDeleteClick = (): void => {
    state.setModal({ name: "deleteTests", testIds });
  };

  const handleTagsClick = (): void => {
    state.setModal({ name: "tags", testIds });
  };

  return (
    <Box align="center" direction="row">
      {hasCheckedTests && (
        <Box align="center" direction="row">
          <Button
            IconComponent={Tag}
            margin={{ horizontal: "xxsmall" }}
            label={copy.editTags}
            onClick={handleTagsClick}
            type={buttonType}
          />
          <Button
            IconComponent={Trash}
            color={colors.danger5}
            hoverType="danger"
            label={copy.delete}
            onClick={handleDeleteClick}
            type={buttonType}
          />
          <Divider
            height={edgeSize.large}
            margin={{ horizontal: "small" }}
            width={borderSize.xsmall}
          />
        </Box>
      )}
      <RunTests testIds={testIds} />
    </Box>
  );
}
