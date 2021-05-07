import { Box } from "grommet";

import { SelectState, Tag } from "../../../lib/types";
import { borderSize, edgeSize, overflowStyle } from "../../../theme/theme";
import CheckBox from "../../shared/CheckBox";
import EditDeleteButtons, { StyledBox } from "../../shared/EditDeleteButtons";
import TagIcon from "../../shared/icons/Tag";
import Text from "../../shared/Text";
import Form from "./Form";

type Props = {
  editTagId: string | null;
  noBorder: boolean;
  onCancel: () => void;
  onClick: () => void;
  onDelete: () => void;
  onEdit: () => void;
  selectState: SelectState;
  tag: Tag;
};

const maxWidth = "320px";

export default function ListItem({
  editTagId,
  noBorder,
  onCancel,
  onClick,
  onDelete,
  onEdit,
  selectState,
  tag,
}: Props): JSX.Element {
  const labelHtml = (
    <Box
      align="center"
      direction="row"
      margin={{ left: "xxsmall" }}
      style={{ maxWidth }}
    >
      <TagIcon color={tag.color} size={edgeSize.small} />
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

  const innerHtml =
    tag.id === editTagId ? (
      <Box width="full">
        <Form key={tag.id} onCancel={onCancel} tag={tag} />
      </Box>
    ) : (
      <>
        <Box align="center" direction="row">
          <Box margin={{ right: "small" }}>
            <CheckBox
              a11yTitle={`assign ${tag.name}`}
              checked={selectState === "all"}
              indeterminate={selectState === "some"}
              label={labelHtml}
              onChange={onClick}
            />
          </Box>
        </Box>
        <EditDeleteButtons
          name={tag.name}
          onDelete={onDelete}
          onEdit={onEdit}
        />
      </>
    );

  return (
    <StyledBox
      a11yTitle={`tag ${tag.name}`}
      align="center"
      border={
        noBorder
          ? undefined
          : { color: "gray3", side: "bottom", size: borderSize.xsmall }
      }
      direction="row"
      flex={false}
      justify="between"
    >
      {innerHtml}
    </StyledBox>
  );
}
