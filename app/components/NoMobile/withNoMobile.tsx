import { useWindowSize } from "../../hooks/windowSize";
import { breakpoints } from "../../theme/theme-new";
import NoMobile from "./index";

export const withNoMobile = <P extends Record<string, unknown>>(
  Component: React.ComponentType<P>
) => {
  return function WrappedComponent(props: P): JSX.Element {
    const { width } = useWindowSize();

    if (width && width < breakpoints.small.value) return <NoMobile />;

    return <Component {...props} />;
  };
};
