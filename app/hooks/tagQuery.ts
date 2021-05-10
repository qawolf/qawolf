import { useRouter } from "next/router";
import { useMemo } from "react";

import { TagFilter } from "../lib/types";

type UseTagQuery = {
  filter: TagFilter;
  tagIds: string[];
};

export const useTagQuery = (): UseTagQuery => {
  const { query } = useRouter();

  const { filter, tagIds } = useMemo(() => {
    const filter = query.filter === "all" ? "all" : "any";
    const tagIds = query.tags ? (query.tags as string).split(",") : [];

    return { filter: filter as TagFilter, tagIds };
  }, [query]);

  return { filter, tagIds };
};
