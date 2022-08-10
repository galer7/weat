import { User } from "next-auth";
import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";

const LoggedInUserContext = createContext<{
  loggedInUser: User | null;
  dispatch: Dispatch<LoggedInUserReducerAction>;
}>({
  loggedInUser: null,
  dispatch: () => {},
});

export function LoggedInUserProvider({
  children,
  user,
}: {
  children: ReactNode;
  user: User;
}) {
  const [loggedInUser, dispatch] = useReducer(loggedInUserReducer, user);

  return (
    <LoggedInUserContext.Provider value={{ loggedInUser, dispatch }}>
      {children}
    </LoggedInUserContext.Provider>
  );
}

type LoggedInUserReducerAction = { type: "overwrite"; payload: User };

function loggedInUserReducer(user: User, action: LoggedInUserReducerAction) {
  const { type, payload } = action;
  switch (type) {
    case "overwrite": {
      return payload;
    }
    default:
      console.error(`Action object ${action} unknown`);
      return user;
  }
}

export function useLoggedInUser() {
  return useContext(LoggedInUserContext);
}
