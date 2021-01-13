import cuid from "cuid";
import {
  createContext,
  FC,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import { Action } from "../../../lib/types";
import { TestContext } from "./TestContext";

export type ActionsContextValue = {
  actions: Action[];
  removeAction: (id: string) => void;
};

type Coords = {
  x: number;
  y: number;
};

export const ActionsContext = createContext<ActionsContextValue>({
  actions: [],
  removeAction: () => null,
});

// We use a context instead of a hook since the
// consumers are far apart in the component tree
export const ActionsProvider: FC = ({ children }) => {
  const { controller } = useContext(TestContext);

  const coordsRef = useRef<Coords>({ x: 0, y: 0 });
  const [actions, setActions] = useState<Action[]>([]);

  const addActions = (num: number) => {
    if (num <= 0) return;

    const { current } = coordsRef;

    const actions = Array(num)
      .fill("")
      .map(() => ({
        id: cuid(),
        x: current.x,
        y: current.y,
      }));

    setActions((prev) => {
      return [...prev, ...actions];
    });
  };

  const removeAction = (id: string): void => {
    setActions((prev) => {
      return prev.filter((action) => action.id !== id);
    });
  };

  useEffect(() => {
    const onMouseMove = (e: MouseEvent): void => {
      coordsRef.current = { x: e.clientX, y: e.clientY };
    };

    document.addEventListener("mousemove", onMouseMove, true);

    return () => document.removeEventListener("mousemove", onMouseMove, true);
  }, []);

  useEffect(() => {
    if (!controller) return;

    controller.on("generatedlines", addActions);

    return () => {
      controller.off("generatedlines", addActions);
    };
  }, [controller]);

  const value = { actions, removeAction };

  return (
    <ActionsContext.Provider value={value}>{children}</ActionsContext.Provider>
  );
};
