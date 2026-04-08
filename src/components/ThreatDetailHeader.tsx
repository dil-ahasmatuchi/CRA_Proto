import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import CloudIcon from "@diligentcorp/atlas-react-bundle/icons/Cloud";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import { Box, IconButton, Stack, Tab, Tabs, Typography, useTheme } from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import type { ThreatStatus } from "../data/types.js";
import MetaTag from "./MetaTag.js";
import StatusDropdown from "./StatusDropdown.js";
import {
  atlasNavigationTabsSlotProps,
  atlasNavigationTabsSx,
} from "../utils/atlasNavigationTabsSx.js";

const THREAT_STATUSES: ThreatStatus[] = ["Draft", "Active", "Archived"];

export type ThreatDetailHeaderProps = {
  pageTitle: string;
  threatId: string;
  displayId: string;
  metaNow: string;
  createdBy: string;
  status: ThreatStatus;
  onStatusChange: (status: ThreatStatus) => void;
  tab: number;
  onTabChange: (tab: number) => void;
};

export default function ThreatDetailHeader({
  pageTitle,
  threatId,
  displayId,
  metaNow,
  createdBy,
  status,
  onStatusChange,
  tab,
  onTabChange,
}: ThreatDetailHeaderProps) {
  const navigate = useNavigate();
  const { presets, tokens } = useTheme();
  const { TabsPresets } = presets;

  const metaRowInset = `calc(${tokens.component.button.iconOnly.medium.width.value} + ${tokens.component.pageHeader.desktop.mainContent.gap.value})`;

  return (
    <Stack
      component="section"
      aria-label="Threat detail header"
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
              { id: "threats", label: "Threats", url: "/cyber-risk/threats" },
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
            options={THREAT_STATUSES}
            onChange={(v) => onStatusChange(v as ThreatStatus)}
            aria-label="Threat status"
          />
        }
        moreButton={
          <Stack direction="row" alignItems="center" gap={1}>
            <Stack
              direction="row"
              alignItems="center"
              gap={0.5}
              sx={({ tokens }) => ({
                color: tokens.semantic.color.type.muted.value,
              })}
            >
              <CloudIcon aria-hidden />
              <Typography variant="textSm">Saved</Typography>
            </Stack>
            <IconButton aria-label="More actions" size="small">
              <MoreIcon aria-hidden />
            </IconButton>
          </Stack>
        }
        slotProps={{
          backButton: {
            "aria-label": "Back to threats",
            onClick: () => navigate("/cyber-risk/threats"),
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
        <MetaTag label="ID" value={threatId} />
        <MetaTag label="Custom ID" value={displayId || "—"} />
        <MetaTag label="Created" value={metaNow} />
        <MetaTag label="Created by" value={createdBy} />
        <MetaTag label="Last updated" value={metaNow} />
        <MetaTag label="Last updated by" value={createdBy} />
      </Stack>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          minWidth: 0,
          alignSelf: "stretch",
          borderBottom: ({ tokens: t }) =>
            `${t.semantic.borderWidth.thin.value} solid ${t.semantic.color.ui.divider.default.value}`,
        }}
      >
        <Tabs
          value={tab}
          onChange={(_, v) => onTabChange(v)}
          className="atlas-size-large"
          aria-label="Threat sections"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={{
            ...atlasNavigationTabsSlotProps,
            indicator: {
              sx: { display: "none" },
            },
          }}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasNavigationTabsSx,
            width: "100%",
            maxWidth: "100%",
            minWidth: 0,
            boxSizing: "border-box",
            paddingInlineStart: 0,
            marginInline: 0,
            marginLeft: 0,
            marginRight: 0,
            borderBottom: "none",
            // Baseline comes from the wrapper so it spans the full container width (Atlas tab preset
            // often uses a root ::after that only spans the tab row width).
            "&::after": {
              display: "none",
            },
            "& .MuiTabs-scroller": {
              marginInline: 0,
            },
          }}
        >
          <Tab label="Details" id="threat-tab-0" aria-controls="threat-panel-0" />
          <Tab label="Relationships" id="threat-tab-1" aria-controls="threat-panel-1" />
          <Tab label="Threat intel" id="threat-tab-2" aria-controls="threat-panel-2" />
          <Tab label="Assessments" id="threat-tab-3" aria-controls="threat-panel-3" />
        </Tabs>
      </Box>
    </Stack>
  );
}
