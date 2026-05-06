import { replaceAssetsFromPersistence } from "../assets.js";
import { replaceOrgUnitsFromPersistence } from "../orgUnits.js";
import { replaceControlsFromPersistence } from "../controls.js";
import { replaceCyberRisksFromPersistence } from "../cyberRisks.js";
import { replaceMitigationPlansFromPersistence } from "../mitigationPlans.js";
import { sanitizeCraNewAssessmentDraft } from "../../pages/craNewAssessmentDraftStorage.js";
import {
  hydratePersistedCraDraft,
  loadRawCatalogJson,
  loadRawCatalogJsonAsync,
  markCatalogDirty,
  parsePersistedCatalog,
} from "./catalogStore.js";
import { replaceRiskAssessmentsFromPersistence } from "../riskAssessments.js";
import {
  rebuildScenariosFromGraph,
  refreshScenarioScaleLabelsFromConfig,
  setScenarioOverridesFromPersistence,
} from "../scenarios.js";
import { replaceThreatsFromPersistence } from "../threats.js";
import {
  bandsFullyValid,
  deepCloneBands,
  DEFAULT_CYBER_RISK_SCORE_BANDS,
  isLegacyCyberRiskScoreScale,
  setActiveCyberRiskScoreBands,
  setActiveLikelihoodBands,
  type ScoringBandRow,
} from "../cyberRiskScoringScales.js";
import { refreshAllCyberRiskScaleLabelsFromConfig } from "../cyberRisks.js";
import { replaceUsersFromPersistence } from "../users.js";
import { replaceVulnerabilitiesFromPersistence } from "../vulnerabilities.js";

import type { PersistedCatalogV1 } from "./catalogTypes.js";

function applyPersistedScoringBands(catalog: PersistedCatalogV1): void {
  const { cyberScoreBands, likelihoodBands } = catalog;
  if (
    Array.isArray(cyberScoreBands) &&
    cyberScoreBands.length === 5 &&
    bandsFullyValid(cyberScoreBands as ScoringBandRow[])
  ) {
    const rows = cyberScoreBands as ScoringBandRow[];
    if (isLegacyCyberRiskScoreScale(rows)) {
      const migrated = deepCloneBands(DEFAULT_CYBER_RISK_SCORE_BANDS);
      setActiveCyberRiskScoreBands(migrated);
      catalog.cyberScoreBands = migrated;
      markCatalogDirty();
    } else {
      setActiveCyberRiskScoreBands(rows);
    }
  }
  if (
    Array.isArray(likelihoodBands) &&
    likelihoodBands.length === 5 &&
    bandsFullyValid(likelihoodBands as ScoringBandRow[])
  ) {
    setActiveLikelihoodBands(likelihoodBands as ScoringBandRow[]);
  }
}

export function applyPersistedCatalog(catalog: PersistedCatalogV1): void {
  if (!catalog || catalog.schemaVersion !== 2) return;
  if (!Array.isArray(catalog.users) || !Array.isArray(catalog.threats)) return;

  applyPersistedScoringBands(catalog);

  replaceUsersFromPersistence(catalog.users);
  replaceOrgUnitsFromPersistence(catalog.orgUnits);
  replaceAssetsFromPersistence(catalog.assets);
  replaceVulnerabilitiesFromPersistence(catalog.vulnerabilities);
  replaceThreatsFromPersistence(catalog.threats);
  replaceControlsFromPersistence(catalog.controls);
  replaceMitigationPlansFromPersistence(catalog.mitigationPlans);
  replaceCyberRisksFromPersistence(catalog.cyberRisks);
  setScenarioOverridesFromPersistence(catalog.scenarioOverrides);
  rebuildScenariosFromGraph();
  replaceRiskAssessmentsFromPersistence(catalog.riskAssessments);
  hydratePersistedCraDraft(
    catalog.craDraft != null ? sanitizeCraNewAssessmentDraft(catalog.craDraft) : null,
  );

  refreshAllCyberRiskScaleLabelsFromConfig();
  refreshScenarioScaleLabelsFromConfig();
}


export async function applyCatalogFromStorage(): Promise<void> {
  let json = loadRawCatalogJson();
  if (!json) {
    json = await loadRawCatalogJsonAsync();
  }
  if (!json) return;
  const catalog = parsePersistedCatalog(json);
  if (!catalog) return;
  applyPersistedCatalog(catalog);
}
