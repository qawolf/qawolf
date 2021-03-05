import { Box, ThemeContext } from "grommet";
import { useContext, useState } from "react";

import { useUpdateTestsGroup } from "../../../hooks/mutations";
import { useOnHotKey } from "../../../hooks/onHotKey";
import { useGroups } from "../../../hooks/queries";
import { SelectedTest } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { theme } from "../../../theme/theme-new";
import Divider from "../../shared-new/Divider";
import Modal from "../../shared-new/Modal";
import Buttons from "../../shared-new/Modal/Buttons";
import Header from "../../shared-new/Modal/Header";
import Text from "../../shared-new/Text";
import { StateContext } from "../../StateContext";
import ListItem from "./ListItem";

type Props = {
  closeModal: () => void;
  tests: SelectedTest[];
};

const getInitialGroupId = (tests: SelectedTest[]): string | null => {
  const groupIds = Array.from(new Set(tests.map((t) => t.group_id)));
  if (groupIds.length !== 1) return null;

  return groupIds[0] || null;
};

export default function EditTestsGroup({
  closeModal,
  tests,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useGroups({ team_id: teamId });
  const groups = data?.groups;

  const [updateTestsGroup, { loading }] = useUpdateTestsGroup();

  const [groupId, setGroupId] = useState<string | null>(
    getInitialGroupId(tests)
  );

  const handleClick = (): void => {
    updateTestsGroup({
      variables: {
        group_id: groupId || null,
        test_ids: tests.map((t) => t.id),
      },
    }).then(closeModal);
  };

  useOnHotKey({ hotKey: "Enter", onHotKey: handleClick });

  const optionsHtml = (groups || []).map((g) => {
    return (
      <ListItem
        group={g}
        isChecked={g.id === groupId}
        key={g.id}
        onClick={setGroupId}
      />
    );
  });

  return (
    <ThemeContext.Extend value={theme}>
      <Modal a11yTitle="edit tests group" closeModal={closeModal}>
        <Box pad="medium" overflow={{ vertical: "auto" }}>
          <Box flex={false}>
            <Header
              closeModal={closeModal}
              label={copy.editTestsGroup(tests.length)}
            />
            <Text
              color="gray9"
              margin={{ bottom: "medium", top: "xxsmall" }}
              size="component"
            >
              {copy.addToGroupDetail}
            </Text>
            <ListItem
              group={null}
              isChecked={groupId === ""}
              onClick={setGroupId}
            />
            {optionsHtml}
            <Divider />
            <Buttons
              onPrimaryClick={handleClick}
              onSecondaryClick={closeModal}
              primaryIsDisabled={loading}
              primaryLabel={copy.addToGroup}
              secondaryLabel={copy.cancel}
            />
          </Box>
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
