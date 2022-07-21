import { ReactNode } from "react";

const Modal = ({ children }: { children: ReactNode }) => {
  return (
    <div className="fixed w-1/2 h-1/2 top-0 left-0 z-10 bg-sky-700">
      {children}
    </div>
  );
};

export default Modal;
