import { Box, Stack, Typography, useTheme } from "@mui/material";
import { useCallback, useId, useMemo, useState } from "react";

import { useCyberRiskScoringConfig } from "../context/CyberRiskScoringConfigContext.js";
import {
  bandsAreContinuous,
  bandRowFromToValid,
  deepCloneBands,
  type ScoringBandRow,
} from "../data/cyberRiskScoringScales.js";
import ScoringScaleBandCard from "./scoringScales/ScoringScaleBandCard.js";
import ScoringScaleRangeBar, { type ScoringRangeSegment } from "./scoringScales/ScoringScaleRangeBar.js";
import ScoringScaleSection from "./scoringScales/ScoringScaleSection.js";

const INTRO = {
  title: "Scoring scale configuration",
  body:
    "Your company scoring is represented in a 5 point criticality scale ranging from 1 - Very low to 5 - Very high. Below you can edit the numeric ranges and descriptions that define each band. Changes apply to all assessments not yet approved.",
} as const;

function segmentsFromBands(rows: ScoringBandRow[]): ScoringRangeSegment[] {
  return rows.map((r) => ({
    bandLabel: r.name,
    from: r.from,
    to: r.to,
    rag: r.rag,
  }));
}

function rowError(row: ScoringBandRow): string | undefined {
  if (!bandRowFromToValid(row)) {
    return "“From” must be less than or equal to “To”.";
  }
  return undefined;
}

function runContinuityError(rows: ScoringBandRow[]): string | undefined {
  if (bandsAreContinuous(rows)) return undefined;
  return "Adjust ranges so each band’s upper bound is one less than the next band’s lower bound (continuous scale).";
}

/**
 * Figma: Scoring scale configuration — Cyber risk score + Likelihood sections.
 * Band rows are shared app-wide via {@link CyberRiskScoringConfigProvider} (prototype; no API persistence).
 */
export default function CyberRiskScoringScalesContent() {
  const { tokens: t } = useTheme();
  const uid = useId();
  const { cyberScoreBands: cyberRows, setCyberScoreBands: setCyberRows, likelihoodBands: likeRows, setLikelihoodBands: setLikeRows } =
    useCyberRiskScoringConfig();
  const [editCyber, setEditCyber] = useState(false);
  const [editLike, setEditLike] = useState(false);
  const [openCyber, setOpenCyber] = useState(true);
  const [openLike, setOpenLike] = useState(false);

  const cyberSeg = useMemo(() => segmentsFromBands(cyberRows), [cyberRows]);
  const likeSeg = useMemo(() => segmentsFromBands(likeRows), [likeRows]);

  const updateCyber = useCallback(
    (index: number, u: Partial<Pick<ScoringBandRow, "from" | "to" | "description">>) => {
      setCyberRows((prev) => {
        const next = deepCloneBands(prev);
        const cur = { ...next[index]!, ...u } as ScoringBandRow;
        next[index] = cur;
        return next;
      });
    },
    [],
  );

  const updateLike = useCallback(
    (index: number, u: Partial<Pick<ScoringBandRow, "from" | "to" | "description">>) => {
      setLikeRows((prev) => {
        const next = deepCloneBands(prev);
        const cur = { ...next[index]!, ...u } as ScoringBandRow;
        next[index] = cur;
        return next;
      });
    },
    [],
  );

  const cyberContErr = useMemo(
    () => (editCyber ? runContinuityError(cyberRows) : undefined),
    [editCyber, cyberRows],
  );
  const likeContErr = useMemo(
    () => (editLike ? runContinuityError(likeRows) : undefined),
    [editLike, likeRows],
  );

  const onToggleEditCyber = useCallback(() => {
    if (editCyber) {
      const rowErrs = cyberRows.map((r) => rowError(r));
      if (rowErrs.some(Boolean)) {
        return;
      }
      if (runContinuityError(cyberRows)) {
        return;
      }
    }
    setEditCyber((e) => !e);
  }, [editCyber, cyberRows]);

  const onToggleEditLike = useCallback(() => {
    if (editLike) {
      if (likeRows.map((r) => rowError(r)).some(Boolean)) {
        return;
      }
      if (runContinuityError(likeRows)) {
        return;
      }
    }
    setEditLike((e) => !e);
  }, [editLike, likeRows]);

  return (
    <Box
      sx={{
        width: "100%",
        minWidth: 0,
        alignSelf: "stretch",
        pt: 0,
        pb: t.core.spacing["6"].value,
        px: 0,
        display: "flex",
        flexDirection: "column",
        gap: 6,
      }}
    >
      <Stack component="header" gap={1.5} alignItems="flex-start">
        <Typography
          component="h2"
          sx={{
            m: 0,
            color: t.semantic.color.type.default.value,
            fontFamily: t.semantic.font.title.h2Display.fontFamily.value,
            fontSize: t.semantic.font.title.h2Display.fontSize.value,
            lineHeight: t.semantic.font.title.h2Display.lineHeight.value,
            fontWeight: 600,
            letterSpacing: t.semantic.font.title.h2Display.letterSpacing.value,
          }}
        >
          {INTRO.title}
        </Typography>
        <Typography
          component="p"
          sx={{
            m: 0,
            color: t.semantic.color.type.default.value,
            fontSize: t.semantic.font.text.body.fontSize.value,
            lineHeight: t.semantic.font.text.body.lineHeight.value,
            fontWeight: 400,
            letterSpacing: t.semantic.font.text.body.letterSpacing.value,
          }}
        >
          {INTRO.body}
        </Typography>
      </Stack>

      <ScoringScaleSection
        title="Cyber risk score"
        sectionId={`${uid}-crs-h`}
        detailRegionId={`${uid}-crs-bands`}
        expanded={openCyber}
        onToggleExpanded={() => setOpenCyber((o) => !o)}
        editing={editCyber}
        onToggleEdit={onToggleEditCyber}
        rangeBar={<ScoringScaleRangeBar segments={cyberSeg} />}
      >
        {editCyber && cyberContErr ? (
          <Typography color="error" variant="body1" role="status" sx={{ m: 0, width: "100%" }}>
            {cyberContErr}
          </Typography>
        ) : null}
        {cyberRows.map((row, i) => (
          <ScoringScaleBandCard
            key={row.level}
            row={row}
            readOnly={!editCyber}
            onChange={(u) => updateCyber(i, u)}
            error={editCyber ? rowError(row) : undefined}
          />
        ))}
      </ScoringScaleSection>

      <ScoringScaleSection
        title="Likelihood"
        sectionId={`${uid}-lik-h`}
        detailRegionId={`${uid}-lik-bands`}
        expanded={openLike}
        onToggleExpanded={() => setOpenLike((o) => !o)}
        editing={editLike}
        onToggleEdit={onToggleEditLike}
        rangeBar={<ScoringScaleRangeBar segments={likeSeg} />}
      >
        {editLike && likeContErr ? (
          <Typography color="error" variant="body1" role="status" sx={{ m: 0, width: "100%" }}>
            {likeContErr}
          </Typography>
        ) : null}
        {likeRows.map((row, i) => (
          <ScoringScaleBandCard
            key={row.level}
            row={row}
            readOnly={!editLike}
            onChange={(u) => updateLike(i, u)}
            error={editLike ? rowError(row) : undefined}
          />
        ))}
      </ScoringScaleSection>
    </Box>
  );
}