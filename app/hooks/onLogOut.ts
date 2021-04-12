import { useRouter } from "next/router";

import { JWT_KEY } from "../lib/client";
import { routes } from "../lib/routes";
import { state } from "../lib/state";
import { resetIntercom } from "./intercom";

export const useLogOut = (): (() => void) => {
  const { replace } = useRouter();

  const handleLogOut = (): void => {
    localStorage.removeItem(JWT_KEY);
    state.clear();
    resetIntercom();

    replace(routes.home);
  };

  return handleLogOut;
};
