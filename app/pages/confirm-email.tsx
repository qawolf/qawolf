import { Box, ThemeContext } from "grommet";
import { useRouter } from "next/router";
import { useContext, useEffect } from "react";
import styled from "styled-components";

import CodeError from "../components/ConfirmEmail/CodeError";
import CodeInput from "../components/ConfirmEmail/CodeInput";
import Logo from "../components/shared-new/icons/Logo";
import Text from "../components/shared-new/Text";
import { StateContext } from "../components/StateContext";
import { UserContext } from "../components/UserContext";
import { useSignInWithEmail } from "../hooks/mutations";
import { routes } from "../lib/routes";
import { copy } from "../theme/copy";
import { breakpoints, edgeSize, theme } from "../theme/theme-new";

const StyledBox = styled(Box)`
  flex-direction: column;

  @media screen and (min-width: ${breakpoints.small.value}px) {
    flex-direction: row;
  }
`;

const StyledText = styled(Text)`
  @media screen and (min-width: ${breakpoints.small.value}px) {
    margin-left: ${edgeSize.xxxsmall};
  }
`;

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

  // focus first input
  useEffect(() => {
    document.getElementById("0-code")?.focus();
  }, []);

  const handleSubmit = (login_code: string) => {
    if (loading) return;
    signInWithEmail({ variables: { email: email || "", login_code } });
  };

  return (
    <ThemeContext.Extend value={theme}>
      <Box
        align="center"
        background="white"
        justify="center"
        overflow={{ vertical: "auto" }}
        style={{ minHeight: "100vh" }}
      >
        <Logo width={edgeSize.xxxlarge} />
        <Text
          color="textDark"
          margin={{ bottom: "xxsmall", top: "large" }}
          size="medium"
          weight="bold"
        >
          {copy.checkEmail}
        </Text>
        <StyledBox align="center">
          <Text color="textLight" size="xsmall" weight="normal">
            {copy.loginCodeSent}
          </Text>
          <StyledText color="textDark" size="xsmall" weight="medium">
            {email}
          </StyledText>
        </StyledBox>
        <CodeInput error={error?.message} onSubmit={handleSubmit} />
        <CodeError error={error?.message} />
      </Box>
    </ThemeContext.Extend>
  );
}
