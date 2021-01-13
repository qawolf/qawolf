import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import { PlatformType } from "./Platform";

type Props = { platform: PlatformType };

export default function Other({ platform }: Props): JSX.Element {
  return (
    <Text color="black" size="medium">
      {platform === "netlify" ? copy.netlifyDeploy : copy.otherDeploy}
    </Text>
  );
}
