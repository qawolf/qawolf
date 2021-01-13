import { RunStatus } from "./types";

type BackgroundForStatus = {
  background: string;
  borderColor: string;
};

export const getBackgroundForStatus = (
  status?: RunStatus | null
): BackgroundForStatus => {
  if (!status) return { background: "brand", borderColor: "#b3eded" };
  if (status === "created")
    return { background: "gray", borderColor: "borderGray" };
  if (status === "fail") return { background: "red", borderColor: "lightRed" };

  return { background: "green", borderColor: "lightGreen" };
};
