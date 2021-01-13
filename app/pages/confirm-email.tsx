import { Box, Image } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import CodeError from "../components/ConfirmEmail/CodeError";
import CodeInput from "../components/ConfirmEmail/CodeInput";
import Text from "../components/shared/Text";
import { StateContext } from "../components/StateContext";
import { UserContext } from "../components/UserContext";
import { useSignInWithEmail } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";
import { edgeSize } from "../theme/theme";

export default function ConfirmEmail(): JSX.Element {
  const { email, signUp } = useContext(StateContext);
  const { user } = useContext(UserContext);
  const { replace } = useRouter();

  const [signInWithEmail, { called, error, loading }] = useSignInWithEmail({
    signUp,
  });

  // redirect from this page if the user is already logged in
  useEffect(() => {
    if (user && !called) {
      replace(routes.tests);
    }
  }, [called, replace, user]);

  const handleSubmit = (login_code: string) => {
    if (loading) return;
    signInWithEmail({ variables: { email: email || "", login_code } });
  };

  return (
    <Box align="center" margin={{ horizontal: "medium", top: "xxlarge" }}>
      <Image src="logo192.png" width={edgeSize.xxlarge} />
      <Text
        color="black"
        margin={{ vertical: "medium" }}
        size="xlarge"
        textAlign="center"
        weight="bold"
      >
        {copy.checkEmail}
      </Text>
      <Text color="black" size="large" textAlign="center">
        {copy.loginCodeSent}
        <b>{email}</b>:
      </Text>
      <CodeInput error={error?.message} onSubmit={handleSubmit} />
      <CodeError error={error?.message} />
    </Box>
  );
}
