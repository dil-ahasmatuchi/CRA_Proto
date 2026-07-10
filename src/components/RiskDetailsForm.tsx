import { useState, useMemo } from "react";
import {
  Box,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  Stack,
  IconButton,
  Radio,
  RadioGroup,
  FormControlLabel,
  Divider,
  Autocomplete,
  useTheme,
} from "@mui/material";
import UploadIcon from "@diligentcorp/atlas-react-bundle/icons/Upload";
import FormatBoldIcon from "@diligentcorp/atlas-react-bundle/icons/FormatBold";
import FormatItalicIcon from "@diligentcorp/atlas-react-bundle/icons/FormatItalic";
import FormatUnderlinedIcon from "@diligentcorp/atlas-react-bundle/icons/FormatUnderlined";
import FormatStrikethroughIcon from "@diligentcorp/atlas-react-bundle/icons/FormatStrikethrough";
import FormatAlignLeftIcon from "@diligentcorp/atlas-react-bundle/icons/FormatAlignLeft";
import ListIcon from "@diligentcorp/atlas-react-bundle/icons/List";
import LinkIcon from "@diligentcorp/atlas-react-bundle/icons/Link";

import { users, mockUserEmail } from "../data/users.js";
import { orgUnits } from "../data/orgUnits.js";

type UserLookupOption = {
  id: string;
  label: string;
  email: string;
  type: "user";
};

type OrgUnitOption = {
  id: string;
  name: string;
};

interface RiskDetailsFormProps {
  initialData?: {
    name?: string;
    customId?: string;
    ownerIds?: string[];
    riskCategory?: string;
    orgUnitId?: string;
    description?: string;
    inherentLikelihood?: string;
    inherentImpact?: string;
    inherentScore?: string;
    treatmentType?: string;
    residualLikelihood?: string;
    residualImpact?: string;
    residualScore?: string;
  };
  onSave?: (data: any) => void;
}

export default function RiskDetailsForm({ initialData }: RiskDetailsFormProps) {
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

  const [name, setName] = useState(initialData?.name || "");
  const [customId, setCustomId] = useState(initialData?.customId || "");
  const [ownerIds, setOwnerIds] = useState<string[]>(initialData?.ownerIds || []);
  const [riskCategory, setRiskCategory] = useState(initialData?.riskCategory || "");
  const [orgUnitId, setOrgUnitId] = useState(initialData?.orgUnitId || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [inherentLikelihood, setInherentLikelihood] = useState(initialData?.inherentLikelihood || "");
  const [inherentImpact, setInherentImpact] = useState(initialData?.inherentImpact || "");
  const [inherentScore, setInherentScore] = useState(initialData?.inherentScore || "");
  const [treatmentType, setTreatmentType] = useState(initialData?.treatmentType || "");
  const [residualLikelihood, setResidualLikelihood] = useState(initialData?.residualLikelihood || "");
  const [residualImpact, setResidualImpact] = useState(initialData?.residualImpact || "");
  const [residualScore, setResidualScore] = useState(initialData?.residualScore || "");

  const userLookupOptions = useMemo((): UserLookupOption[] => {
    return users.map((u) => ({
      id: u.id,
      label: u.fullName,
      email: mockUserEmail(u),
      type: "user" as const,
    }));
  }, []);

  const selectedOwners = useMemo((): UserLookupOption[] => {
    return ownerIds
      .map((id) => userLookupOptions.find((o) => o.id === id))
      .filter((o): o is UserLookupOption => o != null);
  }, [ownerIds, userLookupOptions]);

  const orgUnitOptions = useMemo((): OrgUnitOption[] => {
    return orgUnits.map((ou) => ({ id: ou.id, name: ou.name }));
  }, []);

  const selectedOrgUnit = useMemo((): OrgUnitOption | null => {
    return orgUnitOptions.find((o) => o.id === orgUnitId) || null;
  }, [orgUnitId, orgUnitOptions]);

  return (
    <Box sx={{ py: 3 }}>
      <Stack gap={3}>
        {/* Name and Custom ID Row */}
        <Stack direction="row" sx={({ tokens }) => ({ gap: tokens.core.spacing["3"].value })}>
          <TextField
            label="Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Supplier Delay"
            fullWidth
            sx={{ flex: 3 }}
          />
          <TextField
            label="Custom ID"
            value={customId}
            onChange={(e) => setCustomId(e.target.value)}
            placeholder="Insert name"
            fullWidth
            sx={{ flex: 1 }}
          />
        </Stack>

        {/* Owners and Risk Category Row */}
        <Stack direction="row" sx={({ tokens }) => ({ gap: tokens.core.spacing["3"].value })}>
          <FormControl fullWidth sx={{ flex: 3 }}>
            <Autocomplete
              multiple
              id="risk-details-owner-lookup"
              options={userLookupOptions as never}
              value={selectedOwners as never}
              onChange={(_, newValue) => setOwnerIds((newValue as UserLookupOption[]).map((o) => o.id))}
              getOptionLabel={(option) => (option as UserLookupOption).label}
              isOptionEqualToValue={(a, b) => (a as UserLookupOption).id === (b as UserLookupOption).id}
              renderInput={(params) => (
                <TextField {...params} label="Owners" placeholder="Select users..." margin="none" />
              )}
              renderOption={AutocompletePresets.userLookup.renderOption}
              renderTags={AutocompletePresets.userLookup.type.multiple.renderTags}
            />
          </FormControl>
          <FormControl fullWidth sx={{ flex: 1 }}>
            <InputLabel>Risk category</InputLabel>
            <Select
              value={riskCategory}
              onChange={(e) => setRiskCategory(e.target.value)}
              label="Risk category"
              displayEmpty
            >
              <MenuItem value="">
                <em>Choose an option</em>
              </MenuItem>
              <MenuItem value="operational">Operational</MenuItem>
              <MenuItem value="financial">Financial</MenuItem>
              <MenuItem value="strategic">Strategic</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        {/* Org Unit Row */}
        <FormControl fullWidth>
          <Autocomplete
            id="risk-details-org-unit"
            options={orgUnitOptions}
            value={selectedOrgUnit}
            onChange={(_, newValue) => setOrgUnitId(newValue?.id || "")}
            getOptionLabel={(option) => option.name}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField {...params} label="Org. unit" placeholder="Select org. unit..." margin="none" />
            )}
          />
        </FormControl>

        {/* Description Rich Text Editor */}
        <Box>
          <InputLabel sx={{ position: "relative", transform: "none", mb: 1 }}>
            Description
          </InputLabel>
          <Box
            sx={({ tokens }) => ({
              border: `1px solid ${tokens.semantic.color.outline.default.value}`,
              borderRadius: 1,
            })}
          >
            {/* Toolbar */}
            <Stack
              direction="row"
              sx={({ tokens }) => ({
                borderBottom: `1px solid ${tokens.semantic.color.outline.default.value}`,
                px: 1,
                py: 0.5,
                gap: 0.5,
              })}
            >
              <IconButton size="small" aria-label="Bold">
                <FormatBoldIcon aria-hidden />
              </IconButton>
              <IconButton size="small" aria-label="Italic">
                <FormatItalicIcon aria-hidden />
              </IconButton>
              <IconButton size="small" aria-label="Underline">
                <FormatUnderlinedIcon aria-hidden />
              </IconButton>
              <IconButton size="small" aria-label="Strikethrough">
                <FormatStrikethroughIcon aria-hidden />
              </IconButton>
              <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
              <IconButton size="small" aria-label="Align">
                <FormatAlignLeftIcon aria-hidden />
              </IconButton>
              <IconButton size="small" aria-label="List">
                <ListIcon aria-hidden />
              </IconButton>
              <IconButton size="small" aria-label="Link">
                <LinkIcon aria-hidden />
              </IconButton>
            </Stack>
            {/* Text Area */}
            <TextField
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Insert description"
              fullWidth
              variant="standard"
              sx={{
                px: 2,
                py: 1.5,
                "& .MuiInputBase-root": {
                  "&:before, &:after": {
                    display: "none",
                  },
                },
              }}
            />
          </Box>
        </Box>

        {/* Attachments */}
        <Box>
          <InputLabel sx={{ position: "relative", transform: "none", mb: 1 }}>
            Attachments
          </InputLabel>
          <Box
            sx={({ tokens }) => ({
              border: `2px dashed ${tokens.semantic.color.outline.default.value}`,
              borderRadius: 1,
              p: 4,
              textAlign: "center",
              cursor: "pointer",
              "&:hover": {
                backgroundColor: tokens.semantic.color.surface.variant.value,
              },
            })}
          >
            <UploadIcon aria-hidden />
            <Typography variant="body1" color="text.secondary">
              Drag files here or{" "}
              <Typography component="span" sx={{ color: "primary.main", textDecoration: "underline" }}>
                select files to upload
              </Typography>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5, display: "block", fontSize: "0.875rem" }}>
              Max. file size: 50 MB
            </Typography>
          </Box>
        </Box>

        {/* Inherent Score Section */}
        <Box sx={({ tokens }) => ({ mt: tokens.core.spacing["4"].value })}>
          <Typography variant="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Inherent score
          </Typography>
          <Stack direction="row" sx={({ tokens }) => ({ gap: tokens.core.spacing["3"].value })}>
              <FormControl fullWidth>
                <InputLabel>Inherent likelihood</InputLabel>
                <Select
                  value={inherentLikelihood}
                  onChange={(e) => setInherentLikelihood(e.target.value)}
                  label="Inherent likelihood"
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Inherent impact</InputLabel>
                <Select
                  value={inherentImpact}
                  onChange={(e) => setInherentImpact(e.target.value)}
                  label="Inherent impact"
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Inherent score</InputLabel>
                <Select
                  value={inherentScore}
                  onChange={(e) => setInherentScore(e.target.value)}
                  label="Inherent score"
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="low">Low</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                </Select>
              </FormControl>
            </Stack>
        </Box>

        {/* Treatment Section */}
        <Box sx={({ tokens }) => ({ mt: tokens.core.spacing["4"].value })}>
          <Typography variant="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Treatment
          </Typography>
          <Typography variant="caption" fontWeight={600} sx={{ mb: 1.5, display: "block" }}>
            Treatment type
          </Typography>
          <RadioGroup
            row
            value={treatmentType}
            onChange={(e) => setTreatmentType(e.target.value)}
            sx={{
              flexWrap: "nowrap",
              gap: 4,
            }}
          >
            <FormControlLabel value="accept" control={<Radio />} label="Accept" />
            <FormControlLabel value="remediate" control={<Radio />} label="Remediate" />
            <FormControlLabel value="transfer" control={<Radio />} label="Transfer" />
            <FormControlLabel value="avoid" control={<Radio />} label="Avoid" />
          </RadioGroup>
        </Box>

        {/* Residual Score Section */}
        <Box sx={({ tokens }) => ({ mt: tokens.core.spacing["4"].value })}>
          <Typography variant="h2" sx={{ fontWeight: 600, mb: 2 }}>
            Residual score
          </Typography>
          <Stack direction="row" sx={({ tokens }) => ({ gap: tokens.core.spacing["3"].value })}>
            <FormControl fullWidth>
              <InputLabel>Residual likelihood</InputLabel>
              <Select
                value={residualLikelihood}
                onChange={(e) => setResidualLikelihood(e.target.value)}
                label="Residual likelihood"
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Residual impact</InputLabel>
              <Select
                value={residualImpact}
                onChange={(e) => setResidualImpact(e.target.value)}
                label="Residual impact"
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
            <FormControl fullWidth>
              <InputLabel>Residual score</InputLabel>
              <Select
                value={residualScore}
                onChange={(e) => setResidualScore(e.target.value)}
                label="Residual score"
              >
                <MenuItem value="">
                  <em>Select</em>
                </MenuItem>
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </Stack>
    </Box>
  );
}
