import { useEffect, useState } from "react";

export type ApiListResult<T> =
  | { status: "loading"; data: null; error: null }
  | { status: "ok"; data: T[]; error: null }
  | { status: "error"; data: null; error: string };

/**
 * Generic hook that GETs a JSON array from a local API endpoint.
 * Re-fetches whenever `url` changes.
 */
export function useApiList<T>(url: string): ApiListResult<T> {
  const [result, setResult] = useState<ApiListResult<T>>({
    status: "loading",
    data: null,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setResult({ status: "loading", data: null, error: null });

    fetch(url)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json() as Promise<T[]>;
      })
      .then((data) => {
        if (!cancelled) setResult({ status: "ok", data, error: null });
      })
      .catch((err: unknown) => {
        if (!cancelled)
          setResult({ status: "error", data: null, error: String(err) });
      });

    return () => {
      cancelled = true;
    };
  }, [url]);

  return result;
}
