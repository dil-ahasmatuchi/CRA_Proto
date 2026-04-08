import { Card } from "@diligentcorp/atlas-react-bundle";
import ExpandDownIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandDown";
import ExpandUpIcon from "@diligentcorp/atlas-react-bundle/icons/ExpandUp";
import { Box, Button, CardContent, Stack, Typography } from "@mui/material";
import { useCallback, useState, type ReactNode } from "react";

import {
  RelationLinkedObjectRow,
  type RelationLinkedObjectRowProps,
} from "./RelationLinkedObjectRow.js";

export { RelationLinkedObjectRow } from "./RelationLinkedObjectRow.js";
export type { RelationLinkedObjectRowProps } from "./RelationLinkedObjectRow.js";

export type RelationCardProps = {
  objectTypeTitle: string;
  /** Lowercase plural phrase for empty state, e.g. "cyber risks" */
  linkedObjectsNounPhrase: string;
  icon: ReactNode;
  items?: RelationLinkedObjectRowProps[];
  maxVisible?: number;
  headerAction?: ReactNode;
  /** When true, header icon uses the filled-state background even if the list is empty */
  filledIconWell?: boolean;
  expanded?: boolean;
  defaultExpanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
};

export function RelationCard({
  objectTypeTitle,
  linkedObjectsNounPhrase,
  icon,
  items = [],
  maxVisible = 5,
  headerAction,
  filledIconWell,
  expanded: expandedControlled,
  defaultExpanded = false,
  onExpandedChange,
}: RelationCardProps) {
  const [expandedUncontrolled, setExpandedUncontrolled] = useState(defaultExpanded);
  const isControlled = expandedControlled !== undefined;
  const expanded = isControlled ? expandedControlled : expandedUncontrolled;

  const setExpanded = useCallback(
    (next: boolean) => {
      if (!isControlled) {
        setExpandedUncontrolled(next);
      }
      onExpandedChange?.(next);
    },
    [isControlled, onExpandedChange],
  );

  const count = items.length;
  const isFilled = count > 0;
  const useFilledIconWell = filledIconWell ?? isFilled;

  const visibleItems =
    expanded || count <= maxVisible ? items : items.slice(0, maxVisible);
  const showToggle = count > maxVisible;

  const titleText = isFilled ? `${objectTypeTitle} (${count})` : objectTypeTitle;

  return (
    <Card
      variant="outlined"
      sx={({ tokens: t }) => ({
        minWidth: 0,
        width: "100%",
        borderRadius: t.semantic.radius.lg.value,
        borderStyle: "solid",
        borderColor: t.semantic.color.ui.divider.default.value,
        borderWidth: t.semantic.borderWidth.thin.value,
        bgcolor: t.semantic.color.background.base.value,
        boxShadow: "none",
      })}
    >
      <CardContent
        sx={{
          p: 3,
          display: "flex",
          flexDirection: "column",
          gap: 3,
          "&:last-child": { pb: 3 },
        }}
      >
        <Stack direction="row" alignItems="center" gap={1} sx={{ width: "100%", minWidth: 0 }}>
          <Box
            sx={({ tokens: t }) => ({
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              flexShrink: 0,
              borderRadius: t.semantic.radius.md.value,
              bgcolor: useFilledIconWell
                ? t.semantic.color.status.success.background.value
                : t.semantic.color.surface.variant.value,
              color: t.semantic.color.type.default.value,
            })}
          >
            <Box sx={{ display: "flex", fontSize: 20, lineHeight: 0 }}>{icon}</Box>
          </Box>
          <Typography
            component="h3"
            variant="h3"
            fontWeight={600}
            sx={({ tokens: t }) => ({
              flex: "1 1 auto",
              minWidth: 0,
              color: t.semantic.color.type.default.value,
            })}
          >
            {titleText}
          </Typography>
          {headerAction ? (
            <Box sx={{ flexShrink: 0, ml: "auto" }}>{headerAction}</Box>
          ) : null}
        </Stack>

        {!isFilled ? (
          <Typography
            variant="body1"
            sx={({ tokens: t }) => ({
              m: 0,
              color: t.semantic.color.type.default.value,
              letterSpacing: t.semantic.font.text.md.letterSpacing.value,
              lineHeight: t.semantic.font.text.md.lineHeight.value,
              fontSize: t.semantic.font.text.md.fontSize.value,
            })}
          >
            Your linked {linkedObjectsNounPhrase} will be displayed here.
          </Typography>
        ) : (
          <Stack
            role="list"
            aria-label={`Linked ${objectTypeTitle.toLowerCase()}`}
            spacing={1.5}
            sx={{ width: "100%", minWidth: 0 }}
          >
            {visibleItems.map((row) => (
              <Box key={row.itemKey} role="listitem">
                <RelationLinkedObjectRow {...row} />
              </Box>
            ))}
            {showToggle ? (
              <Box sx={{ display: "flex", justifyContent: "center", pt: 0.5 }}>
                <Button
                  variant="text"
                  size="small"
                  aria-expanded={expanded}
                  endIcon={expanded ? <ExpandUpIcon aria-hidden /> : <ExpandDownIcon aria-hidden />}
                  onClick={() => setExpanded(!expanded)}
                >
                  {expanded ? "Show less" : "Show more"}
                </Button>
              </Box>
            ) : null}
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}
