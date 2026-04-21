import type { ReactNode } from "react";
import { Accordion, AccordionDetails, AccordionSummary, useTheme } from "@mui/material";

export type HistoryAccordionProps = {
  /** Stable id used for `aria-controls` / `id` on summary and details. */
  panelId: string;
  title: string;
  subtitle: string;
  expanded: boolean;
  onExpandedChange: (expanded: boolean) => void;
  children: ReactNode;
};

/** en-GB date/time string for history accordion subtitles. */
export function formatHistoryLogDateTime(d: Date): string {
  const datePart = new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
  const timePart = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(d);
  return `${datePart} / ${timePart}`;
}

/**
 * Single expandable row for a history log (Atlas accordion header preset + details slot).
 */
export default function HistoryAccordion({
  panelId,
  title,
  subtitle,
  expanded,
  onExpandedChange,
  children,
}: HistoryAccordionProps) {
  const { presets } = useTheme();
  const { AccordionPresets } = presets;

  return (
    <Accordion expanded={expanded} onChange={(_, next) => onExpandedChange(next)}>
      <AccordionSummary aria-controls={`${panelId}-content`} id={`${panelId}-header`}>
        <AccordionPresets.components.Header
          titleTextProps={{
            text: title,
            variant: "body1",
            component: "span",
          }}
          subtitleText={subtitle}
        />
      </AccordionSummary>
      <AccordionDetails>{children}</AccordionDetails>
    </Accordion>
  );
}
