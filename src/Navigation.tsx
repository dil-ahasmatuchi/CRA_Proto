import { useState } from "react";
import {
  RoutedNavLink,
  NavSection,
} from "@diligentcorp/atlas-react-bundle/global-nav";
import HomeIcon from "@diligentcorp/atlas-react-bundle/icons/Home";
import TableIcon from "@diligentcorp/atlas-react-bundle/icons/Table";
import FolderIcon from "@diligentcorp/atlas-react-bundle/icons/Folder";
import CertCyberRiskStrategyIcon from "@diligentcorp/atlas-react-bundle/icons/CertCyberRiskStrategy";
import HistoryIcon from "@diligentcorp/atlas-react-bundle/icons/History";
import SettingsIcon from "@diligentcorp/atlas-react-bundle/icons/Settings";

export default function Navigation() {
  const [assetTypesOpen, setAssetTypesOpen] = useState(false);
  const [recordsOpen, setRecordsOpen] = useState(false);
  const [cyberRiskOpen, setCyberRiskOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  return (
    <>
      <RoutedNavLink to="/dashboard" label="Dashboard">
        <HomeIcon slot="icon" />
      </RoutedNavLink>

      <RoutedNavLink to="/all-assets" label="All assets">
        <TableIcon slot="icon" />
      </RoutedNavLink>

      <NavSection
        label="Asset types"
        isOpen={assetTypesOpen}
        isHighlighted={assetTypesOpen}
        onOpen={() => setAssetTypesOpen(true)}
        onClose={() => setAssetTypesOpen(false)}
      >
        <FolderIcon slot="icon" />
        <RoutedNavLink
          to="/asset-types/information-systems"
          label="IT Information Systems"
        />
        <RoutedNavLink
          to="/asset-types/file-share-assets"
          label="IT File Share Assets"
        />
        <RoutedNavLink
          to="/asset-types/third-party-assets"
          label="Third-Party Assets"
        />
      </NavSection>

      <NavSection
        label="Records"
        isOpen={recordsOpen}
        isHighlighted={recordsOpen}
        onOpen={() => setRecordsOpen(true)}
        onClose={() => setRecordsOpen(false)}
      >
        <FolderIcon slot="icon" />
        <RoutedNavLink to="/records/record-1" label="Record 1" />
        <RoutedNavLink to="/records/record-2" label="Record 2" />
        <RoutedNavLink to="/records/record-3" label="Record 3" />
      </NavSection>

      <NavSection
        label="Cyber risk management"
        isOpen={cyberRiskOpen}
        isHighlighted={cyberRiskOpen}
        onOpen={() => setCyberRiskOpen(true)}
        onClose={() => setCyberRiskOpen(false)}
      >
        <CertCyberRiskStrategyIcon slot="icon" />
        <RoutedNavLink to="/cyber-risk/overview" label="Overview" />
        <RoutedNavLink to="/cyber-risk/cyber-risk-assessments" label="Cyber risk assessments" />
        <RoutedNavLink to="/cyber-risk/cyber-risks" label="Cyber risks" />
        <RoutedNavLink to="/cyber-risk/controls" label="Controls" />
        <RoutedNavLink to="/cyber-risk/threats" label="Threats" />
        <RoutedNavLink to="/cyber-risk/vulnerabilities" label="Vulnerabilities" />
        <RoutedNavLink to="/cyber-risk/mitigation-plans" label="Mitigation plans" />
        {/* <RoutedNavLink to="/cyber-risk/file-import" label="File import" /> */}
      </NavSection>

      <RoutedNavLink to="/activity" label="Activity">
        <HistoryIcon slot="icon" />
      </RoutedNavLink>

      <NavSection
        label="Settings"
        isOpen={settingsOpen}
        isHighlighted={settingsOpen}
        onOpen={() => setSettingsOpen(true)}
        onClose={() => setSettingsOpen(false)}
      >
        <SettingsIcon slot="icon" />
        <RoutedNavLink to="/settings/general" label="General settings" />
        <RoutedNavLink
          to="/settings/cyber-risk-settings"
          label="Cyber risk settings"
        />
        <RoutedNavLink
          to="/settings/vulnerability-settings"
          label="Vulnerability settings"
        />
      </NavSection>
    </>
  );
}
