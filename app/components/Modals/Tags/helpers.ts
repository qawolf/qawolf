import { SelectState, Tag, TagsForTest } from "../../../lib/types";

type BuildUpdateTagTestsResponse = {
  addTagId: string | null;
  removeTagId: string | null;
  tags: Tag[];
  testIds: string[];
  testTags: TagsForTest[];
};

type GetSelectState = {
  tagId: string;
  testIds: string[];
  testTags: TagsForTest[];
};

export const buildUpdateTagTestsResponse = ({
  addTagId,
  removeTagId,
  tags,
  testIds,
  testTags,
}: BuildUpdateTagTestsResponse): TagsForTest[] => {
  const updatedTagTests = testTags.filter((t) => testIds.includes(t.test_id));

  return updatedTagTests.map((t) => {
    const updatedTags = [...t.tags];
    const tag = tags.find((t) => [addTagId, removeTagId].includes(t.id));

    if (addTagId && tag) updatedTags.push(tag);

    if (removeTagId && tag) {
      const removeIndex = updatedTags.findIndex((t) => t.id === tag.id);
      if (removeIndex > -1) updatedTags.splice(removeIndex, 1);
    }

    return { ...t, tags: updatedTags };
  });
};

export const getSelectState = ({
  tagId,
  testIds,
  testTags,
}: GetSelectState): SelectState => {
  if (!testIds.length) return "none";

  const testFn = (testId: string): boolean => {
    const testTagsForTest = testTags.find((t) => t.test_id === testId);
    return (testTagsForTest?.tags || []).some((t) => t.id === tagId);
  };

  if (testIds.every(testFn)) return "all";
  if (testIds.some(testFn)) return "some";

  return "none";
};
