/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect } from "react";

const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

export const useAlgoliaDocSearch = (): void => {
  const { push } = useRouter();

  // https://docsearch.algolia.com/docs/behavior#handleselected
  const handleSelected = (
    _: Record<string, unknown>,
    __: Record<string, unknown>,
    suggestion: { url: string }
  ): void => {
    const url = new URL(suggestion.url);
    push(url.pathname);
  };

  useEffect(() => {
    if (!algoliaApiKey || !(window as any).docsearch) return;

    (window as any).docsearch({
      apiKey: algoliaApiKey,
      handleSelected,
      indexName: "qawolf",
      inputSelector: "#algolia-search",
    });
  }, []);
};
