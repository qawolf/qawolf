import { Box } from "grommet";
import { ReactNode } from "react";
import styled from "styled-components";

type Props = {
  children: ReactNode;
  className?: string;
  cursorColor: string;
};

function Container({ children, className }: Props): JSX.Element {
  return (
    <Box
      background="gray0"
      className={className}
      data-hj-suppress
      height="100vh"
      overflow="hidden"
    >
      {children}
    </Box>
  );
}

const StyledContainer = styled(Container)`
  cursor: url("data:image/svg+xml,%3Csvg width='28' viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11.2864 5.08437C10.9793 4.98538 10.6508 4.97324 10.3373 5.0493C10.0237 5.12537 9.73729 5.28666 9.50966 5.51536C9.28204 5.74406 9.12207 6.03125 9.04744 6.3452C8.97282 6.65915 8.98644 6.98762 9.08681 7.29431L12.8261 18.554C12.9423 18.9023 13.1651 19.2052 13.463 19.4199C13.7608 19.6345 14.1186 19.75 14.4858 19.75C14.8529 19.75 15.2107 19.6345 15.5086 19.4199C15.8064 19.2052 16.0292 18.9023 16.1454 18.554L17.7051 13.8741C17.7174 13.8368 17.7382 13.8028 17.766 13.775C17.7938 13.7472 17.8278 13.7264 17.8651 13.7141L22.5542 12.1642C22.9025 12.0479 23.2053 11.8251 23.4199 11.5272C23.6345 11.2293 23.75 10.8714 23.75 10.5042C23.75 10.137 23.6345 9.77917 23.4199 9.48126C23.2053 9.18335 22.9025 8.96051 22.5542 8.84427L11.2864 5.08437Z' fill='%23${(
      props
    ) => props.cursorColor.replace("#", "")}' stroke='%23${(props) =>
      props.cursorColor.replace("#", "")}'/%3E%3C/svg%3E%0A"),
    pointer;
`;

export default StyledContainer;
