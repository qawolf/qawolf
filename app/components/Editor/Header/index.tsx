import { Box } from "grommet";
import { routes } from "../../../lib/routes";

import { borderSize } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import ArrowLeft from "../../shared-new/icons/ArrowLeft";

export default function Header(): JSX.Element {
  return (
    <Box
      border={{ color: "gray3", side: "bottom", size: borderSize.xsmall }}
      direction="row"
      pad="small"
      width="full"
    >
      <Button IconComponent={ArrowLeft} href={routes.tests} type="ghost" />
    </Box>
  );
}
