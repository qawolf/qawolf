import { BsArrowReturnLeft } from "react-icons/bs";

import ClickButton from "../../../components/Playground/Intro/ClickButton";
import {
  iconProps,
  textProps,
} from "../../../components/Playground/Intro/helpers";
import Layout from "../../../components/Playground/Intro/Layout";
import NextButton from "../../../components/Playground/Intro/NextButton";
import Text from "../../../components/shared/Text";
import { copy } from "../../../theme/copy";

const step = 5;

export default function Intro5(): JSX.Element {
  return (
    <Layout step={step}>
      <Text {...textProps}>{copy.runSelectedCode}</Text>
      <BsArrowReturnLeft {...iconProps} />
      <ClickButton />
      <Text {...textProps}>{copy.runSelectedCode2}</Text>
      <NextButton isComplete step={step} />
    </Layout>
  );
}
