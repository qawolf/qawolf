import { useContext } from "react";

import { useUpdateUser } from "../../hooks/mutations";
import { UserContext } from "../UserContext";
import { RunnerContext } from "./contexts/RunnerContext";
import { Mode } from "./hooks/mode";
import Instructions from "./Instructions";

type Props = {
  mode: Mode;
};

export default function Modals({ mode }: Props): JSX.Element {
  const { isUserLoading, user, wolf } = useContext(UserContext);
  const { isCreateTestLoading } = useContext(RunnerContext);

  const [updateUser] = useUpdateUser();

  if (isCreateTestLoading || isUserLoading) return null;

  const onboardUser = () => {
    if (!user || user.onboarded_at) return;

    const onboarded_at = new Date().toISOString();
    updateUser({ variables: { onboarded_at } });
  };

  if (mode === "create") {
    return <Instructions onboardUser={onboardUser} wolf={wolf} />;
  }

  return null;
}
