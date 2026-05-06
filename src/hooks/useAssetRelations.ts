/**
 * Hook to fetch all related entities (cyber risks, threats, vulnerabilities, controls)
 * for a set of selected assets from the API
 */

import { useEffect, useState } from "react";

export interface CyberRisk {
  id: string;
  display_id: string;
  name: string;
  domain: string | null;
  description: string | null;
  status: string;
  inherent_score: number | null;
  inherent_score_label: string | null;
  residual_score: number | null;
  residual_score_label: string | null;
  control_ids: string[];
}

export interface Threat {
  id: string;
  display_id: string;
  name: string;
  category: string | null;
  description: string | null;
  likelihood: number | null;
  likelihood_label: string | null;
}

export interface VulnerabilityCategory {
  id: string;
  display_id: string;
  name: string;
  category: string | null;
  description: string | null;
  severity: number | null;
  severity_label: string | null;
}

export interface Control {
  id: string;
  display_id: string;
  name: string;
  control_type: string | null;
  description: string | null;
  implementation_status: string | null;
  effectiveness_rating: number | null;
  effectiveness_label: string | null;
}

export interface AssetRelations {
  cyberRisks: CyberRisk[];
  threats: Threat[];
  vulnerabilities: VulnerabilityCategory[];
  controls: Control[];
}

export type UseAssetRelationsResult =
  | { status: "idle"; data: null }
  | { status: "loading"; data: null }
  | { status: "error"; data: null; message: string }
  | { status: "ok"; data: AssetRelations };

/**
 * Fetches all related entities for a set of asset IDs
 * @param assetIds - Set of asset display IDs (e.g., ["AST-001", "AST-002"])
 */
export function useAssetRelations(assetIds: Set<string>): UseAssetRelationsResult {
  const [result, setResult] = useState<UseAssetRelationsResult>({
    status: "idle",
    data: null
  });

  // Convert Set to sorted array for stable dependency comparison
  const assetIdArray = Array.from(assetIds).sort();
  const assetIdsKey = assetIdArray.join(',');

  useEffect(() => {
    console.log('[useAssetRelations] Fetching for assets:', assetIdArray);

    if (assetIdArray.length === 0) {
      setResult({
        status: "ok",
        data: {
          cyberRisks: [],
          threats: [],
          vulnerabilities: [],
          controls: []
        }
      });
      return;
    }

    let cancelled = false;
    setResult({ status: "loading", data: null });

    // Fetch related entities for all selected assets in parallel
    Promise.all([
      fetchAllCyberRisks(assetIdArray),
      fetchAllThreats(assetIdArray),
      fetchAllVulnerabilities(assetIdArray),
      fetchAllControls(assetIdArray)
    ])
      .then(([cyberRisks, threats, vulnerabilities, controls]) => {
        if (!cancelled) {
          console.log('[useAssetRelations] Fetched data:', {
            cyberRisks: cyberRisks.length,
            threats: threats.length,
            vulnerabilities: vulnerabilities.length,
            controls: controls.length
          });
          setResult({
            status: "ok",
            data: {
              cyberRisks: deduplicateById(cyberRisks),
              threats: deduplicateById(threats),
              vulnerabilities: deduplicateById(vulnerabilities),
              controls: deduplicateById(controls)
            }
          });
        }
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          console.error("Error fetching asset relations:", err);
          setResult({
            status: "error",
            data: null,
            message: err instanceof Error ? err.message : String(err)
          });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [assetIdsKey]); // Use the string key instead of the Set

  return result;
}

// Helper function to fetch cyber risks for multiple assets
async function fetchAllCyberRisks(assetIds: string[]): Promise<CyberRisk[]> {
  const results = await Promise.all(
    assetIds.map(assetId =>
      fetch(`/api/assets/${assetId}/cyber-risks`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    )
  );
  // Transform API response to match mock data structure
  return results.flat().map((cr: any) => ({
    id: cr.id,
    displayId: cr.display_id,
    name: cr.name,
    domain: cr.domain,
    description: cr.description || '',
    status: cr.status,
    inherentScore: cr.inherent_score,
    inherentScoreLabel: cr.inherent_score_label,
    residualScore: cr.residual_score,
    residualScoreLabel: cr.residual_score_label,
    controlIds: cr.control_ids || [],
    ownerIds: [],
    attachments: [],
    assetIds: [], // Will be populated if needed
    threatIds: [], // Will be populated if needed
    vulnerabilityIds: [], // Will be populated if needed
    relationships: {
      assetIds: [],
      threatIds: [],
      vulnerabilityIds: [],
      controlIds: cr.control_ids || []
    }
  }));
}

// Helper function to fetch threats for multiple assets
async function fetchAllThreats(assetIds: string[]): Promise<Threat[]> {
  const results = await Promise.all(
    assetIds.map(assetId =>
      fetch(`/api/assets/${assetId}/threats`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    )
  );
  // Transform API response to match mock data structure
  return results.flat().map((t: any) => ({
    id: t.id,
    displayId: t.display_id,
    name: t.name,
    domain: t.domain,
    description: t.description || '',
    sources: t.sources || [],
    threatActors: t.actors || [],
    attackVectors: t.attack_vectors || [],
    status: t.status,
    ownerIds: t.owner ? [t.owner] : [],
    attachments: [],
    assetIds: [], // Will be populated if needed
    cyberRiskIds: [], // Will be populated if needed
    vulnerabilityIds: [], // Will be populated if needed
    relationships: {
      assetIds: [],
      cyberRiskIds: [],
      vulnerabilityIds: []
    }
  }));
}

// Helper function to fetch vulnerabilities for multiple assets
async function fetchAllVulnerabilities(assetIds: string[]): Promise<VulnerabilityCategory[]> {
  const results = await Promise.all(
    assetIds.map(assetId =>
      fetch(`/api/assets/${assetId}/vulnerability-categories`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    )
  );
  // Transform API response to match mock data structure
  return results.flat().map((v: any) => ({
    id: v.id,
    displayId: v.display_id,
    name: v.name,
    domain: v.domain,
    vulnerabilityType: v.vulnerability_type,
    description: v.description,
    status: v.status || 'Active',
    primaryCIAImpact: v.cia_impacts || [],
    ownerIds: v.owner ? [v.owner] : [],
    attachments: [],
    assetIds: [], // Will be populated if needed
    cyberRiskIds: [],
    threatIds: [], // Will be populated if needed
    relationships: {
      assetId: '',
      cyberRiskIds: [],
      threatIds: [],
      controlIds: [],
      mitigationPlanIds: [],
      scenarioIds: []
    }
  }));
}

// Helper function to fetch controls for multiple assets
async function fetchAllControls(assetIds: string[]): Promise<Control[]> {
  const results = await Promise.all(
    assetIds.map(assetId =>
      fetch(`/api/assets/${assetId}/controls`)
        .then(res => res.ok ? res.json() : [])
        .catch(() => [])
    )
  );
  // Transform API response to match mock data structure
  return results.flat().map((c: any) => ({
    id: c.id,
    displayId: c.display_id,
    name: c.name,
    controlType: c.control_type,
    description: c.description || '',
    implementationStatus: c.implementation_status,
    effectivenessRating: c.effectiveness_rating,
    effectivenessLabel: c.effectiveness_label,
    ownerIds: [],
    attachments: [],
    assetIds: [], // Will be populated if needed
    cyberRiskIds: [], // Will be populated if needed
    relationships: {
      assetIds: [],
      cyberRiskIds: []
    }
  }));
}

// Helper to deduplicate array by id field
function deduplicateById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Map<string, T>();
  for (const item of items) {
    if (!seen.has(item.id)) {
      seen.set(item.id, item);
    }
  }
  return Array.from(seen.values());
}
