import { useMemo, useState } from "react";
import {
  Autocomplete,
  Card,
  CardContent,
  CardHeader,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import AssetsByCyberRiskScoreDonut from "./AssetsByCyberRiskScoreDonut.js";
import RisksMatrix, { type MatrixSelectionPayload } from "./RisksMatrix.js";
import { cyberRisks } from "../data/cyberRisks.js";
import { getOrgUnitById } from "../data/orgUnits.js";
import type { OrgUnitOption } from "./OrgUnitDropdown.js";

function orgUnitOptionsFromRisks(): OrgUnitOption[] {
  const ids = new Set(cyberRisks.map((r) => r.orgUnitId));
  return Array.from(ids)
    .map((id) => {
      const ou = getOrgUnitById(id);
      return { id, label: ou?.name ?? id };
    })
    .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" }));
}

type OverviewHeroProps = {
  onMatrixSelection?: (payload: MatrixSelectionPayload) => void;
};

/** Program overview: assets by cyber risk score donut, likelihood/impact matrix, org. unit filter. */
export default function OverviewHero({ onMatrixSelection }: OverviewHeroProps) {
  const ouOptions = useMemo(() => orgUnitOptionsFromRisks(), []);
  const [selectedOrgUnit, setSelectedOrgUnit] = useState<OrgUnitOption | null>(null);

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
          <Autocomplete<OrgUnitOption, false, false, false>
            size="medium"
            sx={{
              width: 500,
              minWidth: 0,
              "& .MuiInputLabel-root": { paddingBottom: "0px" },
            }}
            options={ouOptions}
            value={selectedOrgUnit}
            onChange={(_, newValue) => {
              setSelectedOrgUnit(newValue);
            }}
            getOptionLabel={(o) => o.label}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth={false}
                label="Org. unit"
                placeholder="All org. units"
                margin="none"
                sx={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px",
                  width: 500,
                  minWidth: 0,
                  "& .MuiInputBase-root": {
                    width: "100%",
                  },
                  "& .MuiInputLabel-root": {
                    paddingBottom: "0px",
                  },
                }}
                slotProps={{
                  inputLabel: {
                    sx: {
                      display: "flex",
                      justifyContent: "flex-end",
                      alignItems: "center",
                      width: 130,
                      paddingBottom: "0px",
                    },
                  },
                }}
              />
            )}
          />
        }
      />
      <CardContent>
        <Stack
          direction={{ xs: "column", lg: "row" }}
          gap={3}
          sx={{ alignItems: { lg: "stretch" }, width: "100%" }}
        >
          <AssetsByCyberRiskScoreDonut
            orgUnitId={ouId}
            sx={{
              flex: { lg: "1 1 50%" },
              minWidth: 0,
              width: "100%",
              maxWidth: "100%",
            }}
          />
          <RisksMatrix
            risks={filteredRisks}
            sx={{
              flex: { lg: "1 1 50%" },
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
