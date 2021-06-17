import { useRouter } from "next/router";
import { useMemo } from "react";

import { noTagName } from "../components/Dashboard/helpers";
import { TagFilter } from "../lib/types";

type UseTagQuery = {
  filter: TagFilter;
  formattedTagNames: string | null;
  tagNames: string[];
};

export const useTagQuery = (): UseTagQuery => {
  const { query } = useRouter();

  const { filter, tagNames } = useMemo(() => {
    const filter = query.filter === "all" ? "all" : "any";
    const tagNames = query.tags ? (query.tags as string).split(",") : [];

    return { filter: filter as TagFilter, tagNames };
  }, [query]);

  const filteredTagNames = tagNames.filter((n) => n !== noTagName);

  return {
    filter,
    formattedTagNames: filteredTagNames.join(", ") || null,
    tagNames,
  };
};
