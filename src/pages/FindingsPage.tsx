import { useState } from "react";
import {
  PageHeader,
  OverflowBreadcrumbs,
  AIChatPanel,
  AIChatContextProvider,
  AIChatContent,
  AIChatBox,
  AIChatUserMessage,
  AIChatAIMessage,
  AIChatMessageHeader,
  AIChatMessageAvatar,
  AIChatMessageTextBlock,
  AIChatTimestamp,
  useAIChatContext,
} from "@diligentcorp/atlas-react-bundle";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Chip,
  Container,
  Link,
  Stack,
  useTheme,
} from "@mui/material";
import { NavLink, useNavigate } from "react-router";

interface FindingItem {
  id: string;
  title: string;
  url: string;
}

interface FindingCategory {
  id: string;
  title: string;
  items: FindingItem[];
}

const findingsData: FindingCategory[] = [
  {
    id: "threats",
    title: "Threats",
    items: [
      { id: "t1", title: "Ransomware deployment on critical infrastructure", url: "#" },
      { id: "t2", title: "Phishing targeting executive accounts", url: "#" },
      { id: "t3", title: "Supply chain compromise via third-party vendor", url: "#" },
      { id: "t4", title: "Insider threat from privileged access misuse", url: "#" },
      { id: "t5", title: "Distributed denial-of-service (DDoS) attack", url: "#" },
    ],
  },
  {
    id: "vulnerabilities",
    title: "Vulnerabilities",
    items: [
      { id: "v1", title: "Unpatched CVE-2025-3271 in web application framework", url: "#" },
      { id: "v2", title: "Misconfigured cloud storage bucket with public access", url: "#" },
      { id: "v3", title: "Weak authentication on remote access endpoints", url: "#" },
      { id: "v4", title: "SQL injection in legacy reporting module", url: "#" },
    ],
  },
  {
    id: "assets",
    title: "Assets",
    items: [
      { id: "a1", title: "Primary database server (DB-PROD-01)", url: "#" },
      { id: "a2", title: "Customer data processing system", url: "#" },
      { id: "a3", title: "Internal HR management platform", url: "#" },
      { id: "a4", title: "Cloud-hosted API gateway", url: "#" },
      { id: "a5", title: "File share server (FS-CORP-02)", url: "#" },
      { id: "a6", title: "Email exchange server", url: "#" },
    ],
  },
  {
    id: "cyber-risks",
    title: "Cyber risks",
    items: [
      { id: "r1", title: "Data breach due to unpatched vulnerability", url: "#" },
      { id: "r2", title: "Business disruption from ransomware encryption", url: "#" },
      { id: "r3", title: "Regulatory non-compliance with data protection laws", url: "#" },
    ],
  },
];

function ChatPanel() {
  const [messages, setMessages] = useState<
    Array<{ role: string; content: string; time: string }>
  >([
    {
      role: "assistant",
      content:
        "I've analyzed the uploaded files and identified findings across four categories: threats, vulnerabilities, assets, and cyber risks. You can review each category in the panel on the right. Let me know if you'd like to dig deeper into any specific finding.",
      time: "2:33 PM",
    },
  ]);
  const { setIsGenerating } = useAIChatContext();

  const handleSubmit = (prompt: string) => {
    const now = new Date().toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
    setMessages((prev) => [...prev, { role: "user", content: prompt, time: now }]);
    setIsGenerating(true);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            "I can provide more details on that finding. Would you like me to generate a risk assessment or suggest mitigation actions?",
          time: new Date().toLocaleTimeString([], {
            hour: "numeric",
            minute: "2-digit",
          }),
        },
      ]);
      setIsGenerating(false);
    }, 2000);
  };

  return (
    <AIChatPanel
      title="Diligent AI"
      assistant={{
        name: "Diligent AI",
        imageUrl: "",
        altText: "Diligent AI",
      }}
      slotProps={{
        title: { component: "h2" },
        resizeHandle: { ariaLabel: "Resize chat panel" },
        collapseButton: { ariaLabel: "Minimize chat panel" },
        expandButton: { ariaLabel: "Expand chat panel" },
      }}
      chatBox={
        <AIChatBox
          onSubmit={handleSubmit}
          onStop={() => setIsGenerating(false)}
          slotProps={{
            textField: {
              label: "Ask about findings",
              placeholder: "Ask about the analysis results...",
            },
            submitButton: {
              submitButtonAriaLabel: "Send message",
              stopButtonAriaLabel: "Stop generation",
            },
          }}
        />
      }
      chatContent={
        <AIChatContent>
          <AIChatTimestamp time="Today" />
          {messages.map((message, index) =>
            message.role === "user" ? (
              <AIChatUserMessage
                key={index}
                header={
                  <AIChatMessageHeader
                    name="You"
                    time={message.time}
                    avatar={<AIChatMessageAvatar uniqueId="user" initials="YO" />}
                  />
                }
                alignment="end"
                message={message.content}
              />
            ) : (
              <AIChatAIMessage
                key={index}
                header={
                  <AIChatMessageHeader
                    name="Diligent AI"
                    time={message.time}
                    avatar={<AIChatMessageAvatar uniqueId="ai" initials="DI" />}
                  />
                }
              >
                <AIChatMessageTextBlock>{message.content}</AIChatMessageTextBlock>
              </AIChatAIMessage>
            ),
          )}
        </AIChatContent>
      }
    />
  );
}

function FindingsCategoryCard({ category }: { category: FindingCategory }) {
  const { presets } = useTheme();
  const { AccordionPresets } = presets;

  return (
    <Accordion defaultExpanded>
      <AccordionSummary
        aria-controls={`${category.id}-content`}
        id={`${category.id}-header`}
      >
        <AccordionPresets.components.Header
          titleTextProps={{
            text: category.title,
            variant: "h4",
            component: "h3",
          }}
          subtitleText={`${category.items.length} ${category.items.length === 1 ? "item" : "items"}`}
        >
          <Chip label={category.items.length} size="small" />
        </AccordionPresets.components.Header>
      </AccordionSummary>
      <AccordionDetails>
        <Stack gap={1}>
          {category.items.map((item) => (
            <Box
              key={item.id}
              sx={({ tokens }) => ({
                py: 1,
                px: 2,
                borderRadius: 1,
                "&:hover": {
                  backgroundColor: tokens.semantic.color.surface.variant.value,
                },
              })}
            >
              <Link
                href={item.url}
                variant="body1"
                underline="hover"
                sx={{ cursor: "pointer" }}
              >
                {item.title}
              </Link>
            </Box>
          ))}
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default function FindingsPage() {
  const navigate = useNavigate();

  return (
    <Stack
      direction="row"
      sx={({ tokens }) => ({
        height: `calc(100vh - ${tokens.component.globalHeader.height.value})`,
        width: "100%",
        position: "relative",
        overflow: "hidden",
      })}
    >
      <Stack sx={{ flexGrow: 1, overflow: "auto", minWidth: 0 }}>
        <Container sx={{ py: 2 }}>
          <Stack gap={3}>
            <PageHeader
              pageTitle="Findings"
              moreButton={
                <Button
                  variant="contained"
                  onClick={() => navigate("/cyber-risk/cyber-risk-assessment")}
                >
                  Start cyber risk assessment
                </Button>
              }
              breadcrumbs={
                <OverflowBreadcrumbs
                  leadingElement={<span>Asset Manager</span>}
                  items={[
                    {
                      id: "cyber-risk",
                      label: "Cyber risk management",
                      url: "/cyber-risk",
                    },
                    {
                      id: "file-import",
                      label: "File import",
                      url: "/cyber-risk/file-import",
                    },
                    {
                      id: "upload",
                      label: "Upload files",
                      url: "/cyber-risk/file-import/upload",
                    },
                    {
                      id: "findings",
                      label: "Findings",
                      url: "/cyber-risk/file-import/upload/findings",
                    },
                  ]}
                  hideLastItem={true}
                  aria-label="Breadcrumbs"
                >
                  {({ label, url }) => <NavLink to={url}>{label}</NavLink>}
                </OverflowBreadcrumbs>
              }
            />

            <Stack gap={1}>
              {findingsData.map((category) => (
                <FindingsCategoryCard key={category.id} category={category} />
              ))}
            </Stack>
          </Stack>
        </Container>
      </Stack>

      <AIChatContextProvider>
        <ChatPanel />
      </AIChatContextProvider>
    </Stack>
  );
}
