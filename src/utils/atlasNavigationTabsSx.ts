import type { TabsProps } from "@mui/material/Tabs";

const zeroGap = {
  gap: "0px !important",
  columnGap: "0px !important",
  rowGap: "0px !important",
} as const;

/**
 * Aligns with Atlas Storybook navigation tabs: removes token gap between tab labels.
 * Use with `slotProps` so overrides win over `MuiTabs` `list` slot styles from the theme.
 * The baseline divider and scroll-button masking come from the Atlas theme (MuiTabs root ::after).
 */
export const atlasNavigationTabsSx = {
  "& .MuiTabs-flexContainer": { ...zeroGap },
  "& .MuiTabs-list": { ...zeroGap },
};

/**
 * Direct `list` slot styles — required in MUI 6+ because theme `styleOverrides.list` can outrank
 * nested selectors from `sx` on the Tabs root.
 */
export const atlasNavigationTabsSlotProps = {
  list: {
    sx: { ...zeroGap },
  },
} satisfies Pick<TabsProps, "slotProps">["slotProps"];
