import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import { Stack, Tab, Tabs, useTheme } from "@mui/material";
import { NavLink, useLocation } from "react-router";

import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

export type RiskSettingsHeaderProps = {
  tab: number;
  onTabChange: (tab: number) => void;
};

const PAGE_TITLE = "Cyber risk settings";

export default function RiskSettingsHeader({ tab, onTabChange }: RiskSettingsHeaderProps) {
  const location = useLocation();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const breadcrumbItems = [
    {
      id: "parent",
      label: "Settings",
      url: location.pathname.split("/").slice(0, -1).join("/") || "/",
    },
    {
      id: "current",
      label: PAGE_TITLE,
      url: location.pathname,
    },
  ];

  return (
    <Stack
      component="section"
      aria-label="Cyber risk settings header"
      spacing={0}
      sx={{ width: "100%", alignSelf: "stretch", minWidth: 0 }}
    >
      <PageHeader
        containerProps={{
          sx: {
            marginBottom: tokens.core.spacing["0_5"].value,
          },
        }}
        pageTitle={PAGE_TITLE}
        breadcrumbs={
          <OverflowBreadcrumbs
            leadingElement={<span>Asset Manager</span>}
            items={breadcrumbItems}
            hideLastItem={true}
            aria-label="Breadcrumbs"
          >
            {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
          </OverflowBreadcrumbs>
        }
      />

      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v)}
        className="atlas-size-large"
        aria-label="Cyber risk settings sections"
        {...TabsPresets.Tabs.alignToPageHeader}
        slotProps={atlasPageHeaderTabsSlotProps}
        sx={{
          ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
          ...atlasPageHeaderNavigationTabsSx,
        }}
      >
        <Tab
          label="Scoring scales"
          id="cyber-risk-settings-tab-0"
          aria-controls="cyber-risk-settings-panel-0"
        />
        <Tab
          label="Aggregation"
          id="cyber-risk-settings-tab-1"
          aria-controls="cyber-risk-settings-panel-1"
        />
      </Tabs>
    </Stack>
  );
}
