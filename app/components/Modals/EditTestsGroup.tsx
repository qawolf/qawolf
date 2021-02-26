import { Box, ThemeContext } from "grommet";
import { useContext } from "react";

import { useGroups } from "../../hooks/queries";
import { SelectedTest } from "../../lib/types";
import { copy } from "../../theme/copy";
import { theme } from "../../theme/theme-new";
import Modal from "../shared-new/Modal";
import Header from "../shared-new/Modal/Header";
import { StateContext } from "../StateContext";

type Props = {
  closeModal: () => void;
  tests: SelectedTest[];
};

export default function EditTestsGroup({
  closeModal,
  tests,
}: Props): JSX.Element {
  const { teamId } = useContext(StateContext);
  const { data } = useGroups({ team_id: teamId });

  console.log("DATA", data);

  return (
    <ThemeContext.Extend value={theme}>
      <Modal a11yTitle="edit tests group" closeModal={closeModal}>
        <Box pad="medium">
          <Header closeModal={closeModal} label={copy.editTestsGroup} />
        </Box>
      </Modal>
    </ThemeContext.Extend>
  );
}
