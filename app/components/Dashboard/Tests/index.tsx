import { Box } from "grommet";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

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
  const trigger_id = query.trigger_id as string;

  const [search, setSearch] = useState("");
  const [checkedTestIds, setCheckedTestIds] = useState<string[]>([]);

  const { tests: testsData, loading } = useTests({ branch, teamId });

  const { data: tagsData } = useTagsForTests({
    test_ids: testsData.map((t) => t.id),
  });
  const testTags = tagsData?.tagsForTests || [];

  const tests = filterTests({
    search,
    tests: loading ? null : testsData,
    // testTriggers: testTriggersData?.testTriggers,
    trigger_id,
  });

  // clear checked tests when selected trigger changes
  useEffect(() => {
    setCheckedTestIds([]);
  }, [trigger_id]);

  // clear checked tests when list changes
  // TODO: revisit
  useEffect(() => {
    setCheckedTestIds([]);
  }, [testsData]);

  const testIds = testsData.map((t) => t.id);

  return (
    <Box width="full">
      <Header search={search} setSearch={setSearch} />
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
