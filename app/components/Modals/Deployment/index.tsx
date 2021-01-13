import { Box, Keyboard } from "grommet";
import { useEffect, useState } from "react";

import { useUpdateGroup } from "../../../hooks/mutations";
import {
  DeploymentEnvironment,
  SelectedGroup,
  SelectedIntegration,
} from "../../../lib/types";
import { copy } from "../../../theme/copy";
import Button from "../../shared/Button";
import Layer from "../../shared/Layer";
import Text from "../../shared/Text";
import Other from "./Other";
import Platform, { PlatformType } from "./Platform";
import Vercel, { allBranches } from "./Vercel";

type Props = {
  closeModal: () => void;
  group: SelectedGroup;
  integration: SelectedIntegration;
};

const WIDTH = "640px";

export default function Deployment({
  closeModal,
  group,
  integration,
}: Props): JSX.Element {
  const [branches, setBranches] = useState("");
  const [environment, setEnvironment] = useState<DeploymentEnvironment>("all");
  const [hasError, setHasError] = useState(false);
  const [isAllBranches, setIsAllBranches] = useState(true);
  const [platform, setPlatform] = useState<PlatformType>("netlify");

  const [updateGroup, { data, loading }] = useUpdateGroup();

  useEffect(() => {
    if (data?.updateGroup) closeModal();
  }, [closeModal, data]);

  useEffect(() => {
    setHasError(false);
  }, [isAllBranches]);

  useEffect(() => {
    setIsAllBranches(true);
    setBranches("");
    setEnvironment("all");
  }, [platform]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setIsAllBranches(e.target.value === allBranches ? true : false);
  };

  const handleClick = (): void => {
    if (platform === "other") return;

    if (!isAllBranches && !branches) {
      // must specify branches if choosing specific branches
      setHasError(true);
      return;
    }

    setHasError(false);
    updateGroup({
      variables: {
        deployment_branches: isAllBranches ? null : branches,
        deployment_environment: environment === "all" ? null : environment,
        deployment_integration_id: integration.id,
        id: group.id,
        repeat_minutes: null,
      },
    });
  };

  return (
    <Keyboard onEnter={handleClick}>
      <Layer onClickOutside={closeModal} onEsc={closeModal}>
        <Box pad="large" width={WIDTH}>
          <Text
            color="black"
            margin={{ bottom: "large" }}
            size="large"
            weight="bold"
          >
            {copy.runOnDeployment(integration.github_repo_name)}
          </Text>
          <Platform platform={platform} setPlatform={setPlatform} />
          {platform === "vercel" ? (
            <Vercel
              branches={branches}
              environment={environment}
              setEnvironment={setEnvironment}
              hasError={hasError}
              isAllBranches={isAllBranches}
              onChange={handleChange}
              setBranches={setBranches}
            />
          ) : (
            <Other platform={platform} />
          )}
          <Button
            disabled={loading}
            href={platform === "other" ? "mailto:hello@qawolf.com" : undefined}
            margin={{ top: "large" }}
            message={platform === "other" ? copy.contactUs : copy.save}
            onClick={platform === "other" ? undefined : handleClick}
          />
        </Box>
      </Layer>
    </Keyboard>
  );
}
