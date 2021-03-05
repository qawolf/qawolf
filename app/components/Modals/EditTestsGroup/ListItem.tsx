import { Box, Button } from "grommet";
import styled from "styled-components";

import { Group } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import {
  border,
  colors,
  edgeSize,
  overflowStyle,
  transitionDuration,
} from "../../../theme/theme-new";
import Folder from "../../shared-new/icons/Folder";
import FolderEmpty from "../../shared-new/icons/FolderEmpty";
import Text from "../../shared-new/Text";
import Radio from "./Radio";

type Props = {
  group: Group | null;
  isChecked: boolean;
  onClick: (groupId: string) => void;
};

const StyledBox = styled(Box)`
  transition: background ${transitionDuration};

  &:hover {
    background: ${colors.gray2};
  }
`;

export default function ListItem({
  group,
  isChecked,
  onClick,
}: Props): JSX.Element {
  const IconComponent = group ? Folder : FolderEmpty;
  const groupName = group?.name || copy.noGroup;

  const handleClick = (): void => onClick(group?.id || "");

  return (
    <Button a11yTitle={`select ${groupName}`} onClick={handleClick} plain>
      <StyledBox
        align="center"
        direction="row"
        border={{ ...border, side: "top" }}
        pad={{ vertical: "small" }}
      >
        <Radio isChecked={isChecked} />
        <IconComponent color={colors.gray9} size={edgeSize.small} />
        <Text
          color="gray9"
          margin={{ left: "xxsmall" }}
          size="component"
          style={overflowStyle}
        >
          {groupName}
        </Text>
      </StyledBox>
    </Button>
  );
}
