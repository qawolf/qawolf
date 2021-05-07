import { Box, BoxProps } from "grommet";

import { SelectState, Tag as TagType } from "../../lib/types";
import { copy } from "../../theme/copy";
import { edgeSize, overflowStyle } from "../../theme/theme";
import CheckBox from "./CheckBox";
import Tag from "./icons/Tag";
import Text from "./Text";

type Props = {
  onClick?: () => void;
  selectState: SelectState;
  tag?: TagType;
  pad?: BoxProps["pad"];
  width?: BoxProps["width"];
};

const maxWidth = "320px";

export default function TagCheckBox({
  onClick,
  selectState,
  pad,
  tag,
  width,
}: Props): JSX.Element {
  const tagName = tag?.name || copy.noTags;

  const labelHtml = (
    <Box
      align="center"
      direction="row"
      margin={{ left: "xxsmall" }}
      style={{ maxWidth }}
      width={width}
    >
      {!!tag && <Tag color={tag.color} size={edgeSize.small} />}
      <Text
        color="gray9"
        margin={tag ? { left: "xxsmall" } : undefined}
        size="component"
        style={overflowStyle}
      >
        {tagName}
      </Text>
    </Box>
  );

  return (
    <CheckBox
      a11yTitle={`assign ${tagName}`}
      checked={selectState === "all"}
      indeterminate={selectState === "some"}
      label={labelHtml}
      onChange={onClick}
      pad={pad}
      width={width}
    />
  );
}
