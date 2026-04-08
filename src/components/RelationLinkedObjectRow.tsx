import { StatusIndicator } from "@diligentcorp/atlas-react-bundle";
import UnlinkIcon from "@diligentcorp/atlas-react-bundle/icons/Unlink";
import { Box, IconButton, Link, Stack, Typography } from "@mui/material";
import type { SxProps, Theme } from "@mui/material/styles";
import type { ReactNode } from "react";

export type RelationLinkedObjectStatusColor =
  | "success"
  | "information"
  | "warning"
  | "error"
  | "generic"
  | "subtle";

export type RelationLinkedObjectRowProps = {
  /** Stable key for list rendering */
  itemKey: string;
  objectId: string;
  objectName: string;
  idHref?: string;
  onIdClick?: () => void;
  nameHref?: string;
  onNameClick?: () => void;
  status?: { label: string; color: RelationLinkedObjectStatusColor };
  trailing?: {
    label: string;
    ragLabel: string;
    ragSwatchSx: SxProps<Theme>;
  };
  onUnlink?: () => void;
  unlinkAriaLabel?: string;
};

function IdOrNameLink({
  children,
  href,
  onClick,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
}) {
  if (href) {
    return (
      <Link href={href} variant="labelLg" underline="always" color="inherit">
        {children}
      </Link>
    );
  }
  if (onClick) {
    return (
      <Link
        component="button"
        type="button"
        variant="labelLg"
        underline="always"
        color="inherit"
        onClick={onClick}
        sx={{
          verticalAlign: "baseline",
          cursor: "pointer",
          border: "none",
          background: "none",
          padding: 0,
          font: "inherit",
          textAlign: "inherit",
        }}
      >
        {children}
      </Link>
    );
  }
  return (
    <Typography
      component="span"
      variant="labelLg"
      sx={({ tokens: t }) => ({
        fontWeight: 600,
        color: t.semantic.color.type.default.value,
        textDecoration: "underline",
      })}
    >
      {children}
    </Typography>
  );
}

export function RelationLinkedObjectRow({
  objectId,
  objectName,
  idHref,
  onIdClick,
  nameHref,
  onNameClick,
  status,
  trailing,
  onUnlink,
  unlinkAriaLabel,
}: RelationLinkedObjectRowProps) {
  return (
    <Box
      sx={({ tokens: t }) => ({
        bgcolor: t.semantic.color.surface.subtle.value,
        borderRadius: t.semantic.radius.lg.value,
        pl: 3,
        pr: 2,
        py: 1.5,
        width: "100%",
        minWidth: 0,
      })}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        gap={3}
        sx={{ width: "100%", minWidth: 0 }}
      >
        <Stack
          direction="row"
          alignItems="center"
          gap={1}
          sx={{ flex: "1 1 auto", minWidth: 0 }}
        >
          <Box
            sx={{
              flex: "0 0 80px",
              minWidth: 0,
            }}
          >
            <IdOrNameLink href={idHref} onClick={onIdClick}>
              {objectId}
            </IdOrNameLink>
          </Box>
          <Stack direction="row" alignItems="center" gap={1} sx={{ minWidth: 0, flexShrink: 0 }}>
            <IdOrNameLink href={nameHref} onClick={onNameClick}>
              {objectName}
            </IdOrNameLink>
            {status ? (
              <StatusIndicator color={status.color} label={status.label} />
            ) : null}
          </Stack>
        </Stack>

        <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
          {trailing ? (
            <Stack direction="row" alignItems="center" gap={1} sx={{ flexShrink: 0 }}>
              <Typography
                component="span"
                variant="caption"
                sx={({ tokens: t }) => ({
                  color: t.semantic.color.type.default.value,
                  fontSize: t.semantic.font.label.sm.fontSize.value,
                  lineHeight: t.semantic.font.label.sm.lineHeight.value,
                  letterSpacing: t.semantic.font.label.sm.letterSpacing.value,
                  whiteSpace: "nowrap",
                })}
              >
                {trailing.label}
              </Typography>
              <Stack direction="row" alignItems="center" gap={1} sx={{ height: 16 }}>
                <Box
                  sx={[
                    ({ tokens: t }) => ({
                      width: 16,
                      height: 16,
                      borderRadius: t.semantic.radius.sm.value,
                      flexShrink: 0,
                    }),
                    trailing.ragSwatchSx,
                  ]}
                />
                <Typography
                  component="span"
                  sx={({ tokens: t }) => ({
                    fontSize: t.semantic.font.label.xs.fontSize.value,
                    lineHeight: t.semantic.font.label.xs.lineHeight.value,
                    letterSpacing: t.semantic.font.label.xs.letterSpacing.value,
                    fontWeight: t.semantic.font.label.xs.fontWeight.value,
                    color: t.semantic.color.type.default.value,
                    whiteSpace: "nowrap",
                  })}
                >
                  {trailing.ragLabel}
                </Typography>
              </Stack>
            </Stack>
          ) : null}
          {onUnlink ? (
            <IconButton
              size="small"
              aria-label={unlinkAriaLabel ?? "Unlink"}
              onClick={onUnlink}
              sx={({ tokens: t }) => ({ color: t.semantic.color.type.default.value })}
            >
              <UnlinkIcon aria-hidden />
            </IconButton>
          ) : null}
        </Stack>
      </Stack>
    </Box>
  );
}
