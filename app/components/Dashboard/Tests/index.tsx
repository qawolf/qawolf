import { Box } from "grommet";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";

import { useTagsForTests } from "../../../hooks/queries";
import { useTests } from "../../../hooks/tests";
import { TagFilter } from "../../../lib/types";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  branch: string | null;
  teamId: string;
};

export default function Tests({ branch, teamId }: Props): JSX.Element {
  const { query } = useRouter();

  const { filter, tagIds } = useMemo(() => {
    const filter = query.filter === "all" ? "all" : "any";
    const tagIds = query.tags ? (query.tags as string).split(",") : [];

    return { filter: filter as TagFilter, tagIds };
  }, [query]);

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const { data: tagsData } = useTagsForTests({
    test_ids: testsData.map((t) => t.id),
  });
  const testTags = tagsData?.tagsForTests || [];

  const tests = filterTests({
    filter,
    search,
    tagIds,
    tests: loading ? null : testsData,
    testTags: tagsData?.tagsForTests || null,
  });

  // clear checked tests when selected tags change
  useEffect(() => {
    setCheckedTestIds([]);
  }, [filter, tagIds]);

  const testIds = testsData.map((t) => t.id);

  return (
    <Box width="full">
      <Header
        filter={filter}
        search={search}
        setSearch={setSearch}
        tagIds={tagIds}
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
