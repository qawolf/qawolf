import { Box, BoxProps, Drop as GrommetDrop, DropProps } from "grommet";
import { CSSProperties, MouseEvent, ReactNode } from "react";

type Props = DropProps & {
  children: ReactNode;
  onClick?: () => void;
  onClickOutside: () => void;
  style?: CSSProperties;
  width?: BoxProps["width"];
};

export default function Drop({
  children,
  width,
  ...props
}: Props): JSX.Element {
  const handleClickOutside = (e: MouseEvent<HTMLDocument>) => {
    // ignore clicks on the button
    if ((props.target as HTMLElement)?.contains(e.target as HTMLButtonElement))
      return;

    props.onClickOutside();
  };

  return (
    <GrommetDrop {...props} onClickOutside={handleClickOutside}>
      <Box pad={{ vertical: "xxxsmall" }} width={width}>
        {children}
      </Box>
    </GrommetDrop>
  );
}
