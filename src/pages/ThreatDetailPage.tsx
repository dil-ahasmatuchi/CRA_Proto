import CloseIcon from "@diligentcorp/atlas-react-bundle/icons/Close";
import TableIcon from "@diligentcorp/atlas-react-bundle/icons/Table";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import { RelationCard } from "../components/RelationCard.js";
import ThreatDetailAssessmentsTab from "../components/ThreatDetailAssessmentsTab.js";
import ThreatDetailHeader from "../components/ThreatDetailHeader.js";
import {
  Alert,
  Autocomplete,
  Box,
  Button,
  Checkbox,
  Container,
  FormControl,
  FormLabel,
  InputLabel,
  Link,
  ListItemText,
  MenuItem,
  Select,
  Snackbar,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Navigate, useLocation, useNavigate, useParams } from "react-router";

import type {
  MockThreatAttachment,
  ThreatActor,
  ThreatAttackVector,
  ThreatDomain,
  ThreatSource,
  ThreatStatus,
} from "../data/types.js";
import {
  THREAT_ACTOR_OPTIONS,
  THREAT_ATTACK_VECTOR_OPTIONS,
  THREAT_SOURCE_OPTION_DETAILS,
} from "../data/types.js";
import { getThreatById } from "../data/threats.js";
import { joinUserFullNames, mockUserEmail, users } from "../data/users.js";
import {
  rowsForThreatAssetIds,
  rowsForThreatCyberRiskIds,
  rowsForThreatVulnerabilityIds,
} from "../utils/threatRelationshipRows.js";

/** Atlas user-lookup `Autocomplete` option shape (`OptionType.user`). */
type ThreatOwnerLookupOption = {
  id: string;
  label: string;
  email: string;
  type: "user";
};

const THREAT_DOMAINS: ThreatDomain[] = [
  "Identity & Access Management",
  "Endpoint & Device",
  "Network & Infrastructure",
  "Application & API",
  "Data & Information",
  "Cloud & Virtualisation",
  "Physical & Facilities",
  "Supply Chain & Third Party",
  "Operational Technology (OT/ICS)",
  "People & Workforce",
];

/** Keeps labels readable (sentence case, no theme small-caps). */
const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

function formatDetailDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

interface MultiComboBoxOption {
  value: string;
  label: string;
}

interface MultiComboBoxProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  options: MultiComboBoxOption[];
}

function MultiComboBox({ label, value, onChange, options }: MultiComboBoxProps) {
  const { tokens } = useTheme();

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx}>{label}</InputLabel>
      <Select
        multiple
        displayEmpty
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as string[])}
        renderValue={(selected) => {
          const vals = selected as string[];
          if (vals.length === 0) {
            return (
              <Box
                component="span"
                sx={{
                  color: tokens.semantic.color.type.muted.value,
                  pointerEvents: "none",
                }}
              >
                Choose multiple options
              </Box>
            );
          }
          const labels = vals.map((v) => options.find((o) => o.value === v)?.label ?? v);
          if (vals.length === 1) return labels[0];
          return (
            <>
              <Box component="span" sx={{ mr: 0.5 }}>
                ({vals.length})
              </Box>
              {labels.join(", ")}
            </>
          );
        }}
      >
        {options.map((o) => (
          <MenuItem key={o.value} value={o.value}>
            <Checkbox checked={value.includes(o.value)} size="small" disableRipple />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function ThreatDetailPage() {
  const { threatId } = useParams<{ threatId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

  const threat = threatId ? getThreatById(threatId) : undefined;

  const [tab, setTab] = useState(0);
  const [name, setName] = useState("");
  const [displayId, setDisplayId] = useState("");
  const [ownerIds, setOwnerIds] = useState<string[]>([]);
  const [sources, setSources] = useState<ThreatSource[]>([]);
  const [threatActors, setThreatActors] = useState<ThreatActor[]>([]);
  const [attackVectors, setAttackVectors] = useState<ThreatAttackVector[]>([]);
  const [status, setStatus] = useState<ThreatStatus>("Draft");
  const [domain, setDomain] = useState<ThreatDomain>("Identity & Access Management");
  const [description, setDescription] = useState("");
  const [attachments, setAttachments] = useState<MockThreatAttachment[]>([]);

  useEffect(() => {
    if (!threat) return;
    setName(threat.name);
    setDisplayId(threat.displayId);
    setOwnerIds([...threat.ownerIds]);
    setSources([...threat.sources]);
    setThreatActors([...threat.threatActors]);
    setAttackVectors([...threat.attackVectors]);
    setStatus(threat.status);
    setDomain(threat.domain);
    setDescription(threat.description);
    setAttachments([...threat.attachments]);
  }, [threat]);

  useEffect(() => {
    setTab(0);
  }, [threatId]);

  const [toastOpen, setToastOpen] = useState(false);

  useEffect(() => {
    const st = location.state as { showCreatedToast?: boolean } | null;
    if (st?.showCreatedToast) {
      setToastOpen(true);
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const metaNow = useMemo(() => formatDetailDate(new Date()), []);
  const createdBy = joinUserFullNames(ownerIds, "—");

  const threatOwnerLookupOptions = useMemo((): ThreatOwnerLookupOption[] => {
    return users.map((u) => ({
      id: u.id,
      label: u.fullName,
      email: mockUserEmail(u),
      type: "user" as const,
    }));
  }, []);

  const selectedThreatOwners = useMemo((): ThreatOwnerLookupOption[] => {
    return ownerIds
      .map((id) => threatOwnerLookupOptions.find((o) => o.id === id))
      .filter((o): o is ThreatOwnerLookupOption => o != null);
  }, [ownerIds, threatOwnerLookupOptions]);

  const handleToastClose = useCallback(() => {
    setToastOpen(false);
  }, []);

  const attachmentFileInputRef = useRef<HTMLInputElement>(null);

  const openAttachmentFilePicker = useCallback(() => {
    attachmentFileInputRef.current?.click();
  }, []);

  const addAttachmentFiles = useCallback((fileList: FileList | null) => {
    if (!fileList?.length) return;
    setAttachments((prev) => [
      ...prev,
      ...Array.from(fileList).map((file, i) => ({
        id: `att-${Date.now()}-${i}-${file.name}`,
        fileName: file.name,
      })),
    ]);
  }, []);

  const handleAttachmentFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      addAttachmentFiles(e.target.files);
      e.target.value = "";
    },
    [addAttachmentFiles],
  );

  const handleAttachmentDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleAttachmentDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      addAttachmentFiles(e.dataTransfer.files);
    },
    [addAttachmentFiles],
  );

  const toastAction = (
    <Button variant="text" size="medium" onClick={handleToastClose}>
      <CloseIcon aria-label="Dismiss notification" />
    </Button>
  );

  const relationshipLinkUnlinkAction = (
    <Button variant="text" size="small">
      Link / Unlink
    </Button>
  );

  const relationshipAssetRows = useMemo(
    () => (threat ? rowsForThreatAssetIds(threat.assetIds) : []),
    [threat],
  );
  const relationshipVulnerabilityRows = useMemo(
    () => (threat ? rowsForThreatVulnerabilityIds(threat.vulnerabilityIds) : []),
    [threat],
  );
  const relationshipCyberRiskRows = useMemo(
    () => (threat ? rowsForThreatCyberRiskIds(threat.cyberRiskIds) : []),
    [threat],
  );

  if (!threatId || !threat) {
    return <Navigate to="/cyber-risk/threats" replace />;
  }

  const pageTitleText = name.trim() || threat.name;

  return (
    <Container sx={{ py: 2, pb: 4 }}>
      <Stack gap={2}>
        <ThreatDetailHeader
          pageTitle={pageTitleText}
          threatId={threat.id}
          displayId={displayId}
          metaNow={metaNow}
          createdBy={createdBy}
          status={status}
          onStatusChange={setStatus}
          tab={tab}
          onTabChange={setTab}
        />

        {tab === 0 && (
          <Box
            role="tabpanel"
            id="threat-panel-0"
            aria-labelledby="threat-tab-0"
            sx={{ pt: 2 }}
          >
            <Stack
              sx={({ tokens }) => ({
                width: "100%",
                gap: tokens.core.spacing["6"].value,
              })}
            >
              {/* Row 1: Name (6/12), Threat domain (4/12), Custom ID (2/12); 16px gutters (core.spacing["2"]) */}
              <Box
                sx={({ tokens }) => ({
                  display: "grid",
                  width: "100%",
                  columnGap: tokens.core.spacing["2"].value,
                  rowGap: tokens.core.spacing["2"].value,
                  gridTemplateColumns: {
                    xs: "minmax(0, 1fr)",
                    md: "repeat(12, minmax(0, 1fr))",
                  },
                })}
              >
                <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 6" }, minWidth: 0 }}>
                  <FormControl fullWidth sx={{ gap: 0 }} required>
                    <FormLabel htmlFor="threat-detail-name" sx={fieldLabelSx}>
                      Name
                    </FormLabel>
                    <TextField
                      id="threat-detail-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Short, recognisable label"
                      fullWidth
                      required
                      margin="none"
                      sx={{ mt: 0 }}
                    />
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 4" }, minWidth: 0 }}>
                  <FormControl fullWidth margin="none">
                    <InputLabel id="threat-domain-label" sx={fieldLabelSx}>
                      Threat domain
                    </InputLabel>
                    <Select
                      labelId="threat-domain-label"
                      value={domain}
                      label="Threat domain"
                      onChange={(e) => setDomain(e.target.value as ThreatDomain)}
                    >
                      {THREAT_DOMAINS.map((d) => (
                        <MenuItem key={d} value={d}>
                          {d}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
                <Box sx={{ gridColumn: { xs: "1 / -1", md: "span 2" }, minWidth: 0 }}>
                  <FormControl fullWidth sx={{ gap: 0 }}>
                    <FormLabel htmlFor="threat-detail-custom-id" sx={fieldLabelSx}>
                      Custom ID
                    </FormLabel>
                    <TextField
                      id="threat-detail-custom-id"
                      value={displayId}
                      onChange={(e) => setDisplayId(e.target.value)}
                      placeholder="e.g. T-0001"
                      fullWidth
                      margin="none"
                      sx={{ mt: 0 }}
                    />
                  </FormControl>
                </Box>
              </Box>

              {/* Row 2: Source types, actors, attack vectors */}
              <Stack direction={{ xs: "column", md: "row" }} spacing={2} sx={{ width: "100%" }}>
                <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                  <MultiComboBox
                    label="Threat source type"
                    value={sources}
                    onChange={(v) => setSources(v as ThreatSource[])}
                    options={THREAT_SOURCE_OPTION_DETAILS.map((o) => ({
                      value: o.value,
                      label: o.caption,
                    }))}
                  />
                </Box>
                <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                  <MultiComboBox
                    label="Threat actor"
                    value={threatActors}
                    onChange={(v) => setThreatActors(v as ThreatActor[])}
                    options={THREAT_ACTOR_OPTIONS.map((a) => ({ value: a, label: a }))}
                  />
                </Box>
                <Box sx={{ flex: "1 1 0", minWidth: 0 }}>
                  <MultiComboBox
                    label="Attack vector"
                    value={attackVectors}
                    onChange={(v) => setAttackVectors(v as ThreatAttackVector[])}
                    options={THREAT_ATTACK_VECTOR_OPTIONS.map((v) => ({ value: v, label: v }))}
                  />
                </Box>
              </Stack>

              {/* Row 3: Description (full width) */}
              <Box sx={{ width: "100%" }}>
                <FormControl fullWidth sx={{ gap: 0 }}>
                  <FormLabel htmlFor="threat-detail-description" sx={fieldLabelSx}>
                    Description
                  </FormLabel>
                  <TextField
                    id="threat-detail-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="What the threat is, how it manifests, and what it targets"
                    fullWidth
                    margin="none"
                    multiline
                    minRows={4}
                    sx={{ mt: 0 }}
                  />
                </FormControl>
              </Box>

              {/* Row 4: Owner (full width) */}
              <Box sx={{ width: "100%" }}>
                <FormControl fullWidth margin="none">
                  <Autocomplete
                    multiple
                    id="threat-detail-owner-lookup"
                    options={threatOwnerLookupOptions as never}
                    value={selectedThreatOwners as never}
                    onChange={(_, newValue) => setOwnerIds(newValue.map((o) => o.id))}
                    getOptionLabel={(option) => option.label}
                    isOptionEqualToValue={(a, b) => a.id === b.id}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Owner"
                        placeholder="Select users..."
                        margin="none"
                      />
                    )}
                    renderOption={AutocompletePresets.userLookup.renderOption}
                    renderTags={AutocompletePresets.userLookup.type.multiple.renderTags}
                  />
                </FormControl>
              </Box>

              {/* Row 5: Attachments (full width) */}
              <Stack spacing={1} sx={{ width: "100%" }}>
                <Typography
                  variant="caption"
                  fontWeight={600}
                  component="p"
                  sx={({ tokens: t }) => ({
                    color: t.semantic.color.type.default.value,
                    letterSpacing: "0.3px",
                    m: 0,
                    maxWidth: 600,
                  })}
                >
                  Attachments
                </Typography>

                <input
                  ref={attachmentFileInputRef}
                  type="file"
                  hidden
                  multiple
                  accept=".jpg,.jpeg,.pdf,.xls,.xlsx"
                  onChange={handleAttachmentFileInputChange}
                />

                <Box
                  onDragOver={handleAttachmentDragOver}
                  onDrop={handleAttachmentDrop}
                  role="region"
                  aria-label="Attachment upload area. Drag files here or use the link to select files."
                  sx={({ tokens: t }) => ({
                    borderStyle: "dashed",
                    borderWidth: t.semantic.borderWidth.thin.value,
                    borderColor: t.semantic.color.outline.default.value,
                    borderRadius: t.semantic.radius.lg.value,
                    px: 3,
                    py: 3,
                    width: "100%",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 3,
                    "&:hover": {
                      borderColor: t.semantic.color.outline.hover.value,
                      backgroundColor: t.semantic.color.action.secondary.hoverFill.value,
                    },
                  })}
                >
                  <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                    <UploadIcon aria-hidden size="lg" />
                    <Typography
                      component="p"
                      variant="body1"
                      sx={({ tokens: t }) => ({
                        m: 0,
                        textAlign: "center",
                        color: t.semantic.color.type.default.value,
                        letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                      })}
                    >
                      Drag files here or{" "}
                      <Link
                        component="button"
                        type="button"
                        onClick={openAttachmentFilePicker}
                        sx={({ tokens: t }) => ({
                          verticalAlign: "baseline",
                          fontSize: t.semantic.font.text.md.fontSize.value,
                          lineHeight: t.semantic.font.text.md.lineHeight.value,
                          letterSpacing: t.semantic.font.text.md.letterSpacing.value,
                          fontWeight: 600,
                          textDecoration: "underline",
                          color: t.semantic.color.action.link.default.value,
                          cursor: "pointer",
                          border: "none",
                          background: "none",
                          padding: 0,
                          fontFamily: "inherit",
                        })}
                      >
                        select files to upload
                      </Link>
                    </Typography>
                  </Stack>
                  <Stack alignItems="center" gap={0.5} sx={{ width: "100%" }}>
                    <Typography
                      variant="caption"
                      sx={({ tokens: t }) => ({
                        m: 0,
                        textAlign: "center",
                        color: t.semantic.color.type.muted.value,
                        letterSpacing: "0.3px",
                        width: "100%",
                      })}
                    >
                      Formats: JPG, PDF, XLS
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={({ tokens: t }) => ({
                        m: 0,
                        textAlign: "center",
                        color: t.semantic.color.type.muted.value,
                        letterSpacing: "0.3px",
                        width: "100%",
                      })}
                    >
                      Max. file size: 5 MB
                    </Typography>
                  </Stack>
                </Box>

                {attachments.length > 0 ? (
                  <Stack component="ul" sx={{ pl: 2.5, m: 0 }} spacing={0.5}>
                    {attachments.map((a) => (
                      <Typography key={a.id} component="li" variant="textSm">
                        {a.fileName}
                      </Typography>
                    ))}
                  </Stack>
                ) : null}
              </Stack>
            </Stack>
          </Box>
        )}

        {tab === 1 && (
          <Box
            role="tabpanel"
            id="threat-panel-1"
            aria-labelledby="threat-tab-1"
            sx={{ py: 3 }}
          >
            <Stack spacing={3}>
              <RelationCard
                objectTypeTitle="Assets"
                linkedObjectsNounPhrase="assets"
                icon={<TableIcon aria-hidden />}
                items={relationshipAssetRows}
                headerAction={relationshipLinkUnlinkAction}
              />
              <RelationCard
                objectTypeTitle="Vulnerabilities"
                linkedObjectsNounPhrase="vulnerabilities"
                icon={<TableIcon aria-hidden />}
                items={relationshipVulnerabilityRows}
                headerAction={relationshipLinkUnlinkAction}
              />
              <RelationCard
                objectTypeTitle="Cyber risks"
                linkedObjectsNounPhrase="cyber risks"
                icon={<TableIcon aria-hidden />}
                items={relationshipCyberRiskRows}
                headerAction={relationshipLinkUnlinkAction}
              />
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Box
            role="tabpanel"
            id="threat-panel-2"
            aria-labelledby="threat-tab-2"
            sx={{ py: 3 }}
          >
            <Typography variant="textMd" sx={({ tokens }) => ({ color: tokens.semantic.color.type.muted.value })}>
              Threat intelligence sources and context will appear here.
            </Typography>
          </Box>
        )}

        {tab === 3 && (
          <Box
            role="tabpanel"
            id="threat-panel-3"
            aria-labelledby="threat-tab-3"
            sx={{ py: 3 }}
          >
            <ThreatDetailAssessmentsTab threatId={threat.id} threatAssetIds={threat.assetIds} />
          </Box>
        )}
      </Stack>

      <Snackbar
        open={toastOpen}
        autoHideDuration={6000}
        onClose={handleToastClose}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity="success"
          onClose={handleToastClose}
          action={toastAction}
          aria-live="polite"
          variant="standard"
        >
          Threat category successfully added.
        </Alert>
      </Snackbar>
    </Container>
  );
}
