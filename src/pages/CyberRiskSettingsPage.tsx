import { useState } from "react";

import CyberRiskScoringScalesContent from "../components/CyberRiskScoringScalesContent.js";
import PageLayout from "../components/PageLayout.js";
import Placeholder from "../components/Placeholder.js";
import RiskSettingsHeader from "../components/RiskSettingsHeader.js";

const TAB_LABELS = ["Scoring scales", "Aggregation"] as const;

export default function CyberRiskSettingsPage() {
  const [tab, setTab] = useState(0);

  return (
    <PageLayout>
      <RiskSettingsHeader tab={tab} onTabChange={setTab} />
      {TAB_LABELS.map((label, index) => (
        <div
          key={label}
          role="tabpanel"
          id={`cyber-risk-settings-panel-${index}`}
          aria-labelledby={`cyber-risk-settings-tab-${index}`}
          hidden={tab !== index}
        >
          {tab === index ? (
            index === 0 ? (
              <CyberRiskScoringScalesContent />
            ) : (
              <Placeholder>{label}</Placeholder>
            )
          ) : null}
        </div>
      ))}
    </PageLayout>
  );
}
