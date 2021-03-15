import { ApolloError } from "@apollo/client";
import { useRouter } from "next/router";

import { routes } from "../lib/routes";
import { CreateTestData, useCreateTest } from "./mutations";

type CreateTestFromGuide = {
  called: boolean;
  error: ApolloError | null;
  loading: boolean;
  onClick: () => void;
};

type UseCreateTestFromGuide = {
  href: string;
  guide: string;
  teamId: string;
  userId: string;
};

export const useCreateTestFromGuide = ({
  href,
  guide,
  teamId,
  userId,
}: UseCreateTestFromGuide): CreateTestFromGuide => {
  const { push } = useRouter();

  const [createTest, { called, error, loading }] = useCreateTest(
    ({ createTest }: CreateTestData): void => {
      push(`${routes.test}/${createTest.id}`);
    }
  );

  const handleClick = (): void => {
    createTest({
      variables: {
        guide,
        team_id: teamId,
        url: `${window.location.origin}${routes.guides}${href}?user_id=${userId}`,
      },
    });
  };

  return { called, error: error || null, loading, onClick: handleClick };
};
