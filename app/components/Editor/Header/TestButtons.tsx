import { useContext, useState } from "react";
import { RiGitCommitLine } from "react-icons/ri";

import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import Button from "../../shared/AppButton";
import Tag from "../../shared/icons/Tag";
import { EditorContext } from "../contexts/EditorContext";

type Props = {
  branch: string | null;
  testId: string;
};

export default function TestButtons({ branch, testId }: Props): JSX.Element {
  const { hasChanges, commitEditor } = useContext(EditorContext);
  const [loading, setLoading] = useState(false);

  const handleCommitClick = async (): Promise<void> => {
    setLoading(true);
    await commitEditor();
    setLoading(false);
  };

  const handleTagsClick = (): void => {
    state.setModal({ name: "tags", testIds: [testId] });
  };

  return (
    <>
      <Button
        IconComponent={Tag}
        label={copy.editTags}
        onClick={handleTagsClick}
        type="secondary"
      />
      {!!branch && (
        <Button
          IconComponent={RiGitCommitLine}
          isDisabled={!hasChanges || loading}
          label={copy.commit}
          margin={{ left: "small" }}
          onClick={handleCommitClick}
          type="primary"
        />
      )}
    </>
  );
}
