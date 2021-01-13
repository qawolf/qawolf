import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../../components/shared/Spinner";
import { UserContext } from "../../components/UserContext";
import { useAcceptInvite } from "../../hooks/mutations";
import { routes } from "../../lib/routes";
import { state } from "../../lib/state";

export default function Invite(): JSX.Element {
  const [acceptInvite, { data, loading, error }] = useAcceptInvite();

  const { isUserLoading, user } = useContext(UserContext);

  const { push, replace, query } = useRouter();
  const inviteId = query.invite_id as string;

  const hasUser = !!(isUserLoading || user);

  // redirect to sign in if not signed in
  useEffect(() => {
    if (!inviteId || hasUser) return;

    state.setSignUp({ inviteId, redirectUri: `${routes.invite}/${inviteId}` });
    replace(routes.signUp);
  }, [hasUser, inviteId, replace]);

  // call mutation once user signed in
  useEffect(() => {
    if (data?.acceptInvite || !inviteId || loading || !user) return;

    acceptInvite({ variables: { id: inviteId } });
  }, [acceptInvite, data, inviteId, loading, user]);

  // redirect to dashboard once invite accepted
  useEffect(() => {
    if (data?.acceptInvite) {
      push(routes.tests);
    }
  }, [data, push]);

  // redirect if error
  useEffect(() => {
    if (error) {
      replace(routes.home);
    }
  }, [error, replace]);

  if (hasUser) {
    return <Spinner />;
  }

  return null;
}
