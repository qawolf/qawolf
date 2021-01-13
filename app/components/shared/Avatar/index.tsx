import { Box, Image } from "grommet";

import { edgeSize } from "../../../theme/theme";
import DefaultAvatar from "./DefaultAvatar";

type Props = {
  avatarUrl?: string | null;
  wolfVariant: string;
};

export default function Avatar({ avatarUrl, wolfVariant }: Props): JSX.Element {
  return (
    <Box
      height={edgeSize.large}
      overflow="hidden"
      round="full"
      width={edgeSize.large}
    >
      {avatarUrl ? (
        <Image fit="contain" src={avatarUrl} />
      ) : (
        <DefaultAvatar wolfVariant={wolfVariant} />
      )}
    </Box>
  );
}
