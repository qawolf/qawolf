import { Box } from "grommet";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme-new";
import { borderSize } from "../../../theme/theme-new";
import Browser from "../../shared-new/icons/Browser";
import Video from "../../shared-new/icons/Video";
import Text from "../../shared-new/Text";

type Props = { hasVideo: boolean };

export default function Header({ hasVideo }: Props): JSX.Element {
  const IconComponent = hasVideo ? Video : Browser;

  return (
    <Box
      align="center"
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      pad="small"
    >
      <Box align="center" direction="row">
        <IconComponent color={colors.gray9} size={edgeSize.small} />
        <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
          {hasVideo ? copy.video : copy.browser}
        </Text>
      </Box>
    </Box>
  );
}
