import { Box, BoxProps } from "grommet";

import { SelectState, Tag as TagType } from "../../lib/types";
import { copy } from "../../theme/copy";
import { colors, edgeSize, overflowStyle } from "../../theme/theme";
import CheckBox from "./CheckBox";
import NoTag from "./icons/NoTag";
import Tag from "./icons/Tag";
import Text from "./Text";

type Props = {
  isDisabled?: boolean;
  maxWidth?: string;
  onClick?: () => void;
  selectState: SelectState;
  tag?: TagType;
  pad?: BoxProps["pad"];
  width?: BoxProps["width"];
};

const defaultMaxWidth = "320px";

export default function TagCheckBox({
  isDisabled,
  maxWidth,
  onClick,
  selectState,
  pad,
  tag,
  width,
}: Props): JSX.Element {
  const IconComponent = tag ? Tag : NoTag;
  const color = tag?.color || colors.gray9;
  const tagName = tag?.name || copy.noTags;

  const labelHtml = (
    <Box
      align="center"
      direction="row"
      margin={isDisabled ? undefined : { left: "xxsmall" }}
      style={{ maxWidth: maxWidth || defaultMaxWidth }}
      width={width}
    >
      <IconComponent color={color} size={edgeSize.small} />
      <Text
        color="gray9"
        margin={{ left: "xxsmall" }}
        size="component"
        style={overflowStyle}
      >
        {tagName}
      </Text>
    </Box>
  );

  if (isDisabled) return labelHtml;

  return (
    <CheckBox
      a11yTitle={`toggle ${tagName}`}
      checked={selectState === "all"}
      indeterminate={selectState === "some"}
      label={labelHtml}
      onChange={onClick}
      pad={pad}
      width={width}
    />
  );
}
