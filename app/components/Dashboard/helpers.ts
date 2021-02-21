import { ShortTest } from "../../lib/types";

type FilterTests = {
  search: string;
  tests?: ShortTest[];
  trigger_id?: string | null;
};

export const filterTests = ({
  search,
  tests,
}: FilterTests): ShortTest[] | null => {
  if (!tests) return null;

  let filteredTests = [...tests];

  if (search) {
    filteredTests = filteredTests.filter((t) => {
      return t.name.toLowerCase().includes(search.toLowerCase());
    });
  }

  return filteredTests;
};
