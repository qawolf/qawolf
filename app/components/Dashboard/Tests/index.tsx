import { Box } from "grommet";
import { useEffect, useMemo, useState } from "react";

import { useTagsForTests } from "../../../hooks/queries";
import { useTagQuery } from "../../../hooks/tagQuery";
import { useTests } from "../../../hooks/tests";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  branch: string | null;
  teamId: string;
};

export default function Tests({ branch, teamId }: Props): JSX.Element {
  const { filter, tagNames } = useTagQuery();

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const testIds = useMemo(() => {
    return testsData.map((t) => t.id);
  }, [testsData]);

  const { data: tagsData } = useTagsForTests({
    test_ids: testsData.map((t) => t.id),
  });
  const testTags = tagsData?.tagsForTests || [];

  const tests = filterTests({
    filter,
    search,
    tagNames,
    tests: loading ? null : testsData,
    testTags: tagsData?.tagsForTests || null,
  });

  // clear checked tests when selected tags or test ids change
  useEffect(() => {
    setCheckedTestIds([]);
  }, [filter, tagNames, testIds]);

  return (
    <Box width="full">
      <Header
        filter={filter}
        search={search}
        setSearch={setSearch}
        tagNames={tagNames}
      />
      <List
        checkedTestIds={checkedTestIds}
        setCheckedTestIds={setCheckedTestIds}
        testIds={testIds}
        testTags={testTags}
        tests={tests}
      />
    </Box>
  );
}
