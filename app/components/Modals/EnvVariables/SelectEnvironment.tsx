import { state } from "../../../lib/state";
import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Select from "../../shared-new/Select";
import Option from "../../shared-new/Select/Option";
import Text from "../../shared-new/Text";

type Props = {
  environments: Environment[];
  onOptionClick: (environmentId: string) => void;
  selectedEnvironmentId: string;
};

export default function SelectEnvironment({
  environments,
  onOptionClick,
  selectedEnvironmentId,
}: Props): JSX.Element {
  const selectedEnvironment = environments.find(
    (e) => e.id === selectedEnvironmentId
  );

  const optionsHtml = environments.map((e) => {
    return (
      <Option
        isSelected={e.id === selectedEnvironmentId}
        key={e.id}
        label={e.name}
        onClick={() => onOptionClick(e.id)}
      />
    );
  });

  const openEnvironmentsModal = (): void =>
    state.setModal({ name: "environments" });

  return (
    <>
      <Text
        color="gray9"
        margin={{ bottom: "xxsmall", top: "large" }}
        size="componentBold"
      >
        {copy.environment}
      </Text>
      <Select label={selectedEnvironment?.name || copy.loading}>
        {optionsHtml}
      </Select>
    </>
  );
}
