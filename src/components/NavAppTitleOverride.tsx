import { useEffect } from "react";

/**
 * The Atlas prototype `AppLayout` renders its side-nav via a hardcoded mock
 * navigator (`mock-hb-global-navigator` -> `atlas-gn-side-nav`) whose app title
 * is fixed to "AI Boards" (appKey="boards-cloud"). There is no prop on
 * AppLayout to change it, so we override the rendered <h2> at runtime.
 *
 * The title lives two shadow roots deep and is rendered by a Lit component that
 * can re-render (e.g. locale/appKey updates), so we (1) retry until the element
 * exists and (2) observe it for re-renders and re-apply the override.
 */
const DESIRED_TITLE = "Asset Manager";

function findTitleEl(): HTMLElement | null {
  const nav = document.querySelector("mock-hb-global-navigator");
  const sideNav = nav?.shadowRoot?.querySelector("atlas-gn-side-nav");
  return (sideNav?.shadowRoot?.querySelector("header h2") as HTMLElement) ?? null;
}

export default function NavAppTitleOverride() {
  useEffect(() => {
    let observer: MutationObserver | null = null;
    let cancelled = false;

    const apply = (el: HTMLElement) => {
      if (el.textContent !== DESIRED_TITLE) el.textContent = DESIRED_TITLE;
    };

    const attach = (el: HTMLElement) => {
      apply(el);
      // Re-apply if Lit re-renders the side-nav header and resets the text.
      observer = new MutationObserver(() => apply(el));
      observer.observe(el, { childList: true, characterData: true, subtree: true });
    };

    // Poll briefly until the shadow-DOM <h2> is rendered, then attach.
    const start = performance.now();
    const tick = () => {
      if (cancelled) return;
      const el = findTitleEl();
      if (el) {
        attach(el);
      } else if (performance.now() - start < 10000) {
        requestAnimationFrame(tick);
      }
    };
    tick();

    return () => {
      cancelled = true;
      observer?.disconnect();
    };
  }, []);

  return null;
}
