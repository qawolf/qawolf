import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import Spinner from "../components/shared/Spinner";
import { StateContext } from "../components/StateContext";
import { useSignInWithGitHub } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { edgeSize } from "../theme/theme-new";

export default function GitHub(): JSX.Element {
  const {
    asPath,
    query: { code, state },
    replace,
  } = useRouter();

  const { signUp } = useContext(StateContext);

  const [signInWithGitHub, { called, error }] = useSignInWithGitHub(
    {
      github_code: (code || "") as string,
      github_state: (state || "") as string,
    },
    { signUp }
  );

  // should not be on this page if no code or state
  useEffect(() => {
    // need to check asPath because Next.js router does not hydrate query on first render
    // https://stackoverflow.com/a/61043260
    const hasCode = asPath.includes("code=");
    const hasState = asPath.includes("state=");

    if (error || !hasCode || !hasState) {
      replace(routes.home);
    }
  }, [asPath, code, error, replace, state]);

  // sign in with GitHub
  useEffect(() => {
    if (!called && code && state) {
      signInWithGitHub();
    }
  }, [called, code, signInWithGitHub, state]);

  return <Spinner margin={{ top: edgeSize.xxxlarge }} />;
}
