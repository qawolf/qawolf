import { useContext } from "react";

import { useUpdateUser } from "../../hooks/mutations";
import { UserContext } from "../UserContext";
import { RunnerContext } from "./contexts/RunnerContext";
import { Mode } from "./hooks/mode";
import Instructions from "./Instructions";
import WolfIntro from "./WolfIntro";

type Props = {
  mode: Mode;
};

export default function Modals({ mode }: Props): JSX.Element {
  const { isUserLoading, user, wolf } = useContext(UserContext);
  const { isCreateTestLoading } = useContext(RunnerContext);

  const [updateUser] = useUpdateUser();

  if (isCreateTestLoading || isUserLoading) return null;

  const onboardUser = () => {
    if (!user) return;

    const onboarded_at = new Date().toISOString();
    updateUser({ variables: { onboarded_at } });
  };

  // we return null if user still loading above, so user is loaded at this point
  if (mode === "create" && !user?.onboarded_at) {
    return <WolfIntro onboardUser={onboardUser} wolf={wolf} />;
  }

  if (mode === "create") return <Instructions wolf={wolf} />;

  return null;
}
