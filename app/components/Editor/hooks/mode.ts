import { useRouter } from "next/router";

export type Mode = "run" | "test";

export const useMode = (): Mode => {
  const {
    query: { run_id },
  } = useRouter();

  if (run_id) return "run";

  return "test";
};
