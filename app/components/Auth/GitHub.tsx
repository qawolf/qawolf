import { Github } from "grommet-icons";
import { useRef } from "react";

import { useCreateSignInUrl } from "../../hooks/mutations";
import { routes } from "../../lib/routes";
import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import Button from "../shared/Button";

type Props = { mode: AuthMode };

export default function GitHub({ mode }: Props): JSX.Element {
  const isRedirectingRef = useRef(false);

  const [createSignInUrl, { data, loading }] = useCreateSignInUrl({
    redirect_uri: routes.gitHub,
  });

  // if received sign in URL go there
  if (data && data.createSignInUrl) {
    isRedirectingRef.current = true;
    window.location.href = data.createSignInUrl;
  }

  const message =
    mode === "signUp" ? copy.signUpWithGitHub : copy.logInWithGitHub;

  return (
    <Button
      IconComponent={Github}
      disabled={loading}
      fill
      label={message}
      onClick={createSignInUrl}
      size="medium"
      type="outlineDark"
    />
  );
}
