import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import {
  Box,
  Button,
  ListItemText,
  MenuItem,
  useTheme,
  type ButtonProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
} from "react";

export type BusinessUnitOption = { id: string; label: string };

const ALL_SENTINEL_ID = "__all_business_units__";

export type BusinessUnitDropdownProps = {
  options: readonly BusinessUnitOption[];
  value: BusinessUnitOption | null;
  onChange: (value: BusinessUnitOption | null) => void;
  disabled?: boolean;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  sx?: SxProps<Theme>;
  /** Accessible name for the trigger when the label alone is insufficient. */
  "aria-label"?: string;
};

/**
 * Tertiary-style trigger (same interaction as {@link DropdownButton}) with an Atlas `DropdownBox`:
 * search field (no title / section header / footer) and selectable business units.
 */
export default function BusinessUnitDropdown({
  options,
  value,
  onChange,
  disabled,
  size = "medium",
  variant = "text",
  color = "primary",
  sx,
  "aria-label": ariaLabel = "Business unit filter",
}: BusinessUnitDropdownProps) {
  const { presets } = useTheme();
  const dropdown = presets.DropdownPresets?.components?.Dropdown;
  const DropdownBox = dropdown?.DropdownBox;
  const GetMenuItemProps = dropdown?.GetMenuItemProps ?? (() => ({} as Record<string, unknown>));

  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeId, setActiveId] = useState<string | undefined>();

  const buttonLabel = value ? `Business unit: ${value.label}` : "All business units";

  const filteredOptions = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [...options];
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, searchQuery]);

  const orderedIds = useMemo(
    () => [ALL_SENTINEL_ID, ...filteredOptions.map((o) => o.id)],
    [filteredOptions],
  );

  const handleClose = useCallback(() => {
    setSearchQuery("");
    setActiveId(undefined);
    setOpen(false);
  }, []);

  const handleSelectAll = useCallback(() => {
    onChange(null);
    handleClose();
  }, [handleClose, onChange]);

  const handleSelectOption = useCallback(
    (option: BusinessUnitOption) => {
      onChange(option);
      handleClose();
    },
    [handleClose, onChange],
  );

  const handleButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    setOpen((prev) => !prev);
  }, []);

  useEffect(() => {
    if (!open) return;
    setActiveId(undefined);
  }, [open, searchQuery]);

  const handleSearchChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.value;
    setSearchQuery(next);
    setActiveId(undefined);
  }, []);

  const handlePaperKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        handleClose();
        return;
      }

      if (e.key === "ArrowDown") {
        e.preventDefault();
        const i = activeId === undefined ? -1 : orderedIds.indexOf(activeId);
        const next = orderedIds[Math.min(i + 1, orderedIds.length - 1)];
        setActiveId(next);
        return;
      }

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const i = activeId === undefined ? orderedIds.length : orderedIds.indexOf(activeId);
        const next = orderedIds[Math.max(i - 1, 0)];
        setActiveId(next);
        return;
      }

      if (e.key === "Enter" && activeId) {
        e.preventDefault();
        if (activeId === ALL_SENTINEL_ID) {
          handleSelectAll();
        } else {
          const opt = options.find((o) => o.id === activeId);
          if (opt) handleSelectOption(opt);
        }
      }
    },
    [activeId, handleClose, handleSelectAll, handleSelectOption, options, orderedIds],
  );

  if (!DropdownBox) {
    return null;
  }

  return (
    <DropdownBox
      open={open}
      onClose={handleClose}
      searchInputProps={{
        placeholder: "Search",
        value: searchQuery,
        onChange: handleSearchChange,
        fullWidth: true,
        size: "small",
        slotProps: {
          htmlInput: {
            "aria-label": "Filter business units",
          },
        },
      }}
      paperProps={{
        onKeyDown: handlePaperKeyDown,
      }}
      mainContent={
        <>
          <MenuItem
            {...GetMenuItemProps({ active: activeId === ALL_SENTINEL_ID })}
            onClick={handleSelectAll}
          >
            <ListItemText primary="All business units" />
          </MenuItem>
          {filteredOptions.map((opt) => (
            <MenuItem
              key={opt.id}
              {...GetMenuItemProps({ active: activeId === opt.id })}
              onClick={() => handleSelectOption(opt)}
            >
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
          {filteredOptions.length === 0 && searchQuery.trim().length > 0 ? (
            <MenuItem {...GetMenuItemProps({ noHits: true })} disabled>
              <ListItemText primary="No results found" />
            </MenuItem>
          ) : null}
        </>
      }
    >
      <Button
        type="button"
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={handleButtonClick}
        endIcon={
          <Box
            component="span"
            aria-hidden
            sx={({ transitions }) => ({
              display: "inline-flex",
              alignItems: "center",
              transition: transitions.create("transform", {
                duration: transitions.duration.shorter,
              }),
              transform: open ? "rotate(180deg)" : "rotate(0deg)",
            })}
          >
            <ExpandDownIcon />
          </Box>
        }
        sx={[
          {
            width: "fit-content",
            maxWidth: "100%",
            justifyContent: "space-between",
          },
          ...(sx === undefined || sx === null ? [] : Array.isArray(sx) ? sx : [sx]),
        ]}
      >
        {buttonLabel}
      </Button>
    </DropdownBox>
  );
}
