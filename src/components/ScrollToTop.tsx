import { useLayoutEffect } from "react";
import { useLocation } from "react-router";

/**
 * Resets window scroll when the location changes so in-app navigation does not
 * keep the previous page's scroll position.
 */
export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [pathname, search, hash]);

  return null;
}
