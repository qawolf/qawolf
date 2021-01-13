import { Box, CheckBox } from "grommet";
import { Add } from "grommet-icons";
import { useRouter } from "next/router";
import { Dispatch, SetStateAction } from "react";

import { routes } from "../../../../lib/routes";
import { Group, GroupTests, SelectedTest } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import IconButton from "../../../shared/IconButton";
import AssignGroups from "./AssignGroups";
import DeleteTests from "./DeleteTests";
import styles from "./List.module.css";
import SearchInput from "./SearchInput";

type Props = {
  groups: Group[];
  groupTests: GroupTests;
  isChecked: boolean;
  onCheck: () => void;
  search: string;
  selectedTests: SelectedTest[];
  setSearch: Dispatch<SetStateAction<string>>;
};

export default function Actions({
  groups,
  groupTests,
  isChecked,
  onCheck,
  search,
  selectedTests,
  setSearch,
}: Props): JSX.Element {
  const { push } = useRouter();

  const handleClick = () => {
    push(routes.create);
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
        <AssignGroups
          groups={groups}
          groupTests={groupTests}
          selectedTests={selectedTests}
        />
      </Box>
      <SearchInput search={search} setSearch={setSearch} />
    </Box>
  );
}
