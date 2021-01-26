import { Layer as GrommetLayer, LayerProps } from "grommet";
import { ReactNode } from "react";

type Props = LayerProps & {
  children: ReactNode;
};

// this component wraps Grommet Layer and adds a class "layer"
// so we can style the inner content to not have a pointer cursor
export default function Layer({ children, ...props }: Props): JSX.Element {
  return (
    <GrommetLayer className="layer" {...props}>
      {children}
    </GrommetLayer>
  );
}
