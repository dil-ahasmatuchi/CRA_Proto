import { AppLayout } from "@diligentcorp/atlas-react-bundle";
import { Outlet, Route, Routes } from "react-router";
import "./styles.css";

import Navigation from "./Navigation.js";
import IndexPage from "./pages/IndexPage.js";
import SettingsPage from "./pages/SettingsPage.js";
import GenericPage from "./pages/GenericPage.js";
import FileImportPage from "./pages/FileImportPage.js";
import UploadFilesPage from "./pages/UploadFilesPage.js";
import FindingsPage from "./pages/FindingsPage.js";
import CyberRiskDetailsPage from "./pages/CyberRiskDetailsPage.js";
import ThreatsPage from "./pages/ThreatsPage.js";
import CyberRiskAssessmentsPage from "./pages/CyberRiskAssessmentsPage.js";
import NewCyberRiskAssessmentPage from "./pages/NewCyberRiskAssessmentPage.js";
import NewCyberRiskAssessmentScenarioDetailPage from "./pages/NewCyberRiskAssessmentScenarioDetailPage.js";
import CyberRiskOverviewPage from "./pages/CyberRiskOverviewPage.js";
import ControlsPage from "./pages/ControlsPage.js";
import CyberRisksPage from "./pages/CyberRisksPage.js";
import MitigationPlansPage from "./pages/MitigationPlansPage.js";
import VulnerabilitiesPage from "./pages/VulnerabilitiesPage.js";

export default function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <AppLayout navigation={<Navigation />}>
            <Outlet />
          </AppLayout>
        }
      >
        <Route index element={<IndexPage />} />

        <Route
          path="all-assets"
          element={<GenericPage title="All assets" />}
        />

        <Route
          path="asset-types/information-systems"
          element={
            <GenericPage
              title="IT Information Systems"
              breadcrumbParent="Asset types"
            />
          }
        />
        <Route
          path="asset-types/file-share-assets"
          element={
            <GenericPage
              title="IT File Share Assets"
              breadcrumbParent="Asset types"
            />
          }
        />
        <Route
          path="asset-types/third-party-assets"
          element={
            <GenericPage
              title="Third-Party Assets"
              breadcrumbParent="Asset types"
            />
          }
        />

        <Route
          path="records/record-1"
          element={
            <GenericPage title="Record 1" breadcrumbParent="Records" />
          }
        />
        <Route
          path="records/record-2"
          element={
            <GenericPage title="Record 2" breadcrumbParent="Records" />
          }
        />
        <Route
          path="records/record-3"
          element={
            <GenericPage title="Record 3" breadcrumbParent="Records" />
          }
        />

        <Route
          path="cyber-risk/overview"
          element={<CyberRiskOverviewPage />}
        />
        <Route
          path="cyber-risk/cyber-risks"
          element={<CyberRisksPage />}
        />
        <Route
          path="cyber-risk/controls"
          element={<ControlsPage />}
        />
        <Route
          path="cyber-risk/threats"
          element={<ThreatsPage />}
        />
        <Route
          path="cyber-risk/mitigation-plans"
          element={<MitigationPlansPage />}
        />
        <Route
          path="cyber-risk/vulnerabilities"
          element={<VulnerabilitiesPage />}
        />
        <Route
          path="cyber-risk/cyber-risk-assessments"
          element={<CyberRiskAssessmentsPage />}
        />
        <Route
          path="cyber-risk/cyber-risk-assessments/new"
          element={<NewCyberRiskAssessmentPage />}
        />
        <Route
          path="cyber-risk/cyber-risk-assessments/new/scenario/:scenarioId"
          element={<NewCyberRiskAssessmentScenarioDetailPage />}
        />
        <Route
          path="cyber-risk/file-import"
          element={<FileImportPage />}
        />
        <Route
          path="cyber-risk/file-import/upload"
          element={<UploadFilesPage />}
        />
        <Route
          path="cyber-risk/file-import/upload/findings"
          element={<FindingsPage />}
        />
        <Route
          path="cyber-risk/cyber-risk-assessment"
          element={<CyberRiskDetailsPage />}
        />

        <Route
          path="activity"
          element={<GenericPage title="Activity" />}
        />

        <Route path="settings" element={<SettingsPage />} />
        <Route
          path="settings/platform-integrations"
          element={
            <GenericPage
              title="Platform integrations"
              breadcrumbParent="Settings"
            />
          }
        />
        <Route
          path="settings/cyber-risk-settings"
          element={
            <GenericPage
              title="Cyber risk settings"
              breadcrumbParent="Settings"
            />
          }
        />
        <Route
          path="settings/label"
          element={
            <GenericPage title="Label" breadcrumbParent="Settings" />
          }
        />
      </Route>
    </Routes>
  );
}
