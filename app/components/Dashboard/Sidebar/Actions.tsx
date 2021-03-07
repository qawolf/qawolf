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

export default function Actions(): JSX.Element {
  const { pathname, query } = useRouter();

  const handleEnvironmentsClick = (): void => {
    state.setModal({ name: "environments" });
  };

  const handleTriggersClick = (): void => {
    state.setModal({ name: "triggers", testIds: [] });
  };

  return (
    <Box gap={borderSize.small} margin={{ top: "medium" }}>
      <DashboardLink
        IconComponent={List}
        href={routes.tests}
        isSelected={pathname.includes(routes.tests) && !query.group_id}
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
        href={routes.settings}
        isSelected={pathname.includes(routes.settings)}
        label={copy.teamSettings}
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
