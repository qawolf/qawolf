import { Box } from "grommet";
import { useContext, useState } from "react";

import { useTags, useTagsForTests } from "../../../hooks/queries";
import { Tag } from "../../../lib/types";
import Modal from "../../shared/Modal";
import { StateContext } from "../../StateContext";
import List from "./List";

type Props = {
  closeModal: () => void;
  testIds: string[];
};

export default function Tags({ closeModal, testIds }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const [deleteTag, setDeleteTag] = useState<Tag | null>(null);

  const { data, loading } = useTags({ team_id: teamId });
  const tags = data?.tags || null;

  const { data: testTagsData } = useTagsForTests({
    test_ids: testIds,
  });
  const testTags = testTagsData?.tagsForTests || [];
  const isTestTagsLoading = !!testIds.length && !testTagsData?.tagsForTests;

  const handleDelete = (tag: Tag): void => {
    setDeleteTag(tag);
  };

  return (
    <Modal closeModal={closeModal}>
      <Box overflow={{ vertical: "auto" }} pad="medium">
        <List
          closeModal={closeModal}
          isLoading={loading || isTestTagsLoading}
          onDelete={handleDelete}
          tags={tags}
          testIds={testIds}
          testTags={testTags}
        />
      </Box>
    </Modal>
  );
}
