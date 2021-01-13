import { copy } from "../../../theme/copy";
import Text from "../../shared/Text";
import TextInput from "../../shared/TextInput";

type Props = {
  branches: string;
  hasError: boolean;
  isAllBranches: boolean;
  setBranches: (branches: string) => void;
};

export default function BranchesInput({
  branches,
  hasError,
  isAllBranches,
  setBranches,
}: Props): JSX.Element {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBranches(e.target.value);
  };

  if (isAllBranches) return null;

  return (
    <>
      <Text
        color="black"
        margin={{ bottom: "small", top: "large" }}
        size="small"
        weight="bold"
      >
        {copy.selectedBranchesInput}
      </Text>
      <TextInput
        hasError={hasError}
        onChange={handleChange}
        placeholder={copy.branchesPlaceholder}
        value={branches}
      />
    </>
  );
}
