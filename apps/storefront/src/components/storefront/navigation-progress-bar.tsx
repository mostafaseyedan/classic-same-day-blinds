"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function isModifiedEvent(event: MouseEvent) {
  return event.metaKey || event.ctrlKey || event.shiftKey || event.altKey;
}

function sameDocumentHashNavigation(url: URL) {
  return url.pathname === window.location.pathname && url.search === window.location.search && url.hash.length > 0;
}

function getAnchorFromEventTarget(target: EventTarget | null) {
  if (!(target instanceof Element)) {
    return null;
  }

  return target.closest("a[href]") as HTMLAnchorElement | null;
}

export function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const routeKey = useMemo(
    () => `${pathname ?? ""}?${searchParams?.toString() ?? ""}`,
    [pathname, searchParams],
  );

  const [visible, setVisible] = useState(false);
  const [progress, setProgress] = useState(0);

  const activeRef = useRef(false);
  const trickleTimerRef = useRef<number | null>(null);
  const settleTimerRef = useRef<number | null>(null);
  const startFrameRef = useRef<number | null>(null);
  const lastRouteKeyRef = useRef(routeKey);

  useEffect(() => {
    lastRouteKeyRef.current = routeKey;
  }, [routeKey]);

  useEffect(() => {
    const clearTrickle = () => {
      if (trickleTimerRef.current !== null) {
        window.clearInterval(trickleTimerRef.current);
        trickleTimerRef.current = null;
      }
    };

    const clearSettle = () => {
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
        settleTimerRef.current = null;
      }
    };

    const clearStartFrame = () => {
      if (startFrameRef.current !== null) {
        window.cancelAnimationFrame(startFrameRef.current);
        startFrameRef.current = null;
      }
    };

    const start = () => {
      clearSettle();
      setVisible(true);
      activeRef.current = true;
      setProgress((current) => {
        if (current >= 12) {
          return current;
        }

        return 12;
      });

      if (trickleTimerRef.current === null) {
        trickleTimerRef.current = window.setInterval(() => {
          setProgress((current) => {
            if (current >= 88) {
              return current;
            }

            if (current < 28) return current + 10;
            if (current < 52) return current + 7;
            if (current < 72) return current + 4;
            return current + 2;
          });
        }, 160);
      }
    };

    const scheduleStart = () => {
      if (startFrameRef.current !== null) {
        return;
      }

      startFrameRef.current = window.requestAnimationFrame(() => {
        startFrameRef.current = null;
        start();
      });
    };

    const handleClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || isModifiedEvent(event)) {
        return;
      }

      const anchor = getAnchorFromEventTarget(event.target);
      if (!anchor) {
        return;
      }

      if (anchor.target && anchor.target !== "_self") {
        return;
      }

      if (anchor.hasAttribute("download")) {
        return;
      }

      const href = anchor.getAttribute("href");
      if (!href) {
        return;
      }

      const nextUrl = new URL(href, window.location.href);

      if (nextUrl.origin !== window.location.origin || sameDocumentHashNavigation(nextUrl)) {
        return;
      }

      const nextRouteKey = `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`;
      if (nextRouteKey === lastRouteKeyRef.current) {
        return;
      }

      scheduleStart();
    };

    const originalPushState = window.history.pushState.bind(window.history);
    const originalReplaceState = window.history.replaceState.bind(window.history);

    window.history.pushState = function pushState(data, unused, url) {
      if (typeof url === "string" || url instanceof URL) {
        const nextUrl = new URL(url.toString(), window.location.href);
        const nextRouteKey = `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`;
        if (nextRouteKey !== lastRouteKeyRef.current) {
          scheduleStart();
        }
      }

      return originalPushState(data, unused, url);
    };

    window.history.replaceState = function replaceState(data, unused, url) {
      if (typeof url === "string" || url instanceof URL) {
        const nextUrl = new URL(url.toString(), window.location.href);
        const nextRouteKey = `${nextUrl.pathname}?${nextUrl.searchParams.toString()}`;
        if (nextRouteKey !== lastRouteKeyRef.current) {
          scheduleStart();
        }
      }

      return originalReplaceState(data, unused, url);
    };

    const handlePopState = () => {
      scheduleStart();
    };

    document.addEventListener("click", handleClick, true);
    window.addEventListener("popstate", handlePopState);

    return () => {
      clearTrickle();
      clearSettle();
      clearStartFrame();
      document.removeEventListener("click", handleClick, true);
      window.removeEventListener("popstate", handlePopState);
      window.history.pushState = originalPushState;
      window.history.replaceState = originalReplaceState;
    };
  }, []);

  useEffect(() => {
    if (!activeRef.current) {
      return;
    }

    const timer = window.setTimeout(() => {
      setProgress((current) => (current < 94 ? 94 : current));
    }, 60);

    const finishTimer = window.setTimeout(() => {
      activeRef.current = false;
      if (trickleTimerRef.current !== null) {
        window.clearInterval(trickleTimerRef.current);
        trickleTimerRef.current = null;
      }
      setProgress(100);
      if (settleTimerRef.current !== null) {
        window.clearTimeout(settleTimerRef.current);
      }
      settleTimerRef.current = window.setTimeout(() => {
        setVisible(false);
        setProgress(0);
      }, 240);
    }, 140);

    return () => {
      window.clearTimeout(timer);
      window.clearTimeout(finishTimer);
    };
  }, [routeKey]);

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-x-0 top-0 z-[120] transition-opacity duration-200 ${
        visible ? "opacity-100" : "opacity-0"
      }`}
    >
      <div className="h-[2px] w-full bg-[linear-gradient(90deg,rgba(255,255,255,0.14),rgba(255,255,255,0))]">
        <div
          className="h-full origin-left rounded-r-full bg-[linear-gradient(90deg,#8f6534_0%,#c99654_46%,#f1dfbf_100%)] shadow-[0_0_14px_rgba(201,150,84,0.45)] transition-[transform,opacity] duration-200 ease-out"
          style={{ transform: `scaleX(${progress / 100})` }}
        />
      </div>
    </div>
  );
}
