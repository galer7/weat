import React, { useState, useEffect, useRef, RefObject } from "react";

export default function useComponentVisible(initialIsVisible: boolean) {
  const [isComponentVisible, setIsComponentVisible] =
    useState(initialIsVisible);
  const ref = useRef<RefObject>(null);

  const handleClickOutside = (event: React.MouseEvent): void => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsComponentVisible(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside, true);
    return () => {
      document.removeEventListener("click", handleClickOutside, true);
    };
  }, []);

  return { ref, isComponentVisible, setIsComponentVisible };
}
