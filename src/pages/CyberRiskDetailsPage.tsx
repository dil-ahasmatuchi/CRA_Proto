import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Container,
  Chip,
  Link,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink } from "react-router";

import MoreIcon from "@diligentcorp/atlas-react-bundle/icons/More";

interface ScopeItem {
  id: string;
  title: string;
  url: string;
}

interface ScopeCategory {
  id: string;
  title: string;
  count: number;
  items: ScopeItem[];
}

const scopeData: ScopeCategory[] = [
  {
    id: "threats",
    title: "Threats",
    count: 5,
    items: [
      { id: "t1", title: "Ransomware deployment on critical infrastructure", url: "#" },
      { id: "t2", title: "Phishing targeting executive accounts", url: "#" },
      { id: "t3", title: "Supply chain compromise via third-party vendor", url: "#" },
      { id: "t4", title: "Insider threat from privileged access misuse", url: "#" },
      { id: "t5", title: "Distributed denial-of-service (DDoS) attack", url: "#" },
    ],
  },
  {
    id: "vulnerabilities",
    title: "Vulnerabilities",
    count: 4,
    items: [
      { id: "v1", title: "Unpatched CVE-2025-3271 in web application framework", url: "#" },
      { id: "v2", title: "Misconfigured cloud storage bucket with public access", url: "#" },
      { id: "v3", title: "Weak authentication on remote access endpoints", url: "#" },
      { id: "v4", title: "SQL injection in legacy reporting module", url: "#" },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    count: 6,
    items: [
      { id: "a1", title: "Primary database server (DB-PROD-01)", url: "#" },
      { id: "a2", title: "Customer data processing system", url: "#" },
      { id: "a3", title: "Internal HR management platform", url: "#" },
      { id: "a4", title: "Cloud-hosted API gateway", url: "#" },
      { id: "a5", title: "File share server (FS-CORP-02)", url: "#" },
      { id: "a6", title: "Email exchange server", url: "#" },
    ],
  },
  {
    id: "cyber-risks",
    title: "Cyber risks",
    count: 3,
    items: [
      { id: "r1", title: "Data breach due to unpatched vulnerability", url: "#" },
      { id: "r2", title: "Business disruption from ransomware encryption", url: "#" },
      { id: "r3", title: "Regulatory non-compliance with data protection laws", url: "#" },
    ],
  },
];

const tabLabels = ["Overview", "Scope", "Assessment", "Treatment", "Monitoring"];

function ScopeCategoryCard({ category }: { category: ScopeCategory }) {
  return (
    <Card>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" gap={1}>
            <Typography variant="h4" component="h3" fontWeight="600">
              {category.title}
            </Typography>
            <Chip label={category.count} size="small" />
          </Stack>
        }
        action={
          <Button variant="text" size="small" aria-label={`More options for ${category.title}`}>
            <MoreIcon aria-hidden />
          </Button>
        }
      />
      <CardContent>
        <Stack gap={0.5}>
          {category.items.map((item) => (
            <Box
              key={item.id}
              sx={({ tokens }) => ({
                py: 1,
                px: 1.5,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: tokens.semantic.color.surface.variant.value,
                },
              })}
            >
              <Link
                href={item.url}
                variant="body1"
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                {item.title}
              </Link>
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

function ScopeTabContent() {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
        gap: 3,
        py: 3,
      }}
    >
      {scopeData.map((category) => (
        <ScopeCategoryCard key={category.id} category={category} />
      ))}
    </Box>
  );
}

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

export default function CyberRiskDetailsPage() {
  const [activeTab, setActiveTab] = useState(1);
  const { presets } = useTheme();
  const { TabsPresets } = presets;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Container sx={{ py: 2 }}>
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
              Move to assessment
            </Button>
          }
        />

        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          aria-label="Cyber risk assessment tabs"
          {...TabsPresets.Tabs.alignToPageHeader}
          sx={[
            TabsPresets.Tabs.alignToPageHeader?.sx,
            { "& .MuiTabs-flexContainer": { gap: 0 } },
          ]}
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
          <PlaceholderContent label="Overview" />
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <ScopeTabContent />
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          <PlaceholderContent label="Assessment" />
        </TabPanel>

        <TabPanel value={activeTab} index={3}>
          <PlaceholderContent label="Treatment" />
        </TabPanel>

        <TabPanel value={activeTab} index={4}>
          <PlaceholderContent label="Monitoring" />
        </TabPanel>
      </Stack>
    </Container>
  );
}
