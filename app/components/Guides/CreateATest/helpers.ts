import { isServer } from "../../../lib/detection";
import { colors, edgeSize } from "../../../theme/theme";

export const getUserId = (): string => {
  return isServer() ? "" : localStorage.getItem("userId");
};

export const iconProps = {
  color: colors.gray9,
  size: edgeSize.xxlarge,
};

export const textProps = {
  color: "gray9",
  size: "medium" as const,
  weight: "normal" as const,
};
