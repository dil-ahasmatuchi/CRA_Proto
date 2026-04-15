import {
  OverflowBreadcrumbs,
  PageHeader,
} from "@diligentcorp/atlas-react-bundle";
import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";
import {
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { useRef, useState } from "react";
import { NavLink, useNavigate } from "react-router";

import type { ThreatStatus } from "../data/types.js";
import MetaTag from "./MetaTag.js";
import StatusDropdown from "./StatusDropdown.js";
import {
  atlasPageHeaderNavigationTabsSx,
  atlasPageHeaderTabsSlotProps,
} from "../utils/atlasNavigationTabsSx.js";

const THREAT_STATUSES: ThreatStatus[] = ["Draft", "Active", "Archived"];

const THREAT_MORE_MENU_ID = "threat-detail-more-menu";

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

  const moreButtonRef = useRef<HTMLButtonElement>(null);
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);

  const handleOpenMoreMenu = () => {
    setMoreMenuOpen(true);
  };

  const handleCloseMoreMenu = () => {
    setMoreMenuOpen(false);
  };

  const handleArchiveThreat = () => {
    onStatusChange("Archived");
    handleCloseMoreMenu();
  };

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
          <>
            <Stack direction="row" alignItems="center" gap={1}>
              <Button variant="contained" size="medium" type="button">
                Save
              </Button>
              <IconButton
                ref={moreButtonRef}
                aria-label="More actions"
                aria-haspopup="true"
                aria-expanded={moreMenuOpen}
                aria-controls={moreMenuOpen ? THREAT_MORE_MENU_ID : undefined}
                size="small"
                onClick={handleOpenMoreMenu}
              >
                <MoreIcon aria-hidden />
              </IconButton>
            </Stack>
            <Menu
              anchorEl={moreButtonRef.current}
              open={moreMenuOpen}
              onClose={handleCloseMoreMenu}
              slotProps={{
                list: {
                  id: THREAT_MORE_MENU_ID,
                  role: "menu",
                  "aria-label": "More actions",
                },
              }}
            >
              <MenuItem
                disabled={status === "Archived"}
                onClick={handleArchiveThreat}
                role="menuitem"
              >
                Archive
              </MenuItem>
            </Menu>
          </>
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

      <Tabs
        value={tab}
        onChange={(_, v) => onTabChange(v)}
        className="atlas-size-large"
        aria-label="Threat sections"
        {...TabsPresets.Tabs.alignToPageHeader}
        slotProps={atlasPageHeaderTabsSlotProps}
        sx={{
          ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
          ...atlasPageHeaderNavigationTabsSx,
        }}
      >
        <Tab label="Details" id="threat-tab-0" aria-controls="threat-panel-0" />
        <Tab label="Relationships" id="threat-tab-1" aria-controls="threat-panel-1" />
        <Tab label="Assessments" id="threat-tab-2" aria-controls="threat-panel-2" />
      </Tabs>
    </Stack>
  );
}
