import { Box } from "grommet";
import { useContext } from "react";

import { useTags, useTagsForTests } from "../../../hooks/queries";
import Modal from "../../shared/Modal";
import { StateContext } from "../../StateContext";
import List from "./List";

type Props = {
  closeModal: () => void;
  testIds: string[];
};

export default function Tags({ closeModal, testIds }: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data, loading: isTagsLoading } = useTags({ team_id: teamId });
  const tags = data?.tags || null;

  const { data: testTagsData, loading: isTestTagsLoading } = useTagsForTests({
    test_ids: testIds,
  });
  const testTags = testTagsData?.tagsForTests || [];

  return (
    <Modal closeModal={closeModal}>
      <Box overflow={{ vertical: "auto" }} pad="medium">
        <List
          closeModal={closeModal}
          isLoading={isTagsLoading || isTestTagsLoading}
          tags={tags}
          testIds={testIds}
          testTags={testTags}
        />
      </Box>
    </Modal>
  );
}
