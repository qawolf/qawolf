import { Box } from "grommet";
import { useContext, useEffect } from "react";
import { RiGitBranchLine } from "react-icons/ri";

import { useGitHubBranches } from "../../../../hooks/queries";
import { state } from "../../../../lib/state";
import { copy } from "../../../../theme/copy";
import { colors, edgeSize } from "../../../../theme/theme";
import Select from "../../../shared/Select";
import Option from "../../../shared/Select/Option";
import Text from "../../../shared/Text";
import { StateContext } from "../../../StateContext";

const width = "240px";

export default function Branches(): JSX.Element {
  const { branch, teamId } = useContext(StateContext);

  const { data } = useGitHubBranches({ team_id: teamId });
  const branches = data?.gitHubBranches || null;
  const selectedBranch = branches?.find((b) => b.name === branch);

  useEffect(() => {
    if (!branches?.length || selectedBranch) return;
    const defaultBranch = branches.find((b) => b.is_default);

    state.setBranch(defaultBranch?.name || branches[0].name);
  }, [branches, selectedBranch]);

  if (!branches) return null;

  const labelHtml = (
    <Box
      align="center"
      direction="row"
      margin={{ left: `-${edgeSize.xxxsmall}` }}
    >
      <RiGitBranchLine color={colors.gray9} size={edgeSize.small} />
      <Text color="gray9" margin={{ left: "xxsmall" }} size="component">
        {selectedBranch?.name || copy.gitHubBranchSelect}
      </Text>
    </Box>
  );

  const optionsHtml = branches.map(({ name }) => {
    const handleClick = (): void => state.setBranch(name);

    return (
      <Option
        isSelected={name === branch}
        key={name}
        label={name}
        onClick={handleClick}
      />
    );
  });

  return (
    <Box align="center" direction="row" margin={{ right: "small" }}>
      <Select label={labelHtml} width={width}>
        {optionsHtml}
      </Select>
    </Box>
  );
}
