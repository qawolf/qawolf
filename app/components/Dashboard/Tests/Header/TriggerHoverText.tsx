import capitalize from "lodash/capitalize";

import { formatDate } from "../../../../lib/helpers";
import { Group } from "../../../../lib/types";
import { copy } from "../../../../theme/copy";
import { edgeSize, hoverTransition } from "../../../../theme/theme";
import Text from "../../../shared/Text";

type Props = {
  group: Group;
  loading: boolean;
};

const formatBranches = (branches: string): string => {
  return branches.split(",").join(", ");
};

const formatDeployment = ({
  deployment_branches,
  deployment_environment,
}: Group): string | null => {
  if (!deployment_branches && !deployment_environment) return null;

  const deployments = `${capitalize(
    deployment_environment || "all deployments"
  )}`;
  const branches = deployment_branches
    ? `${copy.branches}: ${formatBranches(deployment_branches)}`
    : copy.allBranches;

  return `${deployments} - ${branches}`;
};

export default function TriggerHoverText({
  group,
  loading,
}: Props): JSX.Element {
  const deployment = formatDeployment(group);

  const timestamp =
    !loading && group.next_at
      ? `${copy.next}: ${formatDate(group.next_at)}`
      : null;

  if (!deployment && !timestamp) return null;

  return (
    <Text
      as="p"
      color="gray"
      size="small"
      style={{
        left: 0,
        position: "absolute",
        top: `calc(${edgeSize.medium} + ${edgeSize.small})`,
        transition: hoverTransition,
        whiteSpace: "nowrap",
      }}
    >
      {deployment || timestamp}
    </Text>
  );
}
