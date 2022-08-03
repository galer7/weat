import type { ToastNotification } from "@/utils/types";

export default function ToastNotifications({
  toastNotifications,
}: {
  toastNotifications: ToastNotification[];
}) {
  return (
    <div>
      {toastNotifications.map(({ title }, id) => {
        return (
          <div key={id}>
            <div>{title}</div>
          </div>
        );
      })}
    </div>
  );
}
