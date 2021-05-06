import { Box } from "grommet";
import { ReactNode, useState } from "react";

import { Tag, TagsForTest } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared/Divider";
import Add from "../../shared/icons/Add";
import Buttons from "../../shared/Modal/Buttons";
import Text from "../../shared/Text";
import Form, { id as formInputId } from "./Form";
import Header from "./Header";

type Props = {
  closeModal: () => void;
  isLoading: boolean;
  tags: Tag[] | null;
  testIds: string[];
  testTags: TagsForTest[];
};

export default function List({
  closeModal,
  isLoading,
  tags,
  testIds,
  testTags,
}: Props): JSX.Element {
  const [isCreate, setIsCreate] = useState(false);
  const [editTagId, setEditTagId] = useState<string | null>(null);

  const handleCancel = (): void => {
    setEditTagId(null);
    setIsCreate(false);
  };

  const handleCreateClick = (): void => {
    setEditTagId(null); // clear existing form
    setIsCreate(true);
    // focus form if it already exists
    document.getElementById(formInputId)?.focus();
  };

  let innerHtml: ReactNode;

  if (!isLoading && tags?.length) {
  } else {
    innerHtml = (
      <Text
        color="gray9"
        margin={{ vertical: "xxxlarge" }}
        size="componentParagraph"
        textAlign="center"
      >
        {isLoading ? copy.loading : copy.tagsEmpty}
      </Text>
    );
  }

  return (
    <Box flex={false}>
      <Header closeModal={closeModal} testCount={testIds.length} />
      <Divider />
      {innerHtml}
      {isCreate && (
        <>
          <Divider />
          <Form onCancel={handleCancel} />
        </>
      )}
      <Buttons
        SecondaryIconComponent={Add}
        onPrimaryClick={closeModal}
        onSecondaryClick={handleCreateClick}
        primaryLabel={copy.done}
        secondaryLabel={copy.createTag}
        showDivider
      />
    </Box>
  );
}
