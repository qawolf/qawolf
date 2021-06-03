import { Box, Image } from "grommet";

import { edgeSize } from "../../../theme/theme";
import DefaultAvatar from "./DefaultAvatar";

type Props = {
  avatarUrl?: string | null;
  wolfColor: string;
  size?: string;
};

export default function Avatar({
  avatarUrl,
  wolfColor,
  size,
}: Props): JSX.Element {
  const finalSize = size || edgeSize.medium;
  const avatarSize = size ? `calc(${size} - 8px)` : null;

  return (
    <Box
      flex={false}
      height={finalSize}
      overflow="hidden"
      round="full"
      width={finalSize}
    >
      {avatarUrl ? (
        <Image fit="contain" src={avatarUrl} />
      ) : (
        <DefaultAvatar color={wolfColor} size={avatarSize} />
      )}
    </Box>
  );
}
