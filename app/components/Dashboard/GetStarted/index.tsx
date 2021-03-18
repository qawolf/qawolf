import { Box } from "grommet";
import { useContext, useEffect, useState } from "react";

import { useUpdateUser } from "../../../hooks/mutations";
import { useOnboarding } from "../../../hooks/queries";
import Spinner from "../../shared/Spinner";
import { UserContext } from "../../UserContext";
import Header from "./Header";
import { getOpenSection, Section as SectionType } from "./helpers";
import Sections from "./Sections";
import Welcome from "./Welcome";

type Props = { teamId: string };

const maxWidth = "800px";

export default function GetStarted({ teamId }: Props): JSX.Element {
  const { user, wolf } = useContext(UserContext);
  const [openSection, setOpenSection] = useState<SectionType | null>(null);

  const { data } = useOnboarding({ team_id: teamId });
  const onboarding = data?.onboarding || null;

  const [updateUser] = useUpdateUser();

  useEffect(() => {
    if (user && !user.onboarded_at) {
      updateUser({
        variables: { onboarded_at: new Date().toISOString() },
      });
    }
  }, [updateUser, user]);

  useEffect(() => {
    if (!onboarding) return;
    setOpenSection(getOpenSection(onboarding));
  }, [onboarding]);

  const completeCount = onboarding
    ? // filter that it equals true since typename is also included
      Object.values(onboarding).filter((v) => v === true).length
    : 0;

  const handleToggleOpen = (section: SectionType): void => {
    setOpenSection((prev) => {
      if (prev === section) return null;
      return section;
    });
  };

  const innerHtml = onboarding ? (
    <Box flex={false} pad={{ horizontal: "medium" }} style={{ maxWidth }}>
      <Welcome
        completeCount={completeCount}
        isOpen={!!openSection}
        wolfColor={wolf?.variant}
      />
      <Sections
        onToggleOpen={handleToggleOpen}
        onboarding={onboarding}
        openSection={openSection}
        teamId={teamId}
        userId={user?.id}
      />
    </Box>
  ) : (
    <Spinner />
  );

  return (
    <Box background="gray2" width="full">
      <Header />
      <Box
        align="center"
        overflow={{ vertical: "auto" }}
        pad={{ vertical: "medium" }}
        width="full"
      >
        {innerHtml}
      </Box>
    </Box>
  );
}
