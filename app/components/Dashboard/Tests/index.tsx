import { Box } from "grommet";
import { useEffect, useState } from "react";

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
  const testIds = testsData.map((t) => t.id);

  const { data: tagsData, loading: tagsLoading } = useTagsForTests({
    test_ids: testIds,
  });
  const testTags = tagsData?.tagsForTests || [];

  const tests = filterTests({
    filter,
    search,
    tagNames,
    tests: loading ? null : testsData,
    testTags: tagsLoading ? null : testTags,
  });

  // clear checked tests when filters change
  useEffect(() => {
    setCheckedTestIds([]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter, tagNames, testIds.join(",")]);

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
