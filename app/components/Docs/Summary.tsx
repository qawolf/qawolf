import { edgeSize } from "../../theme/theme-new";

type Props = { children: string };

export default function Summary({ children }: Props): JSX.Element {
  return <p style={{ marginTop: edgeSize.xxxsmall }}>{children}</p>;
}
