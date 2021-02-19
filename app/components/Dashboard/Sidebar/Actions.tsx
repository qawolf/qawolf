import { Box } from "grommet";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import Book from "../../shared-new/icons/Book";
import Configure from "../../shared-new/icons/Configure";
import DotCircle from "../../shared-new/icons/DotCircle";
import Gear from "../../shared-new/icons/Gear";
import List from "../../shared-new/icons/List";
import Share from "../../shared-new/icons/Share";
import DashboardLink from "./DashboardLink";

type Props = { teamId: string };

export default function Actions({ teamId }: Props): JSX.Element {
  const handleEnvironmentsClick = (): void => {
    state.setModal({ name: "environments" });
  };

  const handleSettingsClick = (): void => {
    state.setModal({ name: "teamSettings", teamId });
  };

  return (
    <Box gap={borderSize.small} margin={{ top: "medium" }}>
      <DashboardLink
        IconComponent={List}
        href={routes.tests}
        isSelected
        label={copy.allTests}
      />
      <DashboardLink
        IconComponent={DotCircle}
        href={routes.tests}
        isSelected={false}
        label={copy.runHistory}
      />
      <DashboardLink
        IconComponent={Configure}
        label={copy.environments}
        onClick={handleEnvironmentsClick}
      />
      <DashboardLink
        IconComponent={Gear}
        isSelected={false}
        label={copy.settings}
        onClick={handleSettingsClick}
      />
      <DashboardLink
        IconComponent={Book}
        SecondaryIconComponent={Share}
        href={routes.docs}
        label={copy.docs}
        openNewPage
      />
    </Box>
  );
}
