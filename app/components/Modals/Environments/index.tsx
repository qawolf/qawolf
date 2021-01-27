import { Box, ThemeContext } from "grommet";
import { useState } from "react";

import { Environment } from "../../../lib/types";
import { copy } from "../../../theme/copy";
import { theme } from "../../../theme/theme-new";
import Button from "../../shared-new/AppButton";
import Close from "../../shared-new/icons/Close";
import Layer from "../../shared-new/Layer";
import Text from "../../shared-new/Text";
import ConfirmDelete from "./ConfirmDelete";
import List from "./List";

type Props = {
  closeModal: () => void;
};

const WIDTH = "576px";

export default function Environments({ closeModal }: Props): JSX.Element {
  const [
    deleteEnvironment,
    setDeleteEnvironment,
  ] = useState<Environment | null>(null);

  const handleCancelClick = (): void => setDeleteEnvironment(null);

  const handleDeleteClick = (environment: Environment): void => {
    setDeleteEnvironment(environment);
  };

  return (
    <ThemeContext.Extend value={theme}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="medium" width={WIDTH}>
          <Box
            align="center"
            direction="row"
            justify="between"
            margin={{ bottom: "xxsmall" }}
          >
            <Text color="gray9" size="componentHeader">
              {deleteEnvironment
                ? copy.environmentDelete
                : copy.environmentsEdit}
            </Text>
            <Button
              IconComponent={Close}
              a11yTitle={copy.close}
              onClick={closeModal}
              type="ghost"
            />
          </Box>
          {deleteEnvironment ? (
            <ConfirmDelete
              environment={deleteEnvironment}
              onCancelClick={handleCancelClick}
            />
          ) : (
            <>
              <Text color="gray8" size="componentParagraph">
                {copy.environmentsEditDetail}
              </Text>
              <List closeModal={closeModal} onDeleteClick={handleDeleteClick} />
            </>
          )}
        </Box>
      </Layer>
    </ThemeContext.Extend>
  );
}
