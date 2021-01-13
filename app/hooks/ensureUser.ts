import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import { UserContext } from "../components/UserContext";
import { routes } from "../lib/routes";
import { state } from "../lib/state";

export const useEnsureUser = (): void => {
  const { asPath, replace } = useRouter();
  const { isUserLoading, user } = useContext(UserContext);

  const shouldRedirect = !isUserLoading && !user;

  useEffect(() => {
    if (shouldRedirect) {
      state.setSignUp({ redirectUri: asPath });
      replace(routes.home);
    }
  }, [asPath, replace, shouldRedirect]);
};
