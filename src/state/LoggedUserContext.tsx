import { User } from "next-auth";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

const LoggedUserContext = createContext<{
  loggedUser: User | null;
  dispatch: Dispatch<LoggedUserReducerAction>;
}>({
  loggedUser: null,
  dispatch: () => {},
});

export function LoggedUserProvider({ children }: { children: ReactNode }) {
  const [loggedUser, dispatch] = useReducer(loggedUserReducer, null);

  return (
    <LoggedUserContext.Provider value={{ loggedUser, dispatch }}>
      {children}
    </LoggedUserContext.Provider>
  );
}

type LoggedUserReducerAction = { type: "overwrite"; payload: User };

function loggedUserReducer(user: User | null, action: LoggedUserReducerAction) {
  console.log("logged user dispatch", { user, action });
  const { type, payload } = action;
  switch (type) {
    case "overwrite": {
      if (!payload?.foodieGroupId) {
      }
      return payload;
    }
    default:
      console.error(`Action object ${action} unknown`);
      return user;
  }
}

export function useLoggedUser() {
  return useContext(LoggedUserContext);
}
