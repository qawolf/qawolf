import { useTestHistory } from "../../../hooks/queries";
import Menu from "../../shared-new/Menu";

type Props = {
  onClose: () => void;
  testId: string | null;
};

const width = "160px";

export default function RunList({ onClose, testId }: Props): JSX.Element {
  const { data } = useTestHistory({ id: testId });

  console.log("DATA", data);

  return (
    <Menu direction="down" onClick={onClose} width={width}>
      <h1>hey</h1>
    </Menu>
  );
}
