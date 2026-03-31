import { Box, Typography } from "@mui/material";
import type { MitigationPlanStatus } from "../data/types.js";

interface MitigationPlanStatusChipProps {
  status: MitigationPlanStatus;
}

type TokenAccessor = (tokens: Record<string, any>) => string;

const STATUS_BACKGROUND: Record<MitigationPlanStatus, TokenAccessor> = {
  "In progress": (t) => t.semantic.color.status.notification.background.value,
  Completed: (t) => t.semantic.color.status.success.background.value,
  Overdue: (t) => t.core.color.red["70"].value,
};

export default function MitigationPlanStatusChip({
  status,
}: MitigationPlanStatusChipProps) {
  return (
    <Box
      sx={({ tokens }) => ({
        display: "inline-flex",
        alignItems: "center",
        px: 1,
        py: 0.25,
        borderRadius: 1,
        backgroundColor: STATUS_BACKGROUND[status](tokens),
      })}
    >
      <Typography
        variant="textSm"
        sx={({ tokens }) => ({
          color: tokens.semantic.color.type.default.value,
          fontWeight: 600,
          lineHeight: "20px",
        })}
      >
        {status}
      </Typography>
    </Box>
  );
}
