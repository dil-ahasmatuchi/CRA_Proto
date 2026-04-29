/**
 * Scope-assets filter sheet. Each non-empty filter **category** in `ScopeAssetTableFilters` counts once
 * toward the **Filter (n)** badge on the scope assets grid toolbar (`ScopeToolbar` + `countScopeAssetFilterCriteria`).
 */
import {
  Autocomplete,
  Box,
  Checkbox,
  FormControl,
  InputLabel,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  TextField,
  useTheme,
} from "@mui/material";
import { useMemo } from "react";

import type { AssetType, FivePointScaleValue } from "../data/types.js";
import {
  ASSET_TYPE_FILTER_OPTIONS,
  getScopeAssetOrgUnitFilterOptions,
  getScopeAssetCyberRiskFilterOptions,
  getScopeAssetObjectiveFilterOptions,
  getScopeAssetProcessFilterOptions,
  getScopeAssetThreatFilterOptions,
  getScopeAssetVulnerabilityFilterOptions,
  SCOPE_CRITICALITY_FILTER_OPTIONS,
  type ScopeAssetTableFilters,
} from "../utils/scopeAssetTableFilters.js";

export type FilterAssetsProps = {
  value: ScopeAssetTableFilters;
  onChange: (next: ScopeAssetTableFilters) => void;
};

const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

type IdName = { id: string; name: string };

type MultiSelectFieldProps<T extends string | number> = {
  label: string;
  value: T[];
  onChange: (next: T[]) => void;
  options: readonly { value: T; label: string }[];
  emptyPlaceholder: string;
  id: string;
};

function MultiSelectField<T extends string | number>({
  label,
  value,
  onChange,
  options,
  emptyPlaceholder,
  id,
}: MultiSelectFieldProps<T>) {
  const { tokens } = useTheme();
  const labelId = `filter-assets-${id}-label`;

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx} id={labelId}>
        {label}
      </InputLabel>
      <Select
        multiple
        displayEmpty
        labelId={labelId}
        value={value}
        label={label}
        onChange={(e) => onChange(e.target.value as T[])}
        renderValue={(selected) => {
          const vals = selected as T[];
          if (vals.length === 0) {
            return (
              <Box
                component="span"
                sx={{
                  color: tokens.semantic.color.type.muted.value,
                  pointerEvents: "none",
                }}
              >
                {emptyPlaceholder}
              </Box>
            );
          }
          const labels = vals.map(
            (v) => options.find((o) => o.value === v)?.label ?? String(v),
          );
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
          <MenuItem key={String(o.value)} value={o.value as never}>
            <Checkbox checked={value.includes(o.value)} size="small" disableRipple />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function IdNameAutocomplete({
  label,
  placeholder,
  fieldId,
  options,
  selectedIds,
  onSelectedIdsChange,
}: {
  label: string;
  placeholder: string;
  fieldId: string;
  options: readonly IdName[];
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
}) {
  const selected = useMemo((): IdName[] => {
    return selectedIds
      .map((id) => options.find((o) => o.id === id))
      .filter((o): o is IdName => o != null);
  }, [selectedIds, options]);

  return (
    <FormControl fullWidth margin="none">
      <Autocomplete
        multiple
        id={fieldId}
        options={[...options]}
        value={selected}
        onChange={(_, newValue) =>
          onSelectedIdsChange((newValue as IdName[]).map((o) => o.id))
        }
        getOptionLabel={(o) => o.name}
        isOptionEqualToValue={(a, b) => a.id === b.id}
        renderInput={(params) => (
          <TextField
            {...params}
            label={label}
            placeholder={placeholder}
            margin="none"
          />
        )}
        filterSelectedOptions
      />
    </FormControl>
  );
}

const assetTypeOptions: { value: AssetType; label: string }[] =
  ASSET_TYPE_FILTER_OPTIONS.map((t) => ({ value: t, label: t }));

const criticalityOptions: { value: FivePointScaleValue; label: string }[] = [
  ...SCOPE_CRITICALITY_FILTER_OPTIONS,
];

export default function FilterAssets({ value, onChange }: FilterAssetsProps) {
  const cyberRiskOptions = useMemo(
    () => getScopeAssetCyberRiskFilterOptions(),
    [],
  );
  const threatOptions = useMemo(() => getScopeAssetThreatFilterOptions(), []);
  const vulnerabilityOptions = useMemo(
    () => getScopeAssetVulnerabilityFilterOptions(),
    [],
  );
  const orgUnitOptions = useMemo(() => getScopeAssetOrgUnitFilterOptions(), []);
  const objectiveOptions = useMemo(() => getScopeAssetObjectiveFilterOptions(), []);
  const processOptions = useMemo(() => getScopeAssetProcessFilterOptions(), []);

  return (
    <Stack
      gap={3}
      component="form"
      aria-label="Scope assets filters"
      onSubmit={(e) => e.preventDefault()}
    >
      <MultiSelectField<AssetType>
        id="asset-type"
        label="Asset type"
        value={value.assetTypes}
        onChange={(next) => onChange({ ...value, assetTypes: next })}
        options={assetTypeOptions}
        emptyPlaceholder="Choose multiple options"
      />

      <IdNameAutocomplete
        fieldId="filter-assets-cyber-risks"
        label="Cyber risks"
        placeholder="Search by name..."
        options={cyberRiskOptions}
        selectedIds={value.cyberRiskIds}
        onSelectedIdsChange={(ids) => onChange({ ...value, cyberRiskIds: ids })}
      />
      <IdNameAutocomplete
        fieldId="filter-assets-threats"
        label="Threats"
        placeholder="Search by name..."
        options={threatOptions}
        selectedIds={value.threatIds}
        onSelectedIdsChange={(ids) => onChange({ ...value, threatIds: ids })}
      />
      <IdNameAutocomplete
        fieldId="filter-assets-vulnerabilities"
        label="Vulnerabilities"
        placeholder="Search by name..."
        options={vulnerabilityOptions}
        selectedIds={value.vulnerabilityIds}
        onSelectedIdsChange={(ids) =>
          onChange({ ...value, vulnerabilityIds: ids })
        }
      />

      <MultiSelectField<FivePointScaleValue>
        id="criticality"
        label="Criticality"
        value={value.criticality}
        onChange={(next) => onChange({ ...value, criticality: next })}
        options={criticalityOptions}
        emptyPlaceholder="Choose multiple options"
      />

      <IdNameAutocomplete
        fieldId="filter-assets-objectives"
        label="Objectives"
        placeholder="Search by title..."
        options={objectiveOptions}
        selectedIds={value.objectiveIds}
        onSelectedIdsChange={(ids) => onChange({ ...value, objectiveIds: ids })}
      />
      <IdNameAutocomplete
        fieldId="filter-assets-processes"
        label="Processes"
        placeholder="Search by title..."
        options={processOptions}
        selectedIds={value.processIds}
        onSelectedIdsChange={(ids) => onChange({ ...value, processIds: ids })}
      />
      <IdNameAutocomplete
        fieldId="filter-assets-org-units"
        label="Org. units"
        placeholder="Search by name..."
        options={orgUnitOptions}
        selectedIds={value.orgUnitIds}
        onSelectedIdsChange={(ids) => onChange({ ...value, orgUnitIds: ids })}
      />
    </Stack>
  );
}
