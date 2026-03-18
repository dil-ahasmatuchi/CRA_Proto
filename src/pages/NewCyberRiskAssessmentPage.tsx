import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  StatusIndicator,
} from "@diligentcorp/atlas-react-bundle";
import {
  Autocomplete,
  Avatar,
  Box,
  Button,
  Chip,
  Container,
  Divider,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router";

import AttachIcon from "@diligentcorp/atlas-react-bundle/icons/Attach";
import AudioIcon from "@diligentcorp/atlas-react-bundle/icons/Audio";
import BlockquoteIcon from "@diligentcorp/atlas-react-bundle/icons/Blockquote";
import CalendarIcon from "@diligentcorp/atlas-react-bundle/icons/Calendar";
import ClearFormatIcon from "@diligentcorp/atlas-react-bundle/icons/ClearFormat";
import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import FormatAlignLeftIcon from "@diligentcorp/atlas-react-bundle/icons/FormatAlignLeft";
import FormatBoldIcon from "@diligentcorp/atlas-react-bundle/icons/FormatBold";
import FormatColorTextIcon from "@diligentcorp/atlas-react-bundle/icons/FormatColorText";
import FormatIndentDecreaseIcon from "@diligentcorp/atlas-react-bundle/icons/FormatIndentDecrease";
import FormatIndentIncreaseIcon from "@diligentcorp/atlas-react-bundle/icons/FormatIndentIncrease";
import FormatItalicIcon from "@diligentcorp/atlas-react-bundle/icons/FormatItalic";
import FormatStrikethroughIcon from "@diligentcorp/atlas-react-bundle/icons/FormatStrikethrough";
import FormatUnderlinedIcon from "@diligentcorp/atlas-react-bundle/icons/FormatUnderlined";
import HighlighterIcon from "@diligentcorp/atlas-react-bundle/icons/Highlighter";
import ImageIcon from "@diligentcorp/atlas-react-bundle/icons/Image";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import TableAlternativeIcon from "@diligentcorp/atlas-react-bundle/icons/TableAlternative";
import UnlinkIcon from "@diligentcorp/atlas-react-bundle/icons/Unlink";
import VideoIcon from "@diligentcorp/atlas-react-bundle/icons/Video";

import NewCyberRiskAssessmentScopeTab from "./NewCyberRiskAssessmentScopeTab.js";

const TAB_LABELS = [
  "Details",
  "Scope",
  "Assessment method",
  "Scoring",
  "Results",
] as const;

const DEFAULT_EMAIL_BODY = `Dear Team,

We kindly request your assistance in completing the assessment for the ongoing project. Your insights are invaluable and will greatly contribute to our success. Please take a moment to fill out the assessment at your earliest convenience.

Thank you for your cooperation!

Best regards,
The Project Management Team`;

type Assessor = {
  id: string;
  name: string;
  initials: string;
  avatarColor: "green" | "red" | "blue";
};

const ASSESSOR_OPTIONS: Assessor[] = [
  { id: "1", name: "Mark Rhodes", initials: "MR", avatarColor: "green" },
  { id: "2", name: "Marcella Johnson", initials: "MJ", avatarColor: "red" },
  { id: "3", name: "Alex Chen", initials: "AC", avatarColor: "blue" },
];

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
      id={`new-cra-tabpanel-${index}`}
      aria-labelledby={`new-cra-tab-${index}`}
    >
      {value === index ? children : null}
    </div>
  );
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      component="h2"
      sx={({ tokens: t }) => ({
        fontSize: 26,
        fontWeight: 600,
        lineHeight: "34px",
        color: t.semantic.color.type.default.value,
      })}
    >
      {children}
    </Typography>
  );
}

function WysiwygToolbar() {
  const tool = (label: string, Icon: React.ComponentType<{ "aria-hidden"?: boolean }>) => (
    <IconButton size="small" aria-label={label} sx={{ borderRadius: 1 }}>
      <Icon aria-hidden />
    </IconButton>
  );

  return (
    <Box
      sx={({ tokens: t }) => ({
        display: "flex",
        flexWrap: "wrap",
        alignItems: "center",
        gap: 0.5,
        py: 0.5,
        px: 0.5,
        borderBottom: `1px solid ${t.semantic.color.outline.default.value}`,
      })}
    >
      {tool("Bold", FormatBoldIcon)}
      {tool("Italic", FormatItalicIcon)}
      {tool("Underline", FormatUnderlinedIcon)}
      {tool("Strikethrough", FormatStrikethroughIcon)}
      {tool("Text color", FormatColorTextIcon)}
      {tool("Highlight", HighlighterIcon)}
      {tool("Clear formatting", ClearFormatIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      <IconButton size="small" aria-label="Alignment" sx={{ borderRadius: 1 }}>
        <FormatAlignLeftIcon aria-hidden />
      </IconButton>
      <IconButton size="small" aria-label="Alignment options" sx={{ borderRadius: 1 }}>
        <ExpandDownIcon aria-hidden />
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      <IconButton size="small" aria-label="List" sx={{ borderRadius: 1 }}>
        <ListIcon aria-hidden />
      </IconButton>
      <IconButton size="small" aria-label="List options" sx={{ borderRadius: 1 }}>
        <ExpandDownIcon aria-hidden />
      </IconButton>
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Increase indent", FormatIndentIncreaseIcon)}
      {tool("Decrease indent", FormatIndentDecreaseIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Table", TableAlternativeIcon)}
      {tool("Blockquote", BlockquoteIcon)}
      <Divider orientation="vertical" flexItem sx={{ mx: 0.5, minHeight: 40 }} />
      {tool("Attach file", AttachIcon)}
      {tool("Insert link", LinkIcon)}
      {tool("Remove link", UnlinkIcon)}
      {tool("Insert image", ImageIcon)}
      {tool("Insert video", VideoIcon)}
      {tool("Insert audio", AudioIcon)}
    </Box>
  );
}

function PlaceholderTab({ label }: { label: string }) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        py: 6,
        display: "flex",
        justifyContent: "center",
        color: t.semantic.color.type.muted.value,
      })}
    >
      <Typography variant="body1">{label} content</Typography>
    </Box>
  );
}

export default function NewCyberRiskAssessmentPage() {
  const navigate = useNavigate();
  const { presets } = useTheme();
  const { TabsPresets } = presets;
  const { getAvatarProps } = presets.AvatarPresets;

  const [activeTab, setActiveTab] = useState(0);
  const [name, setName] = useState("Cyber risk assessment Q1 - 2026");
  const [assessmentId] = useState("CRA-001");
  const [assessmentType, setAssessmentType] = useState("Cyber risk assessment");
  const [assessors, setAssessors] = useState<Assessor[]>([
    ASSESSOR_OPTIONS[0],
    ASSESSOR_OPTIONS[1],
  ]);
  const [subject, setSubject] = useState(
    "We kindly request your assistance in completing this assessment ",
  );
  const [emailBody, setEmailBody] = useState(DEFAULT_EMAIL_BODY);
  const [startDate, setStartDate] = useState("02 Feb 2026");
  const [dueDate, setDueDate] = useState("23 Aug 2026");

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={0}>
        <PageHeader
          pageTitle={name}
          breadcrumbs={
            <OverflowBreadcrumbs
              leadingElement={<span>Asset manager</span>}
              items={[
                {
                  id: "crm",
                  label: "Cyber risk management",
                  url: "/cyber-risk/cyber-risk-assessments",
                },
                {
                  id: "cra",
                  label: "Cyber risk analysis",
                  url: "/cyber-risk/cyber-risk-assessments",
                },
              ]}
              aria-label="Breadcrumbs"
            >
              {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
            </OverflowBreadcrumbs>
          }
          statusIndicator={
            <Box sx={{ marginBottom: "auto", marginTop: 0.5 }}>
              <StatusIndicator
                color="success"
                label="Draft"
                aria-label="Assessment status: Draft"
              />
            </Box>
          }
          moreButton={
            <Button
              variant="contained"
              size="medium"
              onClick={() => navigate("/cyber-risk/cyber-risk-assessment")}
            >
              Move to assessment
            </Button>
          }
        />

        <Tabs
          value={activeTab}
          onChange={(_e, v: number) => {
            if (v >= 3) return;
            setActiveTab(v);
          }}
          aria-label="New cyber risk assessment steps"
          {...TabsPresets.Tabs.alignToPageHeader}
          sx={[
            TabsPresets.Tabs.alignToPageHeader?.sx,
            { "& .MuiTabs-flexContainer": { gap: 0 } },
          ]}
        >
          {TAB_LABELS.map((label, index) => (
            <Tab
              key={`${label}-${index}`}
              label={label}
              id={`new-cra-tab-${index}`}
              aria-controls={`new-cra-tabpanel-${index}`}
              disabled={index >= 3}
              sx={
                index >= 3
                  ? ({ tokens: t }) => ({
                      color: `${t.semantic.color.type.muted.value} !important`,
                    })
                  : undefined
              }
            />
          ))}
        </Tabs>

        <TabPanel value={activeTab} index={0}>
          <Stack gap={4} sx={{ pt: 3, pb: 4 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              gap={2}
              flexWrap="wrap"
              alignItems={{ xs: "stretch", md: "flex-end" }}
            >
              <Box sx={{ flex: { md: "7 1 0" }, minWidth: { xs: "100%", md: 280 } }}>
                <Stack gap={1}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Name
                  </Typography>
                  <TextField
                    fullWidth
                    size="small"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    aria-label="Assessment name"
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "2 1 0" }, minWidth: { xs: "100%", md: 120 } }}>
                <Stack gap={1}>
                  <Stack direction="row" alignItems="center" gap={0.5}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      ID
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.muted.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      (Required)
                    </Typography>
                  </Stack>
                  <TextField
                    fullWidth
                    size="small"
                    value={assessmentId}
                    aria-label="Assessment ID"
                    slotProps={{ input: { readOnly: true } }}
                  />
                </Stack>
              </Box>
              <Box sx={{ flex: { md: "3 1 0" }, minWidth: { xs: "100%", md: 200 } }}>
                <FormControl fullWidth>
                  <InputLabel id="assessment-type-label" size="small">
                    Assessment type
                  </InputLabel>
                  <Select
                    labelId="assessment-type-label"
                    label="Assessment type"
                    size="small"
                    value={assessmentType}
                    onChange={(e) => setAssessmentType(e.target.value)}
                  >
                    <MenuItem value="Cyber risk assessment">Cyber risk assessment</MenuItem>
                    <MenuItem value="Other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Stack>

            <Stack gap={2}>
              <SectionHeading>Assessors</SectionHeading>
              <Stack gap={1}>
                <Stack direction="row" alignItems="center" gap={0.5} flexWrap="wrap">
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    Assessors
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.muted.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    (Required)
                  </Typography>
                </Stack>
                <Autocomplete
                  multiple
                  options={ASSESSOR_OPTIONS}
                  value={assessors}
                  onChange={(_e, v) => setAssessors(v)}
                  getOptionLabel={(o) => o.name}
                  isOptionEqualToValue={(a, b) => a.id === b.id}
                  renderTags={(tagValue, getTagProps) =>
                    tagValue.map((option, i) => {
                      const tagProps = getTagProps({ index: i });
                      return (
                        <Chip
                          {...tagProps}
                          key={option.id}
                          label={
                            <Stack direction="row" alignItems="center" gap={1}>
                              <Avatar
                                {...getAvatarProps({
                                  size: "small",
                                  color: "blue",
                                })}
                                sx={({ tokens: t }) => ({
                                  width: 24,
                                  height: 24,
                                  fontSize: 11,
                                  ...(option.avatarColor === "green" && {
                                    bgcolor: t.semantic.color.accent.green.background.value,
                                  }),
                                  ...(option.avatarColor === "red" && {
                                    bgcolor: t.semantic.color.accent.red.background.value,
                                  }),
                                  ...(option.avatarColor === "blue" && {
                                    bgcolor: t.semantic.color.surface.variant.value,
                                  }),
                                })}
                              >
                                {option.initials}
                              </Avatar>
                              <Typography variant="caption">{option.name}</Typography>
                            </Stack>
                          }
                          onDelete={tagProps.onDelete}
                          deleteIcon={<CloseIcon aria-hidden />}
                          variant="outlined"
                          sx={{ height: 32, "& .MuiChip-label": { px: 1 } }}
                        />
                      );
                    })
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      aria-label="Assessors"
                      slotProps={{
                        input: {
                          ...params.InputProps,
                          endAdornment: (
                            <>
                              <IconButton
                                size="small"
                                aria-label="Clear assessors"
                                onClick={() => setAssessors([])}
                              >
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open assessor options">
                                <ExpandDownIcon aria-hidden />
                              </IconButton>
                            </>
                          ),
                        },
                      }}
                    />
                  )}
                />
              </Stack>
            </Stack>

            <Stack gap={3}>
              <Box>
                <Typography
                  component="h3"
                  sx={({ tokens: t }) => ({
                    fontSize: 18,
                    fontWeight: 600,
                    lineHeight: "28px",
                    color: t.semantic.color.type.default.value,
                  })}
                >
                  Message
                </Typography>
                <Typography
                  variant="caption"
                  sx={({ tokens: t }) => ({
                    display: "block",
                    mt: 0.5,
                    color: t.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                    maxWidth: 560,
                  })}
                >
                  You can help increase assessor response rate by writing a customized
                  introduction and message.
                </Typography>
              </Box>

              <Stack gap={1}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                  })}
                >
                  Subject
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  aria-label="Email subject"
                />
              </Stack>

              <Stack gap={1}>
                <Stack direction="row" alignItems="center" gap={0.5}>
                  <Typography
                    variant="caption"
                    fontWeight={600}
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.default.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    E-mail message
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={({ tokens: t }) => ({
                      color: t.semantic.color.type.muted.value,
                      letterSpacing: "0.3px",
                    })}
                  >
                    (Required)
                  </Typography>
                </Stack>
                <Box
                  sx={({ tokens: t }) => ({
                    border: `1px solid ${t.semantic.color.outline.default.value}`,
                    borderRadius: t.semantic.radius.md.value,
                    overflow: "hidden",
                  })}
                >
                  <WysiwygToolbar />
                  <TextField
                    multiline
                    fullWidth
                    minRows={10}
                    value={emailBody}
                    onChange={(e) => setEmailBody(e.target.value)}
                    variant="standard"
                    InputProps={{ disableUnderline: true }}
                    sx={{ px: 1.5, py: 1.5 }}
                    aria-label="Email message body"
                  />
                </Box>
              </Stack>
            </Stack>

            <Stack gap={2}>
              <SectionHeading>Scheduling</SectionHeading>
              <Stack direction={{ xs: "column", sm: "row" }} gap={3} flexWrap="wrap">
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Start date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      aria-label="Start date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" aria-label="Clear start date">
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
                <Box sx={{ flex: { sm: "1 1 240px" }, minWidth: 194, maxWidth: 400 }}>
                  <Stack gap={1}>
                    <Typography
                      variant="caption"
                      fontWeight={600}
                      sx={({ tokens: t }) => ({
                        color: t.semantic.color.type.default.value,
                        letterSpacing: "0.3px",
                      })}
                    >
                      Due date
                    </Typography>
                    <TextField
                      size="small"
                      fullWidth
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      aria-label="Due date"
                      slotProps={{
                        input: {
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton size="small" aria-label="Clear due date">
                                <CloseIcon fontSize="small" aria-hidden />
                              </IconButton>
                              <IconButton size="small" aria-label="Open calendar">
                                <CalendarIcon aria-hidden />
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          <NewCyberRiskAssessmentScopeTab />
        </TabPanel>
        <TabPanel value={activeTab} index={2}>
          <PlaceholderTab label="Assessment method" />
        </TabPanel>
      </Stack>
    </Container>
  );
}
