import { Box } from "grommet";
import { useContext } from "react";
import { RiGitBranchLine } from "react-icons/ri";

import { useGitHubBranches } from "../../../../hooks/queries";
import { copy } from "../../../../theme/copy";
import { colors, edgeSize } from "../../../../theme/theme";
import Select from "../../../shared/Select";
import Option from "../../../shared/Select/Option";
import { StateContext } from "../../../StateContext";

const width = "180px";

export default function Branches(): JSX.Element {
  const { teamId } = useContext(StateContext);

  const { data } = useGitHubBranches({ team_id: teamId });
  const branches = data?.gitHubBranches || null;

  if (!branches) return null;

  const selectedBranch = branches.find((b) => b.is_default);

  const optionsHtml = branches.map(({ is_default, name }) => {
    return <Option isSelected={is_default} key={name} label={name} />;
  });

  return (
    <Box align="center" direction="row">
      <RiGitBranchLine
        color={colors.gray9}
        size={edgeSize.small}
        style={{ marginRight: edgeSize.xxsmall }}
      />
      <Select label={selectedBranch?.name || copy.gitHubBranch} width={width}>
        {optionsHtml}
      </Select>
    </Box>
  );
}
