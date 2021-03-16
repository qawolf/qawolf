import { edgeSize } from "../../../../theme/theme";

export const labelProps = {
  color: "gray0",
  margin: { bottom: edgeSize.xxsmall },
  size: "componentBold" as const,
};

export const selectWidth = `calc(50% - ${edgeSize.small} /2)`;
