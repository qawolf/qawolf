import { Box, Image } from "grommet";

import { edgeSize } from "../../../theme/theme-new";
import DefaultAvatar from "./DefaultAvatar";

type Props = {
  avatarUrl?: string | null;
  wolfColor: string;
};

export default function Avatar({ avatarUrl, wolfColor }: Props): JSX.Element {
  return (
    <Box
      flex={false}
      height={edgeSize.medium}
      overflow="hidden"
      round="full"
      width={edgeSize.medium}
    >
      {avatarUrl ? (
        <Image fit="contain" src={avatarUrl} />
      ) : (
        <DefaultAvatar color={wolfColor} />
      )}
    </Box>
  );
}
