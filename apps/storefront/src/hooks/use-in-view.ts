"use client";

import { useEffect, useRef, type RefObject } from "react";

type UseInViewOptions = {
  threshold?: number;
  rootMargin?: string;
  once?: boolean;
};

export function useInView<T extends HTMLElement = HTMLDivElement>(
  options?: UseInViewOptions,
): RefObject<T | null> {
  const ref = useRef<T>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const {
      threshold = 0.05,
      rootMargin = "0px 0px -20px 0px",
      once = true,
    } = options ?? {};

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.setAttribute("data-in-view", "true");
          if (once) observer.disconnect();
        } else if (!once) {
          el.removeAttribute("data-in-view");
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return ref;
}
