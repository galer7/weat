import LoadingStyle from "@/styles/Loading.module.css";
import cn from "classnames";

export default function Loading({ className }: { className: string }) {
  return (
    <div className={cn(LoadingStyle.ldsSpinner, className)}>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
      <div></div>
    </div>
  );
}
