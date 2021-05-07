import { Box } from "grommet";
import isEqual from "lodash/isEqual";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

import { useTagsForTests } from "../../../hooks/queries";
import { useTests } from "../../../hooks/tests";
import { filterTests } from "../helpers";
import Header from "./Header";
import List from "./List";

type Props = {
  branch: string | null;
  teamId: string;
};

export default function Tests({ branch, teamId }: Props): JSX.Element {
  const { query } = useRouter();

  const tagIds = query.tags ? (query.tags as string).split(",") : [];
  const tagIdsRef = useRef<string[]>(tagIds);

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const { data: tagsData } = useTagsForTests({
    test_ids: testsData.map((t) => t.id),
  });
  const testTags = tagsData?.tagsForTests || [];

  const tests = filterTests({
    search,
    tagIds,
    tests: loading ? null : testsData,
    testTags: tagsData?.tagsForTests || null,
  });

  // clear checked tests when selected tags change
  useEffect(() => {
    if (!isEqual(tagIdsRef.current, tagIds)) {
      tagIdsRef.current = tagIds;
      setCheckedTestIds([]);
    }
  }, [tagIds]);

  const testIds = testsData.map((t) => t.id);

  return (
    <Box width="full">
      <Header search={search} setSearch={setSearch} tagIds={tagIds} />
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
