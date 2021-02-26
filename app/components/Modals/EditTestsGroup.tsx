import { Box, RadioButtonGroup, ThemeContext } from "grommet";
import { ChangeEvent, useContext, useState } from "react";

import { useUpdateTestsGroup } from "../../hooks/mutations";
import { useGroups } from "../../hooks/queries";
import { SelectedTest } from "../../lib/types";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import Modal from "../shared-new/Modal";
import Buttons from "../shared-new/Modal/Buttons";
import Header from "../shared-new/Modal/Header";
import Text from "../shared-new/Text";
import { StateContext } from "../StateContext";

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

  const handleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    setGroupId(e.target.value);
  };

  const handleClick = (): void => {
    updateTestsGroup({
      variables: {
        group_id: groupId || null,
        test_ids: tests.map((t) => t.id),
      },
    }).then(closeModal);
  };

  const testNames = tests.map((test) => test.name).join(", ");
  const options = (groups || []).map((g) => {
    return { label: g.name, value: g.id };
  });

  return (
    <ThemeContext.Extend value={theme}>
      <Modal a11yTitle="edit tests group" closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.editTestsGroup} />
          <Text color="gray9" margin={{ top: "xxsmall" }} size="component">
            {copy.assignToGroupDetail}
          </Text>
          <Text
            color="gray9"
            margin={{ vertical: "medium" }}
            size="componentBold"
          >
            {testNames}
          </Text>
          <RadioButtonGroup
            name="group"
            onChange={handleChange}
            options={[...options, { label: copy.none, value: "" }]}
            value={groupId}
          />
          <Buttons
            onPrimaryClick={handleClick}
            onSecondaryClick={closeModal}
            primaryIsDisabled={loading}
            primaryLabel={copy.assignToGroup}
            secondaryLabel={copy.cancel}
          />
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
