import {
  Button,
  InputAdornment,
  TextField,
} from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import {
  Toolbar,
  QuickFilter,
  QuickFilterControl,
  ColumnsPanelTrigger,
} from "@mui/x-data-grid-pro";

import SearchIcon from "@diligentcorp/atlas-react-bundle/icons/Search";
import FilterIcon from "@diligentcorp/atlas-react-bundle/icons/Filter";
import ColumnsIcon from "@diligentcorp/atlas-react-bundle/icons/Columns";

export const DEFAULT_SEARCH_LABEL = "Search by";
export const DEFAULT_SEARCH_PLACEHOLDER = "Search by";
export const DEFAULT_SEARCH_FIELD_SX: SxProps<Theme> = {
  minWidth: { xs: 1, sm: 300 },
  maxWidth: 400,
};

type NewToolbarBaseProps = {
  /**
   * MUI `TextField` `label`. Pass `null` to omit the floating label (e.g. Threats / Mitigation plans style).
   * @default "Search by"
   */
  searchLabel?: string | null;
  /**
   * @default "Search by"
   */
  searchPlaceholder?: string;
  /**
   * `sx` for the quick-filter search `TextField`. Defaults match
   * [`ThreatDetailAssessmentsTab`](src/components/ThreatDetailAssessmentsTab.tsx) (responsive min width, max 400px).
   */
  searchFieldSx?: SxProps<Theme>;
};

/**
 * Discriminated union for the Filter button:
 *
 * - **`showFilterButton: false`** — omit **Filter** (search + Columns only). `onOpenFilters` is unused.
 * - **`showFilterButton` omitted or `true`** — **Filter** is shown; **`onOpenFilters` is required** (parent
 *   should open [`FilterSideSheet`](src/components/FilterSideSheet.tsx) or equivalent).
 *
 * **Search field styling:** pass `searchLabel: null` to match [ThreatsPage](src/pages/ThreatsPage.tsx) /
 * [MitigationPlansPage](src/pages/MitigationPlansPage.tsx) (placeholder-only, no floating label). Default
 * label + placeholder is `"Search by"` (e.g. [ThreatDetailAssessmentsTab](src/components/ThreatDetailAssessmentsTab.tsx)).
 */
export type NewToolbarProps = NewToolbarBaseProps &
  (
    | { showFilterButton: false; onOpenFilters?: () => void }
    | { showFilterButton?: true; onOpenFilters: () => void }
  );

/**
 * DataGrid Pro **toolbar** slot: quick text search (MUI `QuickFilter`), optional **Filter** button that
 * should open the page’s [`FilterSideSheet`](src/components/FilterSideSheet.tsx) via `onOpenFilters`, and
 * MUI **Columns** panel (`ColumnsPanelTrigger`). Does not use MUI’s `FilterPanelTrigger`.
 *
 * Use as `slots={{ toolbar: NewToolbar }}` and pass the same props the toolbar needs (see `NewToolbarProps`).
 */
export default function NewToolbar({
  searchLabel,
  searchPlaceholder = DEFAULT_SEARCH_PLACEHOLDER,
  searchFieldSx = DEFAULT_SEARCH_FIELD_SX,
  showFilterButton: showFilterButtonProp,
  onOpenFilters,
}: NewToolbarProps) {
  const showFilterButton = showFilterButtonProp !== false;

  const textFieldLabel: string | undefined =
    searchLabel === null ? undefined : (searchLabel ?? DEFAULT_SEARCH_LABEL);

  const filterButton = showFilterButton ? (
    <Button
      type="button"
      startIcon={<FilterIcon />}
      aria-label="Show filters"
      onClick={() => onOpenFilters?.()}
    >
      Filter
    </Button>
  ) : null;

  return (
    <Toolbar>
      <QuickFilter expanded>
        <QuickFilterControl
          render={({ ref, value, ...other }) => (
            <TextField
              {...other}
              inputRef={ref}
              value={value ?? ""}
              label={textFieldLabel}
              placeholder={searchPlaceholder}
              size="small"
              sx={searchFieldSx}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                  ...other.slotProps?.input,
                },
                ...other.slotProps,
              }}
            />
          )}
        />
      </QuickFilter>
      {filterButton}
      <ColumnsPanelTrigger
        render={(props) => (
          <Button {...props} startIcon={<ColumnsIcon />} aria-label="Select columns">
            Columns
          </Button>
        )}
      />
    </Toolbar>
  );
}
