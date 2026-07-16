import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Container,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink } from "react-router";

import {
  atlasNavigationTabsSlotProps,
  atlasNavigationTabsSx,
} from "../utils/atlasNavigationTabsSx.js";
import RiskDetailsForm from "../components/RiskDetailsForm.js";

const tabLabels = ["Details", "Relationships", "Risk assessments", "Risk mitigations", "Questionnaires"];

function TabPanel({
  children,
  value,
  index,
}: {
  children: React.ReactNode;
  value: number;
  index: number;
}) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`tabpanel-${index}`}
      aria-labelledby={`tab-${index}`}
    >
      {value === index && children}
    </div>
  );
}

function PlaceholderContent({ label }: { label: string }) {
  return (
    <Box
      sx={{
        py: 6,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Typography
        variant="body1"
        sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}
      >
        {label} content
      </Typography>
    </Box>
  );
}

export default function RiskDetailsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const { presets } = useTheme();
  const { TabsPresets } = presets;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle="Cyber risk assessment Q1 - 2026"
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset Manager</span>}
              items={[
                {
                  id: "cyber-risk",
                  label: "Cyber risk management",
                  url: "/cyber-risk",
                },
                {
                  id: "file-import",
                  label: "File import",
                  url: "/cyber-risk/file-import",
                },
                {
                  id: "upload",
                  label: "Upload files",
                  url: "/cyber-risk/file-import/upload",
                },
                {
                  id: "findings",
                  label: "Findings",
                  url: "/cyber-risk/file-import/upload/findings",
                },
                {
                  id: "assessment",
                  label: "Cyber risk assessment Q1 - 2026",
                  url: "/cyber-risk/cyber-risk-assessment",
                },
              ]}
              hideLastItem={true}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          statusIndicator={
            <Box sx={{ flexShrink: 0 }}>
              <StatusIndicator
                color="generic"
                label="Draft"
                aria-label="Assessment status: Draft"
              />
            </Box>
          }
          moreButton={
            <Button variant="contained">
              Move to scoring
            </Button>
          }
        />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          className="atlas-size-large"
          aria-label="Cyber risk assessment tabs"
          {...TabsPresets.Tabs.alignToPageHeader}
          slotProps={atlasNavigationTabsSlotProps}
          sx={{
            ...(TabsPresets.Tabs.alignToPageHeader?.sx as Record<string, unknown> | undefined),
            ...atlasNavigationTabsSx,
          }}
        >
          {tabLabels.map((label, index) => (
            <Tab
              key={label}
              label={label}
              id={`tab-${index}`}
              aria-controls={`tabpanel-${index}`}
            />
          ))}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <RiskDetailsForm />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <PlaceholderContent label="Relationships" />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PlaceholderContent label="Risk assessments" />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <PlaceholderContent label="Risk mitigations" />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <PlaceholderContent label="Questionnaires" />
        </TabPanel>
      </Stack>
    </Container>
  );
}
