import { Box, CheckBox } from "grommet";
import { Add } from "grommet-icons";
import { Dispatch, SetStateAction } from "react";

import { state } from "../../../../lib/state";
import { SelectedTest, TestTriggers, Trigger } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import IconButton from "../../../shared/IconButton";
import AssignTriggers from "./AssignTriggers";
import DeleteTests from "./DeleteTests";
import styles from "./List.module.css";
import SearchInput from "./SearchInput";

type Props = {
  isChecked: boolean;
  onCheck: () => void;
  search: string;
  selectedTests: SelectedTest[];
  setSearch: Dispatch<SetStateAction<string>>;
  testTriggers: TestTriggers;
  triggers: Trigger[];
};

export default function Actions({
  isChecked,
  onCheck,
  search,
  selectedTests,
  setSearch,
  testTriggers,
  triggers,
}: Props): JSX.Element {
  const handleClick = () => {
    state.setModal({ name: "createTest" });
  };

  return (
    <Box
      align="center"
      direction="row"
      justify="between"
      margin={{ right: "large" }}
    >
      <Box align="center" direction="row">
        <CheckBox checked={isChecked} onClick={onCheck} />
        <IconButton
          IconComponent={Add}
          className={styles.createTest}
          color="fadedBlue"
          margin={{ left: "medium" }}
          message={copy.createTest}
          onClick={handleClick}
        />
        <DeleteTests selectedTests={selectedTests} />
        <AssignTriggers
          selectedTests={selectedTests}
          testTriggers={testTriggers}
          triggers={triggers}
        />
      </Box>
      <SearchInput search={search} setSearch={setSearch} />
    </Box>
  );
}
