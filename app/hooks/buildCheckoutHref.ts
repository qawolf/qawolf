import { useRouter } from "next/router";

import { routes } from "../lib/routes";

export const useBuildCheckoutHref = (): string => {
  const { pathname } = useRouter();

  return `${routes.checkout}?cancel_uri=${pathname}`;
};
