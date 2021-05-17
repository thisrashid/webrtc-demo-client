import React from "react";
import { INIT_STATE, State } from "../redux";

type AppContextType = {
  state: State;
  actions: { [key: string]: Function };
};

const defaultValue: AppContextType = { actions: {}, state: INIT_STATE };

export const AppContext = React.createContext(defaultValue);

export const useAppContext = () => React.useContext(AppContext);
