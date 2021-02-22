import { ShortTest, TestTriggers } from "../../lib/types";

type FilterTests = {
  search: string;
  testTriggers?: TestTriggers[];
  tests?: ShortTest[];
  trigger_id?: string | null;
};

export const noTriggerId = "none";

export const filterTests = ({
  search,
  testTriggers,
  tests,
  trigger_id,
}: FilterTests): ShortTest[] | null => {
  if (!tests || (trigger_id && !testTriggers)) return null;

  let filteredTests = [...tests];

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  if (trigger_id === noTriggerId) {
    filteredTests = filteredTests.filter((test) => {
      const triggerIds =
        testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];

      return !triggerIds.length;
    });
  } else if (trigger_id) {
    filteredTests = filteredTests.filter((test) => {
      const triggerIds =
        testTriggers.find((t) => t.test_id === test.id)?.trigger_ids || [];

      return triggerIds.includes(trigger_id);
    });
  }

  return filteredTests;
};
