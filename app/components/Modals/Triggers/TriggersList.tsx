import { Box } from "grommet";
import { ReactNode } from "react";

import { useOnHotKey } from "../../../hooks/onHotKey";
import { Trigger } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { border } from "../../../theme/theme";
import Divider from "../../shared/Divider";
import Add from "../../shared/icons/Add";
import Buttons from "../../shared/Modal/Buttons";
import Text from "../../shared/Text";
import Header from "./Header";
import ListItem from "./ListItem";

type Props = {
  closeModal: () => void;
  isLoading: boolean;
  onCreate: () => void;
  onDelete: (trigger: Trigger) => void;
  onEdit: (trigger: Trigger) => void;
  triggers: Trigger[] | null;
};

export default function TriggersList({
  closeModal,
  isLoading,
  onCreate,
  onDelete,
  onEdit,
  triggers,
}: Props): JSX.Element {
  useOnHotKey({ hotKey: "Enter", onHotKey: closeModal });

  let innerHtml: ReactNode;

  if (!isLoading && triggers?.length) {
    const triggersHtml = triggers.map((t, i) => {
      return (
        <ListItem
          key={t.id}
          noBorder={i === triggers.length - 1}
          onDelete={() => onDelete(t)}
          onEdit={() => onEdit(t)}
          trigger={t}
        />
      );
    });

    innerHtml = triggersHtml;
  } else {
    innerHtml = (
      <Box border={{ ...border, side: "bottom" }}>
        <Text
          color="gray9"
          margin={{ vertical: "xxxlarge" }}
          size="componentParagraph"
          textAlign="center"
        >
          {isLoading ? copy.loading : copy.triggersEmpty}
        </Text>
      </Box>
    );
  }

  return (
    <Box flex={false}>
      <Header closeModal={closeModal} />
      <Divider />
      {innerHtml}
      <Buttons
        SecondaryIconComponent={Add}
        onPrimaryClick={closeModal}
        onSecondaryClick={onCreate}
        primaryLabel={copy.done}
        secondaryLabel={copy.createTrigger}
        showDivider
      />
    </Box>
  );
}
