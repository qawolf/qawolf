import { useRouter } from "next/router";
import { useContext } from "react";

import { StateContext } from "../components/StateContext";
import { useCreateStripePortalSession } from "./mutations";

type UseOnStripePortal = {
  isLoading: boolean;
  onClick: () => void;
};

export const useOnStripePortal = (): UseOnStripePortal => {
  const { pathname } = useRouter();
  const { teamId } = useContext(StateContext);

  const [
    createStripePortalSession,
    { loading },
  ] = useCreateStripePortalSession();

  const handleClick = (): void => {
    createStripePortalSession({
      variables: {
        app_url: window.location.origin,
        return_uri: pathname,
        team_id: teamId,
      },
    }).then(({ data }) => {
      if (!data?.createStripePortalSession) return;

      window.location.href = data.createStripePortalSession;
    });
  };

  return { isLoading: loading, onClick: handleClick };
};
