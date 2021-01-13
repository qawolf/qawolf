import { createContext, FC, useEffect, useState } from "react";

import { defaultState, state } from "../lib/state";
import { State } from "../lib/types";

export const StateContext = createContext<State>(defaultState);

export const StateProvider: FC = ({ children }) => {
  const [value, setValue] = useState<State>(state.state);

  useEffect(() => {
    const handleStateChange = () => setValue({ ...state.state });

    state.on("changed", handleStateChange);

    return () => state.off("changed", handleStateChange);
  }, []);

  return (
    <StateContext.Provider value={value}>{children}</StateContext.Provider>
  );
};
