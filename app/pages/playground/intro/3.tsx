import { BsArrowUpLeft } from "react-icons/bs";

import ClickButton from "../../../components/Playground/Intro/ClickButton";
import {
  iconProps,
  textProps,
} from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import NextButton from "../../../components/Playground/Intro/NextButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 3;

export default function Intro3(): JSX.Element {
  return (
    <Layout step={step}>
      <BsArrowUpLeft {...iconProps} />
      <Text {...textProps}>{copy.toggleCreateCode}</Text>
      <ClickButton />
      <Text {...textProps}>{copy.toggleCreateCode2}</Text>
      <Text {...textProps} margin={{ top: "medium" }}>
        {copy.toggleCreateCode3}
      </Text>
      <NextButton step={step} />
    </Layout>
  );
}
