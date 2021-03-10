import { BsArrowReturnLeft } from "react-icons/bs";

import { textProps } from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";
import { colors, edgeSize } from "../../../theme/theme";

export default function Intro2(): JSX.Element {
  return (
    <Layout>
      <Text {...textProps}>{copy.runTestIntro}</Text>
      <BsArrowReturnLeft color={colors.gray9} size={edgeSize.xxlarge} />
      <Text {...textProps} margin={{ top: "medium" }}>
        {copy.runTestIntro2} <code>⌘</code> / <code>Ctrl</code> +{" "}
        <code>Enter</code>.
      </Text>
    </Layout>
  );
}
