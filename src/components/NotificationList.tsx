import { useNotifications } from "@/state/NotificationsContext";
import ToastNotifStyle from "@/styles/ToastNotification.module.css";
import cn from "classnames";

export default function NotificationList() {
  const { notifications, dispatch } = useNotifications();

  return (
    <div>
      {/* TOAST NOTIFICATIONS: should sit on top of group invitations */}
      {notifications.map(({ title, id }, index) => {
        return (
          <div
            key={index}
            className={cn("relative", ToastNotifStyle.toastNotification)}
            onClick={() => dispatch({ type: "remove", id })}
          >
            <div className="text-white">{title}</div>
          </div>
        );
      })}
    </div>
  );
}
