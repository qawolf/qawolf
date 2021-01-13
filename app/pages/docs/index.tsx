import { useRouter } from "next/router";
import { useEffect } from "react";

import { routes } from "../../lib/routes";

export default function Docs(): JSX.Element {
  const { replace } = useRouter();

  useEffect(() => {
    replace(`${routes.docs}/what-is-qa-wolf`);
  }, [replace]);

  return null;
}
