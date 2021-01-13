import { useRouter } from "next/router";

export type Mode = "create" | "run" | "test";

export const useMode = (): Mode => {
  const { query } = useRouter();
  const { run_id, test_id } = query;

  // no param is the create modal (enter a url)
  let mode: Mode = "create";

  if (run_id) {
    mode = "run";
  } else if (test_id) {
    mode = "test";
  }

  return mode;
};
