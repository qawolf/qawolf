import * as EmailValidator from "email-validator";
import { useContext, useEffect, useState } from "react";

import { useSendLoginCode } from "../../hooks/mutations";
import { AuthMode } from "../../lib/types";
import { copy } from "../../theme/copy";
import { StateContext } from "../StateContext";
import EmailForm from "./EmailForm";

type Props = { mode: AuthMode };

export default function Email({ mode }: Props): JSX.Element {
  const { signUp } = useContext(StateContext);
  const [errorMessage, setErrorMessage] = useState("");

  const [sendLoginCode, { error, loading }] = useSendLoginCode();

  // set error message if needed
  useEffect(() => {
    if (error) setErrorMessage(error.message);
  }, [error]);

  const handleSubmit = (email: string) => {
    setErrorMessage("");

    if (!email || !EmailValidator.validate(email)) {
      setErrorMessage(copy.noEmail);
      return;
    }

    sendLoginCode({
      variables: { email, invite_id: signUp.inviteId },
    });
  };

  return (
    <EmailForm
      disabled={loading}
      error={errorMessage}
      mode={mode}
      onSubmit={handleSubmit}
    />
  );
}
