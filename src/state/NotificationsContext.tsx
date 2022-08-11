import {
  createContext,
  useContext,
  useReducer,
  ReactNode,
  Dispatch,
} from "react";
import { v4 } from "uuid";

export type Notification = {
  title: string;
  id: string;
};

const NotificationsContext = createContext<{
  notifications: Notification[];
  dispatch: Dispatch<NotificationsReducerAction>;
}>({
  notifications: [],
  dispatch: () => {},
});

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, dispatch] = useReducer(notificationsReducer, []);

  return (
    <NotificationsContext.Provider value={{ notifications, dispatch }}>
      {children}
    </NotificationsContext.Provider>
  );
}

type NotificationsReducerAction =
  | (Notification & {
      type: "add";
    })
  | (Pick<Notification, "id"> & {
      type: "remove";
    });

function notificationsReducer(
  notifications: Notification[],
  action: NotificationsReducerAction
) {
  console.log("notifications dispatch", { notifications, action });
  const { type } = action;
  switch (type) {
    case "add": {
      const { id, title } = action;
      return [...notifications, { id, title }];
    }
    case "remove": {
      return notifications.filter(({ id }) => id !== action.id);
    }
    default:
      console.error(`Action object ${action} unknown`);
      return notifications;
  }
}

export function useNotifications() {
  const { dispatch, notifications } = useContext(NotificationsContext);

  const id = v4();
  const addTemporaryToast = (payload: Omit<Notification, "id">) => {
    dispatch({ type: "add", ...payload, id });

    setTimeout(() => {
      dispatch({ type: "remove", id: id });
    }, 5000);
  };

  return { dispatch, notifications, addTemporaryToast };
}
