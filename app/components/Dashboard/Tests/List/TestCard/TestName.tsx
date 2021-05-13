import { overflowStyle } from "../../../../../theme/theme";
import Text from "../../../../shared/Text";

type Props = {
  testName: string;
};

export default function TestName({ testName }: Props): JSX.Element {
  return (
    <Text
      color="gray9"
      margin={{ left: "small" }}
      size="componentMedium"
      style={overflowStyle}
    >
      {testName}
    </Text>
  );
}
