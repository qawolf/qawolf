import { Box, BoxProps } from "grommet";

import { SelectState, Tag as TagType } from "../../lib/types";
import { edgeSize, overflowStyle } from "../../theme/theme";
import CheckBox from "./CheckBox";
import Tag from "./icons/Tag";
import Text from "./Text";

type Props = {
  onClick?: () => void;
  selectState: SelectState;
  tag: TagType;
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
  const labelHtml = (
    <Box
      align="center"
      direction="row"
      margin={{ left: "xxsmall" }}
      style={{ maxWidth }}
      width={width}
    >
      <Tag color={tag.color} size={edgeSize.small} />
      <Text
        color="gray9"
        margin={{ left: "xxsmall" }}
        size="component"
        style={overflowStyle}
      >
        {tag.name}
      </Text>
    </Box>
  );

  return (
    <CheckBox
      a11yTitle={`assign ${tag.name}`}
      checked={selectState === "all"}
      indeterminate={selectState === "some"}
      label={labelHtml}
      onChange={onClick}
      pad={pad}
      width={width}
    />
  );
}
