import type { CraNewAssessmentPersistedDraft } from "../craAssessmentDraftTypes.js";
import type {
  MockAsset,
  MockOrgUnit,
  MockControl,
  MockCyberRisk,
  MockCyberRiskAssessment,
  MockMitigationPlan,
  MockScenario,
  MockThreat,
  MockUser,
  MockVulnerability,
} from "../types.js";

/** Persisted catalog blob (localStorage / IndexedDB). */
export type PersistedCatalogV1 = {
  schemaVersion: 2;
  users: MockUser[];
  orgUnits: MockOrgUnit[];
  assets: MockAsset[];
  vulnerabilities: MockVulnerability[];
  threats: MockThreat[];
  controls: MockControl[];
  mitigationPlans: MockMitigationPlan[];
  cyberRisks: MockCyberRisk[];
  riskAssessments: MockCyberRiskAssessment[];
  /** Partial scenario patches keyed by scenario id (baseline comes from regenerated graph). */
  scenarioOverrides: Record<string, Partial<MockScenario>>;
  /** New-assessment draft (replaces sessionStorage-only persistence). */
  craDraft: CraNewAssessmentPersistedDraft | null;
};

export const CATALOG_STORAGE_KEY = "cra_proto_catalog_v2";
