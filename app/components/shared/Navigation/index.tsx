import { Box } from "grommet";
import { useEffect, useRef, useState } from "react";

import { hasIntersectionObserver } from "../../../lib/detection";
import Bar from "./Bar";

type Props = { transparentAtTop?: boolean };

export default function Navigation({ transparentAtTop }: Props): JSX.Element {
  const [isTop, setIsTop] = useState(true);

  const topOfPage = useRef<HTMLDivElement>(null);

  // detect if top of page to make mobile navigation have transparent background
  useEffect(() => {
    if (!topOfPage.current) return;

    // if no browser support make navigation dark
    if (!hasIntersectionObserver()) {
      setIsTop(false);
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        setIsTop(entry.isIntersecting);
      });
    });

    observer.observe(topOfPage.current);

    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Box ref={topOfPage} />
      <Bar transparent={!!transparentAtTop && isTop} />
    </>
  );
}
