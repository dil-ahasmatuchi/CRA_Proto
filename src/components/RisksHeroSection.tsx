import { useMemo } from "react";
import { Box, Card, CardContent, CardHeader, Stack, Typography } from "@mui/material";

import BusinessUnitDropdown, { type BusinessUnitOption } from "./BusinessUnitDropdown.js";
import RiskStatusDonut from "./RiskStatusDonut.js";
import RisksMatrix, { type MatrixSelectionPayload } from "./RisksMatrix.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getBusinessUnitById } from "../data/businessUnits.js";

function businessUnitOptionsFromRisks(): BusinessUnitOption[] {
  const ids = new Set(cyberRisks.map((r) => r.businessUnitId));
  return Array.from(ids)
    .map((id) => {
      const bu = getBusinessUnitById(id);
      return { id, label: bu?.name ?? id };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

type RisksHeroSectionProps = {
  /** When set, matrix/legend drill-in updates the cyber risks list (URL) without full navigation. */
  onMatrixSelection?: (payload: MatrixSelectionPayload) => void;
  /** Selected business unit for the overview (donut/matrix); drives table filtering when owned by the page. */
  businessUnit: BusinessUnitOption | null;
  onBusinessUnitChange: (value: BusinessUnitOption | null) => void;
};

/** Cyber risks overview: workflow status donut, likelihood/impact matrix, business unit filter. */
export default function RisksHeroSection({
  onMatrixSelection,
  businessUnit: selectedBusinessUnit,
  onBusinessUnitChange,
}: RisksHeroSectionProps) {
  const buOptions = useMemo(() => businessUnitOptionsFromRisks(), []);

  const filteredRisks = useMemo(() => {
    if (!selectedBusinessUnit) {
      return cyberRisks;
    }
    return cyberRisks.filter((r) => r.businessUnitId === selectedBusinessUnit.id);
  }, [selectedBusinessUnit]);

  const buId = selectedBusinessUnit?.id ?? null;

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
          <BusinessUnitDropdown
            options={buOptions}
            value={selectedBusinessUnit}
            onChange={onBusinessUnitChange}
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
            businessUnitId={buId}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}
