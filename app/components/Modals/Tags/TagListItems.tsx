import { useUpdateTagTests } from "../../../hooks/mutations";
import { Tag, TagsForTest } from "../../../lib/types";
import { buildUpdateTagTestsResponse, getSelectState } from "./helpers";
import ListItem from "./ListItem";

type Props = {
  editTagId: string | null;
  onCancel: () => void;
  onDelete: (tag: Tag) => void;
  onEdit: (tag: Tag) => void;
  tags: Tag[];
  testIds: string[];
  testTags: TagsForTest[];
};

export default function TagListItems({
  editTagId,
  onCancel,
  onDelete,
  onEdit,
  tags,
  testIds,
  testTags,
}: Props): JSX.Element {
  const [updateTagTests, { loading }] = useUpdateTagTests();

  const handleClick = (tagId: string): void => {
    if (loading) return;

    const state = getSelectState({ tagId, testIds, testTags });
    const add_tag_id = state === "all" ? null : tagId;
    const remove_tag_id = state === "all" ? tagId : null;

    updateTagTests({
      optimisticResponse: {
        updateTagTests: buildUpdateTagTestsResponse({
          addTagId: add_tag_id,
          removeTagId: remove_tag_id,
          tags,
          testIds,
          testTags,
        }),
      },
      variables: { add_tag_id, remove_tag_id, test_ids: testIds },
    });
  };

  const tagsHtml = tags.map((tag, i) => {
    const selectState = getSelectState({ tagId: tag.id, testIds, testTags });

    return (
      <ListItem
        editTagId={editTagId}
        key={tag.id}
        noBorder={i === tags.length - 1}
        onCancel={onCancel}
        onClick={() => handleClick(tag.id)}
        onDelete={() => onDelete(tag)}
        onEdit={() => onEdit(tag)}
        selectState={selectState}
        tag={tag}
      />
    );
  });

  return <>{tagsHtml}</>;
}
