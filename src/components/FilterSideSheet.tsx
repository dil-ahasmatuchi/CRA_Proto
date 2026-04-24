import { useCallback, type ReactNode } from "react";
import { Footer } from "@diligentcorp/atlas-react-bundle";
import { Button, Drawer, Stack, Typography, useTheme } from "@mui/material";

export type FilterSideSheetProps = {
  open: boolean;
  onClose: () => void;
  /** Shown in the side sheet header (e.g. "Filters"). */
  title?: string;
  /** `id` for the title; must match the drawer’s `aria-labelledby` when you use multiple side sheets. */
  titleId?: string;
  /** For `Content` region labeling; defaults to `title` or `"Filters"`. */
  contentAriaLabel?: string;
  /** Page-specific filter fields; omitted values show a short placeholder. */
  children?: ReactNode;
  /** Called when the user chooses Apply filters. If omitted, the primary action closes the sheet. */
  onApply?: () => void;
  /** Resets or clears the filter form; optional. Renders as the left “Clear filters” action when set. */
  onClear?: () => void;
  /**
   * Reverts in-sheet draft to the last applied values. Renders as “Discard” when `hasDraftFilterSelection` is
   * `true` (or legacy: when `hasAppliedFilters` is not `false` and the new prop is omitted).
   */
  onDiscard?: () => void;
  /**
   * When `false` and `onClear` is set, legacy behavior: left action becomes “Close” (`closeLabel`) and calls `onClose`
   * (only if `hasClearableFilterState` is omitted; see that prop for draft + applied “Clear filters”).
   */
  hasAppliedFilters?: boolean;
  /**
   * When `true` and `onClear` is set, left action is “Clear filters” and calls `onClear`. When `false`, left action is
   * “Close” and calls `onClose`. Omitted: `hasAppliedFilters !== false` (legacy).
   * Use `true` when the sheet draft or applied result has at least one filter to clear.
   */
  hasClearableFilterState?: boolean;
  /**
   * When `true` and `onDiscard` is set, shows Discard. When `false`, hides it. Omitted: `hasAppliedFilters !== false` (legacy).
   * For draft-based filters, pass `true` when the current draft has at least one option selected.
   */
  hasDraftFilterSelection?: boolean;
  applyLabel?: string;
  clearLabel?: string;
  discardLabel?: string;
  /** Left tertiary label when `hasAppliedFilters` is false and `onClear` is set. @default "Close" */
  closeLabel?: string;
};

const DEFAULT_TITLE = "Filters";
const DEFAULT_TITLE_ID = "filter-side-sheet-title";
const PLACEHOLDER_TEXT = "Add filter controls by passing them as children of FilterSideSheet.";

export default function FilterSideSheet({
  open,
  onClose,
  title = DEFAULT_TITLE,
  titleId = DEFAULT_TITLE_ID,
  contentAriaLabel,
  children,
  onApply,
  onClear,
  onDiscard,
  hasAppliedFilters,
  hasClearableFilterState,
  hasDraftFilterSelection,
  applyLabel = "Apply filters",
  clearLabel = "Clear filters",
  discardLabel = "Discard",
  closeLabel = "Close",
}: FilterSideSheetProps) {
  const { presets } = useTheme();
  const { SideSheetPresets } = presets;
  const { size, components } = SideSheetPresets;
  const { Header, Content } = components;

  const handlePrimary = useCallback(() => {
    if (onApply) onApply();
    else onClose();
  }, [onApply, onClose]);

  const ariaForContent = contentAriaLabel?.trim() || title;
  const showDiscard =
    Boolean(onDiscard) &&
    (hasDraftFilterSelection === undefined
      ? hasAppliedFilters !== false
      : hasDraftFilterSelection);

  const leftActionIsClear = hasClearableFilterState === undefined
    ? hasAppliedFilters !== false
    : hasClearableFilterState;
  const leftSecondaryAction =
    onClear &&
    (leftActionIsClear ? (
      <Button variant="text" onClick={onClear}>
        {clearLabel}
      </Button>
    ) : (
      <Button variant="text" onClick={onClose}>
        {closeLabel}
      </Button>
    ));

  const body = children ?? (
    <Typography
      sx={({ tokens: t }) => ({
        color: t.semantic.color.type.muted.value,
        fontSize: t.semantic.font.text.md.fontSize.value,
        lineHeight: t.semantic.font.text.md.lineHeight.value,
      })}
    >
      {PLACEHOLDER_TEXT}
    </Typography>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{ ...size.large.sx }}
      slotProps={{
        paper: {
          role: "dialog",
          "aria-labelledby": titleId,
        },
      }}
    >
      <Header
        variant="default"
        onClose={onClose}
        title={title}
        componentProps={{
          closeButton: { "aria-label": "Close filters" },
          title: { component: "h2", id: titleId },
        }}
      />

      <Content ariaLabel={ariaForContent}>
        <Stack gap={3}>{body}</Stack>
      </Content>

      <Footer
        horizontalPadding="medium"
        divided
        secondaryAction={leftSecondaryAction || undefined}
        tertiaryAction={
          showDiscard ? (
            <Button variant="text" onClick={onDiscard}>
              {discardLabel}
            </Button>
          ) : undefined
        }
        primaryAction={
          <Button variant="contained" onClick={handlePrimary}>
            {onApply ? applyLabel : "Done"}
          </Button>
        }
      />
    </Drawer>
  );
}
