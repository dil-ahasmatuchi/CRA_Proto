import { Container, Stack } from "@mui/material";
import { PropsWithChildren } from "react";

export default function PageLayout({ children }: PropsWithChildren) {
  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={6}>{children}</Stack>
    </Container>
  );
}
