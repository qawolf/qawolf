import { Drop as GrommetDrop, DropProps } from "grommet";
import { MouseEvent, ReactNode } from "react";

type Props = {
  align?: DropProps["align"];
  children: ReactNode;
  onClickOutside: (e: MouseEvent<HTMLDocument>) => void;
  onEsc: () => void;
  target: DropProps["target"];
};

export default function Drop({
  align,
  children,
  onClickOutside,
  onEsc,
  target,
}: Props): JSX.Element {
  return (
    <GrommetDrop
      align={align || { left: "left", top: "bottom" }}
      onClickOutside={onClickOutside}
      onEsc={onEsc}
      plain
      style={{ overflow: "visible" }}
      target={target}
    >
      {children}
    </GrommetDrop>
  );
}
