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

import { assets } from "../data/assets.js";
import type { CyberRiskStatus, FivePointScaleLabel } from "../data/types.js";
import { mockUserEmail, users } from "../data/users.js";
import {
  CYBER_RISK_SCORE_FILTER_OPTIONS,
  type CyberRiskTableFilters,
} from "../utils/cyberRiskTableRows.js";

export type FilterRisksProps = {
  value: CyberRiskTableFilters;
  onChange: (next: CyberRiskTableFilters) => void;
  workflowOptions: readonly CyberRiskStatus[];
};

const fieldLabelSx = {
  textTransform: "none" as const,
  fontVariant: "normal" as const,
  mb: 0,
};

type UserLookupOption = {
  id: string;
  label: string;
  email: string;
  type: "user";
};

type AssetOption = { id: string; label: string };

type MultiSelectFieldProps<T extends string> = {
  label: string;
  value: T[];
  onChange: (next: T[]) => void;
  options: readonly { value: T; label: string }[];
  emptyPlaceholder: string;
};

function MultiSelectField<T extends string>({
  label,
  value,
  onChange,
  options,
  emptyPlaceholder,
}: MultiSelectFieldProps<T>) {
  const { tokens } = useTheme();

  return (
    <FormControl fullWidth margin="none">
      <InputLabel sx={fieldLabelSx} id={`filter-risks-${label.replace(/\s+/g, "-").toLowerCase()}-label`}>
        {label}
      </InputLabel>
      <Select
        multiple
        displayEmpty
        labelId={`filter-risks-${label.replace(/\s+/g, "-").toLowerCase()}-label`}
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
          <MenuItem key={o.value} value={o.value as string}>
            <Checkbox checked={value.includes(o.value)} size="small" disableRipple />
            <ListItemText primary={o.label} />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

export default function FilterRisks({ value, onChange, workflowOptions }: FilterRisksProps) {
  const { presets } = useTheme();
  const { AutocompletePresets } = presets;

  const workflowFieldOptions = useMemo(
    () => workflowOptions.map((s) => ({ value: s, label: s })),
    [workflowOptions],
  );

  const scoreFieldOptions = useMemo(
    () => CYBER_RISK_SCORE_FILTER_OPTIONS.map((s) => ({ value: s, label: s })),
    [],
  );

  const userLookupOptions = useMemo((): UserLookupOption[] => {
    return users.map((u) => ({
      id: u.id,
      label: u.fullName,
      email: mockUserEmail(u),
      type: "user" as const,
    }));
  }, []);

  const selectedOwners = useMemo((): UserLookupOption[] => {
    return value.ownerIds
      .map((id) => userLookupOptions.find((o) => o.id === id))
      .filter((o): o is UserLookupOption => o != null);
  }, [value.ownerIds, userLookupOptions]);

  const assetOptions = useMemo((): AssetOption[] => {
    return assets.map((a) => ({ id: a.id, label: a.name })).sort((a, b) => a.label.localeCompare(b.label));
  }, []);

  const selectedAssets = useMemo((): AssetOption[] => {
    return value.assetIds
      .map((id) => assetOptions.find((o) => o.id === id))
      .filter((o): o is AssetOption => o != null);
  }, [value.assetIds, assetOptions]);

  return (
    <Stack gap={3} component="form" aria-label="Cyber risk filters" onSubmit={(e) => e.preventDefault()}>
      <MultiSelectField
        label="Workflow status"
        value={value.workflowStatuses}
        onChange={(next) => onChange({ ...value, workflowStatuses: next })}
        options={workflowFieldOptions}
        emptyPlaceholder="Choose multiple options"
      />

      <FormControl fullWidth margin="none">
        <Autocomplete
          multiple
          id="filter-risks-owner-lookup"
          options={userLookupOptions as never}
          value={selectedOwners as never}
          onChange={(_, newValue) => onChange({ ...value, ownerIds: (newValue as UserLookupOption[]).map((o) => o.id) })}
          getOptionLabel={(option) => (option as UserLookupOption).label}
          isOptionEqualToValue={(a, b) => (a as UserLookupOption).id === (b as UserLookupOption).id}
          renderInput={(params) => (
            <TextField {...params} label="Owner" placeholder="Select users..." margin="none" />
          )}
          renderOption={AutocompletePresets.userLookup.renderOption}
          renderTags={AutocompletePresets.userLookup.type.multiple.renderTags}
        />
      </FormControl>

      <MultiSelectField
        label="Cyber risk score"
        value={value.scoreLabels}
        onChange={(next) => onChange({ ...value, scoreLabels: next as FivePointScaleLabel[] })}
        options={scoreFieldOptions}
        emptyPlaceholder="Choose multiple options"
      />

      <FormControl fullWidth margin="none">
        <Autocomplete
          multiple
          id="filter-risks-assets-lookup"
          options={assetOptions}
          value={selectedAssets}
          onChange={(_, newValue) => onChange({ ...value, assetIds: (newValue as AssetOption[]).map((a) => a.id) })}
          getOptionLabel={(o) => o.label}
          isOptionEqualToValue={(a, b) => a.id === b.id}
          renderInput={(params) => (
            <TextField {...params} label="Assets" placeholder="Search assets..." margin="none" />
          )}
        />
      </FormControl>
    </Stack>
  );
}
