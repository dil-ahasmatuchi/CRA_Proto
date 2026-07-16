import TableIcon from "@diligentcorp/atlas-react-bundle/icons/Table";
import { RelationCard } from "../components/RelationCard.js";
import RiskDetailHeader from "../components/RiskDetailHeader.js";
import RiskDetailsForm from "../components/RiskDetailsForm.js";
import { Box, Button, Container, Link, Stack, Typography } from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { NavLink, Navigate, useParams } from "react-router";

import type { CyberRiskStatus } from "../data/types.js";
import { getCyberRiskById, updateCyberRisk } from "../data/cyberRisks.js";
import { getMitigationPlanById } from "../data/mitigationPlans.js";
import { riskAssessments } from "../data/riskAssessments.js";
import { getUserById } from "../data/users.js";
import { rowsForCyberRiskThreatIds } from "../utils/cyberRiskRelationshipRows.js";
import {
  rowsForThreatAssetIds,
  rowsForThreatVulnerabilityIds,
} from "../utils/threatRelationshipRows.js";

function formatDetailDate(d: Date): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

const relationshipLinkUnlinkAction = (
  <Button variant="text" size="small">
    Link / Unlink
  </Button>
);

export default function CyberRiskDetailPage() {
  const { riskId } = useParams<{ riskId: string }>();

  const risk = useMemo(() => (riskId ? getCyberRiskById(riskId) : undefined), [riskId]);

  const [tab, setTab] = useState(0);
  const [status, setStatus] = useState<CyberRiskStatus | undefined>(() =>
    riskId ? getCyberRiskById(riskId)?.status : undefined,
  );

  useEffect(() => {
    const next = riskId ? getCyberRiskById(riskId) : undefined;
    setStatus(next?.status);
    setTab(0);
  }, [riskId]);

  const metaNow = useMemo(() => formatDetailDate(new Date()), []);

  const relationshipAssetRows = useMemo(
    () => (risk ? rowsForThreatAssetIds(risk.assetIds) : []),
    [risk],
  );
  const relationshipVulnerabilityRows = useMemo(
    () => (risk ? rowsForThreatVulnerabilityIds(risk.vulnerabilityIds) : []),
    [risk],
  );
  const relationshipThreatRows = useMemo(
    () => (risk ? rowsForCyberRiskThreatIds(risk.threatIds) : []),
    [risk],
  );

  const linkedAssessments = useMemo(() => {
    if (!risk) return [];
    return riskAssessments.filter((a) => a.cyberRiskIds.includes(risk.id));
  }, [risk]);

  const handleSave = useCallback(() => {
    if (!risk || status == null) return;
    updateCyberRisk(risk.id, { status });
  }, [risk, status]);

  if (!riskId || !risk || status === undefined) {
    return <Navigate to="/cyber-risk/cyber-risks" replace />;
  }

  const owner = getUserById(risk.ownerId);
  const ownerName = owner?.fullName ?? "Unassigned";

  return (
    <Container maxWidth="xl" sx={{ py: 2, pb: 4 }}>
      <Stack gap={2}>
        <RiskDetailHeader
          pageTitle={risk.name}
          riskId={risk.id}
          displayId="—"
          metaNow={metaNow}
          createdBy={ownerName}
          lastUpdatedBy={ownerName}
          status={status}
          tab={tab}
          onTabChange={setTab}
          onSave={handleSave}
        />

        {tab === 0 && (
          <Box
            role="tabpanel"
            id="risk-panel-0"
            aria-labelledby="risk-tab-0"
          >
            <RiskDetailsForm
              initialData={{
                name: risk.name,
                customId: "",
                ownerIds: [risk.ownerId],
                riskCategory: "",
                orgUnitId: risk.orgUnitId,
                description: "",
                inherentLikelihood: risk.likelihoodLabel,
                inherentImpact: risk.impactLabel,
                inherentScore: risk.cyberRiskScoreLabel,
                treatmentType: "",
                residualLikelihood: risk.residualLikelihoodLabel,
                residualImpact: "",
                residualScore: risk.residualCyberRiskScoreLabel,
              }}
            />
          </Box>
        )}

        {tab === 1 && (
          <Box
            role="tabpanel"
            id="risk-panel-1"
            aria-labelledby="risk-tab-1"
            sx={{ py: 3 }}
          >
            <Stack spacing={3}>
              <RelationCard
                objectTypeTitle="Assets"
                linkedObjectsNounPhrase="assets"
                icon={<TableIcon aria-hidden />}
                items={relationshipAssetRows}
                headerAction={relationshipLinkUnlinkAction}
              />
              <RelationCard
                objectTypeTitle="Threats"
                linkedObjectsNounPhrase="threats"
                icon={<TableIcon aria-hidden />}
                items={relationshipThreatRows}
                headerAction={relationshipLinkUnlinkAction}
              />
              <RelationCard
                objectTypeTitle="Vulnerabilities"
                linkedObjectsNounPhrase="vulnerabilities"
                icon={<TableIcon aria-hidden />}
                items={relationshipVulnerabilityRows}
                headerAction={relationshipLinkUnlinkAction}
              />
            </Stack>
          </Box>
        )}

        {tab === 2 && (
          <Box
            role="tabpanel"
            id="risk-panel-2"
            aria-labelledby="risk-tab-2"
            sx={{ pt: 2 }}
          >
            <Stack gap={1.5}>
              {linkedAssessments.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No cyber risk assessments link to this risk.
                </Typography>
              ) : (
                linkedAssessments.map((a) => (
                  <Typography key={a.id} variant="body1" component="div">
                    <Link
                      component={NavLink}
                      to={`/cyber-risk/cyber-risk-assessments/${encodeURIComponent(a.id)}`}
                      underline="hover"
                    >
                      {a.name}
                    </Link>
                    <Box component="span" sx={{ ml: 1, color: "text.secondary" }}>
                      ({a.id})
                    </Box>
                  </Typography>
                ))
              )}
            </Stack>
          </Box>
        )}

        {tab === 3 && (
          <Box
            role="tabpanel"
            id="risk-panel-3"
            aria-labelledby="risk-tab-3"
            sx={{ pt: 2 }}
          >
            <Stack gap={1.5}>
              {risk.mitigationPlanIds.length === 0 ? (
                <Typography variant="body1" color="text.secondary">
                  No mitigation plans linked to this risk.
                </Typography>
              ) : (
                risk.mitigationPlanIds.map((mid) => {
                  const p = getMitigationPlanById(mid);
                  return (
                    <Typography key={mid} variant="body1" component="div">
                      {p ? (
                        <>
                          <Link href="/cyber-risk/mitigation-plans" underline="hover">
                            {p.name}
                          </Link>
                          <Box component="span" sx={{ ml: 1, color: "text.secondary" }}>
                            ({p.id})
                          </Box>
                        </>
                      ) : (
                        mid
                      )}
                    </Typography>
                  );
                })
              )}
            </Stack>
          </Box>
        )}
      </Stack>
    </Container>
  );
}
