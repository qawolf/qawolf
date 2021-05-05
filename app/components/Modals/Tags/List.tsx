import { Box } from "grommet";
import { ReactNode } from "react";

import { Tag, TagsForTest } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Divider from "../../shared/Divider";
import Add from "../../shared/icons/Add";
import Buttons from "../../shared/Modal/Buttons";
import Text from "../../shared/Text";
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
      <Buttons
        SecondaryIconComponent={Add}
        onPrimaryClick={closeModal}
        onSecondaryClick={() => null}
        primaryLabel={copy.done}
        secondaryLabel={copy.createTag}
        showDivider
      />
    </Box>
  );
}
