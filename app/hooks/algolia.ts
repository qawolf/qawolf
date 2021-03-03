/* eslint-disable @typescript-eslint/no-explicit-any */
import { useRouter } from "next/router";
import { useEffect } from "react";

const algoliaApiKey = process.env.NEXT_PUBLIC_ALGOLIA_API_KEY;

export const useAlgoliaDocSearch = (): void => {
  const { push } = useRouter();

  // https://docsearch.algolia.com/docs/behavior#handleselected
  const handleSelected = (
    input: { setVal: (value: string) => void },
    __: Record<string, unknown>,
    suggestion: { url: string }
  ): void => {
    input.setVal("");

    const url = new URL(suggestion.url);
    push(`${url.pathname}${url.hash}`);
  };

  useEffect(() => {
    if (!algoliaApiKey) return;

    const interval = setInterval((): void => {
      if (!(window as any).docsearch) return;

      (window as any).docsearch({
        apiKey: algoliaApiKey,
        handleSelected,
        indexName: "qawolf",
        inputSelector: "#algolia-search",
      });

      clearInterval(interval);
    }, 200);

    return () => clearInterval(interval);
  }, []);
};
