import { Box } from "grommet";
import { useRouter } from "next/router";
import { BsArrowLeft } from "react-icons/bs";

import {
  iconProps,
  textProps,
} from "../../../components/Guides/CreateATest/helpers";
import Layout from "../../../components/Guides/CreateATest/Layout";
import NextButton from "../../../components/Guides/CreateATest/NextButton";
import WolfButton from "../../../components/shared/icons/WolfButton";
import Text from "../../../components/shared/Text";
import { useWolf } from "../../../hooks/queries";
import { copy } from "../../../theme/copy";

const wolfHeight = "152px";
const step = 2;

export default function CreateATest2(): JSX.Element {
  const { asPath } = useRouter();
  const userId = asPath.split("user_id=")[1] || "";

  const { data } = useWolf({ user_id: userId });
  const wolf = data?.wolf || null;

  return (
    <Layout step={step}>
      <Box>
        {!!wolf && <Text {...textProps}>{copy.runTestIntro(wolf.name)}</Text>}
        <Text {...textProps}>{copy.runTestIntro2}</Text>
      </Box>
      <BsArrowLeft {...iconProps} />
      <Text {...textProps} margin={{ vertical: "medium" }}>
        {copy.runTestIntro3} <code>⌘</code> / <code>Ctrl</code> +{" "}
        <code>Enter</code>.
      </Text>
      <Box alignSelf="center" height={wolfHeight}>
        {!!wolf && <WolfButton color={wolf.variant} />}
      </Box>
      <NextButton step={step} />
    </Layout>
  );
}
