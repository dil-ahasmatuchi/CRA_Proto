/**
 * usePersistScope
 *
 * Persists assessment scope (included assets + per-entity exclusions) to the
 * SQLite backend whenever the caller invokes `save()`.
 *
 * Designed to run alongside the existing localStorage draft — it is
 * non-blocking and will not break the UI on failure.
 *
 * Flow:
 *   1. First `save()` → POST /api/cyber-risk-assessments (create record)
 *   2. Subsequent calls → reuse the same assessment (displayId stored in sessionStorage)
 *   3. Every save → PUT /api/cyber-risk-assessments/:displayId/scope { assetIds }
 *   4. Excluded entities → POST /api/cyber-risk-assessments/:displayId/exclusions (per item)
 *
 * Related entity IDs (risks, threats, vulnerabilities, controls) are auto-derived
 * at query time from the asset junction tables — no extra write needed for those.
 */

import { useCallback, useRef, useState } from "react";

export type ScopePayload = {
  /** Assessment name shown in the UI */
  name: string;
  /** Current phase: draft | scoping | inProgress | review | … */
  phase: string;
  /** Asset display IDs currently toggled "included" (e.g. ["AST-001", "AST-002"]) */
  includedAssetIds: string[];
  /** Entity display IDs explicitly excluded from scope */
  excludedCyberRiskIds: string[];
  excludedThreatIds: string[];
  excludedVulnerabilityCategoryIds: string[];
  excludedControlIds: string[];
};

export type PersistScopeResult = {
  /** DB display ID of the persisted assessment (e.g. "ASM-001"), null before first save */
  dbDisplayId: string | null;
  isSaving: boolean;
  lastSavedAt: string | null;
  saveError: string | null;
  save: (payload: ScopePayload) => void;
};

const SESSION_KEY_PREFIX = "cra_db_display_id";

function sessionKey(uiId: string) {
  return `${SESSION_KEY_PREFIX}:${uiId || "new"}`;
}

/**
 * @param uiAssessmentId  The CRA-xxx ID from UI state (may be "" for new drafts).
 *                        Used only as a stable session-storage key.
 */
export function usePersistScope(uiAssessmentId: string): PersistScopeResult {
  const storedDisplayId =
    typeof sessionStorage !== "undefined"
      ? sessionStorage.getItem(sessionKey(uiAssessmentId))
      : null;

  const [dbDisplayId, setDbDisplayId] = useState<string | null>(storedDisplayId);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const displayIdRef = useRef<string | null>(dbDisplayId);
  displayIdRef.current = dbDisplayId;

  const save = useCallback(
    (payload: ScopePayload) => {
      setIsSaving(true);
      setSaveError(null);

      const run = async () => {
        try {
          let displayId = displayIdRef.current;

          // ── Step 1: Create assessment on first save ────────────────────────
          if (!displayId) {
            const createRes = await fetch("/api/cyber-risk-assessments", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: payload.name || "Untitled Assessment",
                assessmentType: "cyber_risk",
                phase: payload.phase,
              }),
            });

            if (!createRes.ok) {
              throw new Error(`Failed to create assessment: HTTP ${createRes.status}`);
            }

            const created = (await createRes.json()) as { displayId: string };
            displayId = created.displayId;
            setDbDisplayId(displayId);
            displayIdRef.current = displayId;

            try {
              sessionStorage.setItem(sessionKey(uiAssessmentId), displayId);
            } catch {
              // sessionStorage may be unavailable in some contexts
            }
          }

          // ── Step 2: Save included asset IDs (replaces previous scope) ─────
          const scopeRes = await fetch(
            `/api/cyber-risk-assessments/${displayId}/scope`,
            {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ assetIds: payload.includedAssetIds }),
            }
          );

          if (!scopeRes.ok) {
            throw new Error(`Failed to save asset scope: HTTP ${scopeRes.status}`);
          }

          // ── Step 3: Save exclusions (best-effort, per entity) ─────────────
          const exclusions: { entityType: string; entityId: string }[] = [
            ...payload.excludedCyberRiskIds.map((id) => ({
              entityType: "cyber_risk",
              entityId: id,
            })),
            ...payload.excludedThreatIds.map((id) => ({
              entityType: "threat",
              entityId: id,
            })),
            ...payload.excludedVulnerabilityCategoryIds.map((id) => ({
              entityType: "vulnerability",
              entityId: id,
            })),
            ...payload.excludedControlIds.map((id) => ({
              entityType: "control",
              entityId: id,
            })),
          ];

          // Fire exclusion POSTs concurrently; don't fail the save if they error
          if (exclusions.length > 0) {
            await Promise.allSettled(
              exclusions.map((excl) =>
                fetch(`/api/cyber-risk-assessments/${displayId}/exclusions`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(excl),
                })
              )
            );
          }

          setLastSavedAt(new Date().toISOString());
        } catch (err: unknown) {
          setSaveError(err instanceof Error ? err.message : String(err));
          console.error("[usePersistScope] save failed:", err);
        } finally {
          setIsSaving(false);
        }
      };

      void run();
    },
    [uiAssessmentId]
  );

  return { dbDisplayId, isSaving, lastSavedAt, saveError, save };
}
