import { useRouter } from "next/router";

import { routes } from "../lib/routes";
import { CreateTestData, useCreateTest } from "./mutations";

type CreateTestFromGuide = {
  loading: boolean;
  onClick: () => void;
};

type UseCreateTestFromGuide = {
  href: string;
  name: string;
  teamId: string;
  userId: string;
};

export const useCreateTestFromGuide = ({
  href,
  name,
  teamId,
  userId,
}: UseCreateTestFromGuide): CreateTestFromGuide => {
  const { push } = useRouter();

  const [createTest, { loading }] = useCreateTest(
    ({ createTest }: CreateTestData): void => {
      push(`${routes.test}/${createTest.id}`);
    }
  );

  const handleClick = (): void => {
    createTest({
      variables: {
        name,
        team_id: teamId,
        url: `${window.location.origin}${routes.guides}${href}?user_id=${userId}`,
      },
    });
  };

  return { loading, onClick: handleClick };
};
