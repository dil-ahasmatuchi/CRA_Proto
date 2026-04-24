import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import { Button, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import type { CyberRiskStatus } from "../data/types.js";
import MetaTag from "./MetaTag.js";
import RiskStatus from "./RiskStatus.js";
import StatusDropdown from "./StatusDropdown.js";
import type { StatusIndicatorSemanticColor } from "./StatusDropdown.js";
import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

const CYBER_RISK_STATUSES: CyberRiskStatus[] = [
  "Draft",
  "Identification",
  "Assessment",
  "Mitigation",
  "Monitoring",
];

const CYBER_RISK_STATUS_COLOR_MAP: Record<CyberRiskStatus, StatusIndicatorSemanticColor> = {
  Draft: "generic",
  Identification: "generic",
  Assessment: "warning",
  Mitigation: "information",
  Monitoring: "success",
};

export type RiskDetailHeaderProps = {
  pageTitle: string;
  riskId: string;
  displayId: string;
  metaNow: string;
  createdBy: string;
  lastUpdatedBy: string;
  status: CyberRiskStatus;
  onStatusChange: (status: CyberRiskStatus) => void;
  tab: number;
  onTabChange: (tab: number) => void;
  /** Persists cyber risk fields to the prototype catalog. */
  onSave?: () => void;
};

export default function RiskDetailHeader({
  pageTitle,
  riskId,
  displayId,
  metaNow,
  createdBy,
  lastUpdatedBy,
  status,
  onStatusChange,
  tab,
  onTabChange,
  onSave,
}: RiskDetailHeaderProps) {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const metaRowInset = `calc(${tokens.component.button.iconOnly.medium.width.value} + ${tokens.component.pageHeader.desktop.mainContent.gap.value})`;

  return (
    <Stack
      component="section"
      aria-label="Cyber risk detail header"
      spacing={0}
      sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}
    >
      <PageHeader
        containerProps={{
          sx: {
            marginBottom: tokens.core.spacing["0_5"].value,
          },
        }}
        pageTitle={pageTitle}
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>Asset manager</span>}
            items={[
              { id: "cyber-risks", label: "Cyber risks", url: "/cyber-risk/cyber-risks" },
              { id: "detail", label: pageTitle, url: "#" },
            ]}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) =>
              url === "#" ? (
                <Typography component="span" variant="inherit">
                  {label}
                </Typography>
              ) : (
                <NavLink to={url}>{label}</NavLink>
              )
            }
          </OverflowBreadcrumbs>
        }
        statusIndicator={
          <StatusDropdown
            value={status}
            options={CYBER_RISK_STATUSES}
            onChange={(v) => onStatusChange(v as CyberRiskStatus)}
            aria-label="Cyber risk workflow status"
            colorMap={CYBER_RISK_STATUS_COLOR_MAP}
            renderChip={({ value }) => <RiskStatus status={value as CyberRiskStatus} />}
          />
        }
        moreButton={
          onSave ? (
            <Button variant="contained" size="medium" type="button" onClick={onSave}>
              Save
            </Button>
          ) : undefined
        }
        slotProps={{
          backButton: {
            "aria-label": "Back to cyber risks",
            onClick: () => navigate("/cyber-risk/cyber-risks"),
          },
        }}
      />

      <Stack
        direction="row"
        component="div"
        flexWrap="nowrap"
        gap={1}
        sx={{
          alignItems: "center",
          marginBottom: tokens.core.spacing["2"].value,
          paddingInlineStart: metaRowInset,
        }}
      >
        <MetaTag label="ID" value={riskId} />
        <MetaTag label="Custom ID" value={displayId || "—"} />
        <MetaTag label="Created" value={metaNow} />
        <MetaTag label="Created by" value={createdBy} />
        <MetaTag label="Last updated" value={metaNow} />
        <MetaTag label="Last updated by" value={lastUpdatedBy} />
      </Stack>

      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v)}
        className="atlas-size-large"
        aria-label="Cyber risk sections"
        {...TabsPresets.Tabs.alignToPageHeader}
        slotProps={atlasPageHeaderTabsSlotProps}
        sx={{
          ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
          ...atlasPageHeaderNavigationTabsSx,
        }}
      >
        <Tab label="Details" id="risk-tab-0" aria-controls="risk-panel-0" />
        <Tab label="Relationships" id="risk-tab-1" aria-controls="risk-panel-1" />
        <Tab label="Assessments" id="risk-tab-2" aria-controls="risk-panel-2" />
        <Tab label="Mitigations" id="risk-tab-3" aria-controls="risk-panel-3" />
      </Tabs>
    </Stack>
  );
}
