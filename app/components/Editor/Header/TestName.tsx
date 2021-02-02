import { useContext } from "react";
import { TestContext } from "../contexts/TestContext";
import EditableText from "../../shared-new/EditableText";

export default function TestName(): JSX.Element {
  const { run, test } = useContext(TestContext);

  if (!test) return null;

  const handleChange = (name: string): void => {};

  return (
    <EditableText disabled={!!run} onChange={handleChange} value={test.name} />
  );
}
