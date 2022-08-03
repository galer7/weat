import styles from "./Loading.module.css";
import cn from "classnames";

export default function Loading({ className }: { className: string }) {
  return (
    <div className={cn(styles.ldsSpinner, className)}>
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
