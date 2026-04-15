import { StatusIndicator as StatusIndicatorFallback } from "@diligentcorp/atlas-react-bundle";
import CheckedIcon from "@diligentcorp/atlas-react-bundle/icons/Checked";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import {
  Box,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  useTheme,
} from "@mui/material";
import type { Theme } from "@mui/material/styles";
import { useMemo, useRef, useState, type ReactNode } from "react";

export type LensTokens = Theme extends { tokens: infer T } ? T : never;

/** Atlas StatusIndicator `color` tokens — used for control-style dropdown dots. */
export type StatusIndicatorSemanticColor =
  | "warning"
  | "success"
  | "error"
  | "information"
  | "generic"
  | "subtle";

/** Solid fills for menu dots (Chip shape-only mode can render hollow in menus; Box + tokens is reliable). */
function statusDotFill(
  tokens: LensTokens,
  color: StatusIndicatorSemanticColor,
): string {
  const s = tokens.semantic.color;
  switch (color) {
    case "warning":
      return s.status.warning.default.value;
    case "success":
      return s.status.success.default.value;
    case "error":
      return s.status.error.default.value;
    case "information":
      return s.status.notification.default.value;
    case "generic":
      return s.status.neutral.backgroundVariant.value;
    case "subtle":
      return s.surface.variant.value;
    default:
      return s.status.neutral.backgroundVariant.value;
  }
}

/** Matches control status colours in `ControlsPage.tsx` (`STATUS_COLOR_MAP`). */
export const CONTROL_STATUS_INDICATOR_COLORS: Record<
  "Draft" | "Active" | "Archived",
  StatusIndicatorSemanticColor
> = {
  Active: "success",
  Archived: "generic",
  Draft: "subtle",
};

interface StatusDropdownProps {
  value: string;
  options: string[];
  onChange: (value: string) => void;
  "aria-label"?: string;
  /** Override color for specific labels. Keys are label strings, values are StatusIndicator color tokens. */
  colorMap?: Record<string, StatusIndicatorSemanticColor>;
  /**
   * When set, menu dot fills use this resolver (e.g. match `AssessmentStatus` pill colours).
   * Prefer this when using `renderChip` so dots align with the custom chip.
   */
  resolveDotFill?: (option: string, tokens: LensTokens) => string;
  /** When set, replaces the default StatusIndicator chip (e.g. custom assessment status styling). */
  renderChip?: (args: { value: string }) => ReactNode;
  /**
   * Labels shown in the menu for context only; they are not clickable and do not call `onChange`.
   * Use for derived or terminal states (e.g. Approved, Overdue).
   */
  nonSelectableOptions?: readonly string[];
}

function statusColorForLabel(
  label: string,
  colorMap?: Record<string, StatusIndicatorSemanticColor>,
): StatusIndicatorSemanticColor {
  if (colorMap && Object.prototype.hasOwnProperty.call(colorMap, label)) {
    return colorMap[label]!;
  }
  return (
    CONTROL_STATUS_INDICATOR_COLORS[label as keyof typeof CONTROL_STATUS_INDICATOR_COLORS] ??
    "subtle"
  );
}

/**
 * Displays the current status as a StatusIndicator chip with an expand chevron.
 * Clicking opens a dropdown menu to select a new status value.
 *
 * Chip colours follow the control status mapping (Draft → subtle, Active → success,
 * Archived → generic). Unknown labels fall back to subtle.
 * Pass `colorMap` to override colours for specific label strings (e.g. assessment phases).
 */
export default function StatusDropdown({
  value,
  options,
  onChange,
  "aria-label": ariaLabel = "Status",
  colorMap,
  resolveDotFill,
  renderChip,
  nonSelectableOptions = [],
}: StatusDropdownProps) {
  const { presets, tokens } = useTheme();
  const nonSelectableSet = useMemo(
    () => new Set(nonSelectableOptions),
    [nonSelectableOptions],
  );
  const StatusIndicator =
    presets.StatusIndicatorPresets?.components.StatusIndicator ?? StatusIndicatorFallback;

  const anchorRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setOpen(true);
    }
  };

  const handleSelect = (option: string) => {
    onChange(option);
    handleClose();
  };

  return (
    <>
      <Box
        ref={anchorRef}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={handleOpen}
        onKeyDown={handleKeyDown}
        sx={{
          display: "inline-flex",
          alignItems: "center",
          gap: 0.5,
          cursor: "pointer",
          userSelect: "none",
          "&:focus-visible": {
            outline: `2px solid ${tokens.semantic.color.ui.focusRing.value}`,
            outlineOffset: 2,
            borderRadius: 1,
          },
        }}
      >
        {renderChip ? (
          renderChip({ value })
        ) : (
          <StatusIndicator color={statusColorForLabel(value, colorMap)} label={value} />
        )}
        <Box
          aria-hidden
          sx={{
            display: "flex",
            alignItems: "center",
            fontSize: 24,
            color: tokens.semantic.color.type.muted.value,
          }}
        >
          <ExpandDownIcon />
        </Box>
      </Box>

      <Menu
        anchorEl={anchorRef.current}
        open={open}
        onClose={handleClose}
        slotProps={{
          list: {
            role: "listbox",
            "aria-label": ariaLabel,
          },
        }}
      >
        {options.map((option) => {
          const selected = option === value;
          const isNonSelectable = nonSelectableSet.has(option);
          const dotFill = resolveDotFill
            ? resolveDotFill(option, tokens)
            : statusDotFill(tokens, statusColorForLabel(option, colorMap));

          return (
            <MenuItem
              key={option}
              disabled={isNonSelectable}
              selected={selected}
              role="option"
              aria-selected={selected}
              onClick={() => {
                if (!isNonSelectable) handleSelect(option);
              }}
              sx={
                isNonSelectable
                  ? ({ tokens: t }) => ({
                      "&.Mui-disabled": {
                        opacity: 1,
                        color: t.semantic.color.type.default.value,
                        WebkitTextFillColor: t.semantic.color.type.default.value,
                      },
                    })
                  : undefined
              }
            >
              <ListItemIcon
                sx={{
                  minWidth: 36,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  component="span"
                  aria-hidden
                  sx={({ tokens: t }) => ({
                    width: t.core.spacing[2].value,
                    height: t.core.spacing[2].value,
                    borderRadius: "50%",
                    flexShrink: 0,
                    backgroundColor: dotFill,
                  })}
                />
              </ListItemIcon>
              <ListItemText
                primary={option}
                sx={{ flex: "1 1 auto", minWidth: 0 }}
              />
              <ListItemIcon
                sx={({ tokens: t }) => ({
                  minWidth: 40,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  color: t.semantic.color.type.muted.value,
                  visibility: selected ? "visible" : "hidden",
                })}
              >
                <CheckedIcon aria-hidden size="md" />
              </ListItemIcon>
            </MenuItem>
          );
        })}
      </Menu>
    </>
  );
}
