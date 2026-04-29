import { useMemo } from "react";
import { Box, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";

import OrgUnitDropdown, { type OrgUnitOption } from "./OrgUnitDropdown.js";
import RiskStatusDonut from "./RiskStatusDonut.js";
import RisksMatrix, { type MatrixSelectionPayload } from "./RisksMatrix.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getOrgUnitById } from "../data/orgUnits.js";

function orgUnitOptionsFromRisks(): OrgUnitOption[] {
  const ids = new Set(cyberRisks.map((r) => r.orgUnitId));
  return Array.from(ids)
    .map((id) => {
      const ou = getOrgUnitById(id);
      return { id, label: ou?.name ?? id };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

type RisksHeroSectionProps = {
  /** When set, matrix/legend drill-in updates the cyber risks list (URL) without full navigation. */
  onMatrixSelection?: (payload: MatrixSelectionPayload) => void;
  /** Selected org. unit for the overview (donut/matrix); drives table filtering when owned by the page. */
  orgUnit: OrgUnitOption | null;
  onOrgUnitChange: (value: OrgUnitOption | null) => void;
};

/** Cyber risks overview: workflow status donut, likelihood/impact matrix, org. unit filter. */
export default function RisksHeroSection({
  onMatrixSelection,
  orgUnit: selectedOrgUnit,
  onOrgUnitChange,
}: RisksHeroSectionProps) {
  const ouOptions = useMemo(() => orgUnitOptionsFromRisks(), []);

  const filteredRisks = useMemo(() => {
    if (!selectedOrgUnit) {
      return cyberRisks;
    }
    return cyberRisks.filter((r) => r.orgUnitId === selectedOrgUnit.id);
  }, [selectedOrgUnit]);

  const ouId = selectedOrgUnit?.id ?? null;

  return (
    <Card
      sx={({ tokens }) => ({
        backgroundColor: tokens.semantic.color.background.container.value,
        border: "none",
      })}
    >
      <CardHeader
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          "& .MuiCardHeader-content": {
            width: "fit-content",
            flex: "0 0 auto",
          },
          "& .MuiCardHeader-action": {
            flex: 1,
            minWidth: 0,
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          },
        }}
        title={
          <Typography variant="h3" component="h2" sx={{ fontWeight: 600 }}>
            Overview
          </Typography>
        }
        action={
          <OrgUnitDropdown
            options={ouOptions}
            value={selectedOrgUnit}
            onChange={onOrgUnitChange}
            sx={{
              minWidth: 0,
              width: { xs: "100%", sm: "fit-content" },
            }}
          />
        }
      />
      <CardContent>
        <Stack direction="row" gap={3} sx={{ alignItems: "stretch", width: "100%" }}>
          <Box
            sx={{
              flex: "0 0 auto",
              minWidth: 0,
              display: "flex",
              justifyContent: "center",
            }}
          >
            <RiskStatusDonut risks={filteredRisks} />
          </Box>
          <RisksMatrix
            risks={filteredRisks}
            sx={{
              flex: "1 1 50%",
              minWidth: 0,
              width: "100%",
              maxWidth: "100%",
            }}
            onMatrixSelection={onMatrixSelection}
            orgUnitId={ouId}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
