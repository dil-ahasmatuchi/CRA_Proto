import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Button } from "@mui/material";
import type { ReactNode } from "react";

export type ScoringRationaleHeaderProps = {
  pageTitle: string;
  breadcrumbs: ReactNode;
  onBack: () => void;
  backButtonAriaLabel: string;
  onSave?: () => void;
};

export default function ScoringRationaleHeader({
  pageTitle,
  breadcrumbs,
  onBack,
  backButtonAriaLabel,
  onSave,
}: ScoringRationaleHeaderProps) {
  return (
    <PageHeader
      pageTitle={pageTitle}
      breadcrumbs={breadcrumbs}
      moreButton={
        onSave ? (
          <Button variant="contained" size="medium" onClick={onSave}>
            Save
          </Button>
        ) : undefined
      }
      slotProps={{
        backButton: {
          "aria-label": backButtonAriaLabel,
          onClick: onBack,
        },
      }}
    />
  );
}
