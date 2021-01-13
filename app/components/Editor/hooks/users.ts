import { useContext, useEffect, useState } from "react";

import { User, UserSubscription } from "../../../lib/types";
import { RunnerContext } from "../contexts/RunnerContext";

export const useUsers = (user: User | null): UserSubscription[] => {
  const [users, setUsers] = useState<UserSubscription[]>([]);
  const { runner } = useContext(RunnerContext);

  useEffect(() => {
    if (!runner || !user) return;

    const onUsers = (newUsers: UserSubscription[]) => setUsers(newUsers);

    runner.on("users", onUsers);

    runner.subscribe({
      type: "users",
      data: {
        email: user.email,
        wolfName: user.wolf_name,
        wolfVariant: user.wolf_variant,
      },
    });

    return () => {
      setUsers([]);
      runner.unsubscribe({ type: "users" });
      runner.off("users", onUsers);
    };
  }, [runner, user]);

  return users;
};
