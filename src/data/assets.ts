import { getFivePointLabel, padId } from "./types.js";
import type { MockAsset, AssetType, FivePointScaleValue, AssetStatus } from "./types.js";

type AssetRow = [
  name: string,
  assetType: AssetType,
  criticality: FivePointScaleValue,
  ownerIdx: number,
  buIdx: number,
  status: AssetStatus,
];

const raw: AssetRow[] = [
  ["Payment gateway", "Application", 5, 1, 2, "Active"],
  ["Customer database", "Database", 5, 2, 4, "Active"],
  ["Email server", "Server", 4, 3, 4, "Active"],
  ["CRM platform", "Application", 4, 4, 7, "Active"],
  ["ERP system", "Application", 5, 5, 2, "Active"],
  ["VPN gateway", "Network device", 4, 6, 4, "Active"],
  ["Active Directory server", "Server", 5, 7, 15, "Active"],
  ["Cloud storage service", "Cloud service", 3, 8, 11, "Active"],
  ["Web application firewall", "Network device", 4, 9, 15, "Active"],
  ["Backup storage system", "Server", 4, 10, 4, "Active"],
  ["DNS server", "Server", 5, 11, 4, "Active"],
  ["Load balancer", "Network device", 4, 12, 4, "Active"],
  ["API gateway", "Application", 4, 13, 5, "Active"],
  ["Authentication server", "Server", 5, 14, 15, "Active"],
  ["HR management system", "Application", 3, 15, 1, "Active"],
  ["Financial reporting platform", "Application", 5, 16, 2, "Active"],
  ["Data warehouse", "Database", 4, 17, 14, "Active"],
  ["Mobile app backend", "Application", 4, 18, 11, "Active"],
  ["Content management system", "Application", 3, 19, 6, "Active"],
  ["Monitoring dashboard", "Application", 3, 20, 15, "Active"],
  ["E-commerce platform", "Application", 5, 21, 7, "Active"],
  ["Internal wiki", "Application", 2, 22, 4, "Active"],
  ["Video conferencing system", "Cloud service", 3, 23, 4, "Active"],
  ["Supply chain management portal", "Application", 4, 24, 12, "Active"],
  ["Business intelligence platform", "Application", 4, 25, 14, "Active"],
  ["Customer support portal", "Application", 3, 26, 8, "Active"],
  ["CI/CD pipeline", "Application", 4, 27, 5, "Active"],
  ["Code repository", "Application", 5, 28, 5, "Active"],
  ["Container orchestration platform", "Cloud service", 4, 29, 4, "Active"],
  ["Message queue service", "Cloud service", 3, 30, 5, "Active"],
  ["Data analytics engine", "Application", 4, 31, 14, "Active"],
  ["Investor relations portal", "Application", 3, 32, 17, "Active"],
  ["Compliance management system", "Application", 4, 33, 9, "Active"],
  ["Ticketing system", "Application", 2, 34, 4, "Active"],
  ["File sharing service", "Cloud service", 3, 35, 4, "Active"],
  ["Network firewall", "Network device", 5, 36, 15, "Active"],
  ["Wireless controller", "Network device", 3, 37, 4, "Active"],
  ["Print management server", "Server", 1, 38, 20, "Active"],
  ["Endpoint management platform", "Application", 4, 39, 15, "Active"],
  ["Certificate authority", "Server", 5, 40, 15, "Active"],
  ["Time tracking system", "Application", 2, 41, 1, "Active"],
  ["Project management tool", "Cloud service", 3, 42, 11, "Active"],
  ["Social media accounts", "Cloud service", 3, 43, 6, "Active"],
  ["Marketing automation platform", "Application", 3, 44, 6, "Active"],
  ["Customer loyalty system", "Application", 3, 45, 7, "Active"],
  ["Payroll processing system", "Application", 5, 46, 1, "Active"],
  ["Document management system", "Application", 3, 47, 3, "Active"],
  ["Network access control", "Network device", 4, 48, 15, "Active"],
  ["Security operations dashboard", "Application", 4, 49, 15, "Active"],
  ["Disaster recovery environment", "Cloud service", 5, 50, 4, "Active"],
];

function emptyAssetRelationships(): MockAsset["relationships"] {
  return {
    vulnerabilityIds: [],
    threatIds: [],
    cyberRiskIds: [],
    scenarioIds: [],
  };
}

export const assets: MockAsset[] = raw.map(
  ([name, assetType, criticality, ownerIdx, buIdx, status], i) => ({
    id: padId("AST", i + 1),
    name,
    ownerId: padId("USR", ownerIdx),
    assetType,
    criticality,
    criticalityLabel: getFivePointLabel(criticality),
    businessUnitId: padId("BU", buIdx),
    status,
    vulnerabilityIds: [],
    threatIds: [],
    relationships: emptyAssetRelationships(),
  }),
);

const assetById = new Map(assets.map((a) => [a.id, a]));

export function getAssetById(id: string): MockAsset | undefined {
  return assetById.get(id);
}
