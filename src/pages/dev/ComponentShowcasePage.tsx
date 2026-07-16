// @ts-nocheck — dev showcase; Typography variants may lag theme typings.
import { PageHeader } from "@diligentcorp/atlas-react-bundle";
import { Container, Divider, Link, Stack, Typography } from "@mui/material";
import { NavLink, useNavigate, useParams } from "react-router";

import { nameToSlug } from "./showcaseDefinitions.js";
import { registryBySlug } from "./componentRegistry.js";

export default function ComponentShowcasePage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const entry = slug ? registryBySlug.get(slug) : undefined;

  if (!entry) {
    return (
      <Container maxWidth="xl" sx={{ py: 2 }}>
        <Typography>Component not found.</Typography>
      </Container>
    );
  }

  const preview = entry.render();

  return (
    <Container maxWidth="xl" sx={{ py: 2 }}>
      <Stack gap={4}>
        <PageHeader
          pageTitle={entry.name}
          slotProps={{
            backButton: {
              "aria-label": "Back",
              onClick: () => navigate(-1),
            },
          }}
        />

        {preview ?? (
          <Typography variant="body2" color="text.secondary">
            No preview for this slug.
          </Typography>
        )}

        <Divider />

        {entry.usedInPages.length > 0 && (
          <Stack gap={1}>
            <Typography variant="h5">Used in pages</Typography>
            {entry.usedInPages.map((p) => (
              <Link key={p.path} component={NavLink} to={p.path}>
                {p.label}
              </Link>
            ))}
          </Stack>
        )}

        {entry.usedInComponents.length > 0 && (
          <Stack gap={1}>
            <Typography variant="h5">Nested in components</Typography>
            {entry.usedInComponents.map((c) => (
              <Link
                key={c}
                component={NavLink}
                to={`/dev/components/${nameToSlug(c)}`}
              >
                {c}
              </Link>
            ))}
          </Stack>
        )}
      </Stack>
    </Container>
  );
}
