import { Box } from "grommet";
import { useRouter } from "next/router";

import { routes } from "../../../lib/routes";
import { state } from "../../../lib/state";
import { copy } from "../../../theme/copy";
import { borderSize } from "../../../theme/theme-new";
import Book from "../../shared-new/icons/Book";
import Configure from "../../shared-new/icons/Configure";
import DotCircle from "../../shared-new/icons/DotCircle";
import Gear from "../../shared-new/icons/Gear";
import Lightning from "../../shared-new/icons/Lightning";
import List from "../../shared-new/icons/List";
import Share from "../../shared-new/icons/Share";
import DashboardLink from "./DashboardLink";

type Props = { teamId: string };

export default function Actions({ teamId }: Props): JSX.Element {
  const { pathname } = useRouter();

  const handleEnvironmentsClick = (): void => {
    state.setModal({ name: "environments" });
  };

  const handleSettingsClick = (): void => {
    state.setModal({ name: "teamSettings", teamId });
  };

  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds: [] });
  };

  return (
    <Box gap={borderSize.small} margin={{ top: "medium" }}>
      <DashboardLink
        IconComponent={List}
        href={routes.tests}
        isSelected={pathname.includes(routes.tests)}
        label={copy.allTests}
      />
      <DashboardLink
        IconComponent={DotCircle}
        href={routes.suites}
        isSelected={pathname.includes(routes.suites)}
        label={copy.runHistory}
      />
      <DashboardLink
        IconComponent={Configure}
        label={copy.environments}
        onClick={handleEnvironmentsClick}
      />
      <DashboardLink
        IconComponent={Lightning}
        label={copy.triggers}
        onClick={handleTriggersClick}
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
