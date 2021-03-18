import { Box } from "grommet";
import Image from "next/image";
import Confetti from "react-confetti";
import { BsArrowUpLeft } from "react-icons/bs";

import {
  iconProps,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import { getUserId } from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import Paw from "../../../components/shared/icons/Paw";
import WolfSitting from "../../../components/shared/icons/WolfSitting";
import Text from "../../../components/shared/Text";
import { useWolf } from "../../../hooks/queries";
import { useWindowSize } from "../../../hooks/windowSize";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";

const confettiColors = [
  colors.codeBlue,
  colors.codePink,
  colors.codePurple,
  colors.danger5,
  colors.darkYellow,
  colors.primary,
  colors.success5,
  colors.teal,
];
const wolfHeight = "174px";

export default function CreateATest5(): JSX.Element {
  const { height, width } = useWindowSize();

  const userId = getUserId();

  const { data } = useWolf({ user_id: userId });
  const wolf = data?.wolf || null;

  return (
    <>
      <Confetti colors={confettiColors} height={height} width={width} />
      <Layout>
        <Box alignSelf="center" height={wolfHeight}>
          {!!wolf && (
            <>
              <WolfSitting animate color={wolf.variant} />{" "}
              <Box align="center" direction="row">
                <Text {...textProps} margin={{ right: "xxsmall" }}>
                  {wolf.name}
                </Text>
                <Paw color={colors.gray9} size={edgeSize.medium} />
              </Box>
            </>
          )}
        </Box>
        <Text {...textProps} margin={{ vertical: "medium" }}>
          {copy.learnedBasics}
        </Text>
        <BsArrowUpLeft {...iconProps} />
        <Text {...textProps} margin={{ bottom: "medium" }}>
          {copy.learnedBasics2}
        </Text>
        <Box alignSelf="center">
          <Image height={45} src="/guides/dashboard.png" width={264} />
        </Box>
      </Layout>
    </>
  );
}
