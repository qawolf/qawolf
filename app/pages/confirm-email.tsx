import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";

import CodeError from "../components/ConfirmEmail/CodeError";
import CodeInput from "../components/ConfirmEmail/CodeInput";
import Logo from "../components/shared-new/icons/Logo";
import Text from "../components/shared-new/Text";
import { StateContext } from "../components/StateContext";
import { UserContext } from "../components/UserContext";
import { useSignInWithEmail } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";
import { edgeSize, theme } from "../theme/theme-new";

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
    <ThemeContext.Extend value={theme}>
      <Box align='center' background='white' justify='center' overflow={{ vertical: 'auto' }} style={{ minHeight: '100vh' }}>
        <Logo width={edgeSize.xxxlarge} />
        <Text
          color="textDark"
          margin={{ bottom: 'xxsmall', top: "large" }}
          size="medium"
          weight="bold"
        >
          {copy.checkEmail}
        </Text>
        <Box align='center' direction='row'>
          <Text color="textLight" size="xsmall" weight='normal'>
            {copy.loginCodeSent}
          </Text>
          <Text color="textDark" margin={{left: 'xxxsmall'}} size="xsmall" weight='medium'>
            {email}
          </Text>
        </Box>
        {/* <CodeInput error={error?.message} onSubmit={handleSubmit} />
      <CodeError error={error?.message} /> */}
      </Box>
    </ThemeContext.Extend>
  );
}
