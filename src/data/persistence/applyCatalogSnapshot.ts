import { replaceAssetsFromPersistence } from "../assets.js";
import { replaceBusinessUnitsFromPersistence } from "../businessUnits.js";
import { replaceControlsFromPersistence } from "../controls.js";
import { replaceCyberRisksFromPersistence } from "../cyberRisks.js";
import { replaceMitigationPlansFromPersistence } from "../mitigationPlans.js";
import { sanitizeCraNewAssessmentDraft } from "../../pages/craNewAssessmentDraftStorage.js";
import {
  hydratePersistedCraDraft,
  loadRawCatalogJson,
  loadRawCatalogJsonAsync,
  parsePersistedCatalog,
} from "./catalogStore.js";
import { replaceRiskAssessmentsFromPersistence } from "../riskAssessments.js";
import {
  rebuildScenariosFromGraph,
  setScenarioOverridesFromPersistence,
} from "../scenarios.js";
import { replaceThreatsFromPersistence } from "../threats.js";
import { replaceUsersFromPersistence } from "../users.js";
import { replaceVulnerabilitiesFromPersistence } from "../vulnerabilities.js";

import type { PersistedCatalogV1 } from "./catalogTypes.js";

export function applyPersistedCatalog(catalog: PersistedCatalogV1): void {
  if (!catalog || catalog.schemaVersion !== 1) return;
  if (!Array.isArray(catalog.users) || !Array.isArray(catalog.threats)) return;

  replaceUsersFromPersistence(catalog.users);
  replaceBusinessUnitsFromPersistence(catalog.businessUnits);
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
