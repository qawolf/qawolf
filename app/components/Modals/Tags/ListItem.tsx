import { Box } from "grommet";

import { SelectState, Tag } from "../../../lib/types";
import { borderSize } from "../../../theme/theme";
import EditDeleteButtons, { StyledBox } from "../../shared/EditDeleteButtons";
import TagCheckBox from "../../shared/TagCheckBox";
import Form from "./Form";

type Props = {
  editTagId: string | null;
  noBorder: boolean;
  onClick: () => void;
  onClose: () => void;
  onDelete: () => void;
  onEdit: () => void;
  selectState: SelectState;
  tag: Tag;
};

export default function ListItem({
  editTagId,
  noBorder,
  onClick,
  onClose,
  onDelete,
  onEdit,
  selectState,
  tag,
}: Props): JSX.Element {
  const innerHtml =
    tag.id === editTagId ? (
      <Box width="full">
        <Form key={tag.id} onClose={onClose} tag={tag} />
      </Box>
    ) : (
      <>
        <TagCheckBox onClick={onClick} selectState={selectState} tag={tag} />
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
