import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import {
  Box,
  Button,
  Menu,
  type ButtonProps,
  type MenuProps,
  type SxProps,
  type Theme,
} from "@mui/material";
import { useCallback, useId, useState, type MouseEvent, type ReactNode } from "react";

export type DropdownButtonProps = {
  /** Visible label on the trigger button. */
  label: ReactNode;
  /** Menu contents (typically `MenuItem` nodes). Rendered inside `Menu`. */
  children: ReactNode;
  /** Accessible name when the button purpose isn’t clear from `label` alone. */
  "aria-label"?: string;
  disabled?: boolean;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
  color?: ButtonProps["color"];
  /** Optional id for the menu element; a unique id is generated when omitted. */
  menuId?: string;
  sx?: SxProps<Theme>;
  /** Overrides for the anchored `Menu` (e.g. `slotProps`, `anchorOrigin`). */
  MenuProps?: Partial<MenuProps>;
};

/**
 * Button with an end chevron that rotates when the menu opens; opens an anchored `Menu` below the trigger.
 * Defaults to tertiary styling (`variant="text"` per Atlas).
 */
export default function DropdownButton({
  label,
  children,
  "aria-label": ariaLabel,
  disabled,
  size = "medium",
  variant = "text",
  color = "primary",
  menuId: menuIdProp,
  sx,
  MenuProps,
}: DropdownButtonProps) {
  const generatedId = useId();
  const menuId = menuIdProp ?? `${generatedId}-menu`;
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);
  const open = Boolean(anchorEl);

  const handleButtonClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl((prev) => (prev ? null : event.currentTarget));
  }, []);

  const handleClose = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const {
    slotProps: menuSlotProps,
    anchorOrigin: anchorOriginProp,
    transformOrigin: transformOriginProp,
    ...restMenuProps
  } = MenuProps ?? {};

  const anchorOrigin =
    anchorOriginProp ?? ({ vertical: "bottom", horizontal: "left" } as const);
  const transformOrigin =
    transformOriginProp ?? ({ vertical: "top", horizontal: "left" } as const);

  const paperFromSlots = menuSlotProps?.paper;
  const paperSxExtra =
    paperFromSlots &&
    typeof paperFromSlots === "object" &&
    paperFromSlots !== null &&
    "sx" in paperFromSlots &&
    paperFromSlots.sx != null
      ? Array.isArray(paperFromSlots.sx)
        ? paperFromSlots.sx
        : [paperFromSlots.sx]
      : [];

  return (
    <>
      <Button
        type="button"
        variant={variant}
        color={color}
        size={size}
        disabled={disabled}
        aria-haspopup="true"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
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
        sx={sx}
      >
        {label}
      </Button>

      <Menu
        {...restMenuProps}
        id={menuId}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        slotProps={{
          ...menuSlotProps,
          paper:
            typeof paperFromSlots === "object" && paperFromSlots !== null
              ? {
                  ...paperFromSlots,
                  sx: [{ mt: 0.5 }, ...paperSxExtra],
                }
              : { sx: { mt: 0.5 } },
        }}
      >
        {children}
      </Menu>
    </>
  );
}
