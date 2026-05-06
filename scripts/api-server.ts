/**
 * scripts/api-server.ts
 *
 * Lightweight local HTTP server that adapts Vercel serverless handler
 * functions so they work with plain `npm run dev` (Vite) without
 * needing the Vercel CLI or a Vercel account.
 *
 * Vite proxies all /api/* requests here (see vite.config.ts).
 *
 * Run standalone:  node --env-file=.env --import tsx/esm scripts/api-server.ts
 * Run via npm:     npm run dev  (concurrently starts both this and Vite)
 */

import http from "node:http";
import type { IncomingMessage, ServerResponse } from "node:http";
import type { VercelRequest, VercelResponse } from "@vercel/node";

// ---------------------------------------------------------------------------
// Import all API handlers (same files Vercel deploys)
// ---------------------------------------------------------------------------
import assetsHandler from "../api/assets/index.js";
import assetsIdHandler from "../api/assets/[id].js";
import assetThreatsHandler from "../api/assets/[id]/threats.js";
import assetVulnCatsHandler from "../api/assets/[id]/vulnerability-categories.js";
import assetCyberRisksHandler from "../api/assets/[id]/cyber-risks.js";
import assetControlsHandler from "../api/assets/[id]/controls.js";
import threatsHandler from "../api/threats/index.js";
import threatsIdHandler from "../api/threats/[id].js";
import vulnCatsHandler from "../api/vulnerability-categories/index.js";
import vulnCatIdHandler from "../api/vulnerability-categories/[id].js";
import controlsHandler from "../api/controls/index.js";
import controlsIdHandler from "../api/controls/[id].js";
import cyberRisksHandler from "../api/cyber-risks/index.js";
import cyberRisksIdHandler from "../api/cyber-risks/[id].js";
import craAssessmentsHandler from "../api/cyber-risk-assessments/index.js";
import craAssessmentsIdHandler from "../api/cyber-risk-assessments/[id].js";
import assessmentsScopeHandler from "../api/cyber-risk-assessments/[id]/scope.js";
import assessmentsExclusionsHandler from "../api/cyber-risk-assessments/[id]/exclusions.js";
import assessmentsScenariosHandler from "../api/cyber-risk-assessments/[id]/scenarios.js";
import assessmentsGenerateScenariosHandler from "../api/cyber-risk-assessments/[id]/generate-scenarios.js";
import assessmentsLinkedEntitiesHandler from "../api/cyber-risk-assessments/[id]/linked-entities.js";
import scenariosIdHandler from "../api/scenarios/[id].js";
import scenariosScoreHandler from "../api/scenarios/score.js";

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

type Handler = (req: VercelRequest, res: VercelResponse) => void;

type Route = {
  pattern: RegExp;
  paramNames: string[];
  handler: Handler;
};

function makeRoute(pathTemplate: string, handler: Handler): Route {
  const paramNames: string[] = [];
  const regexStr = pathTemplate.replace(/:([^/]+)/g, (_: string, name: string) => {
    paramNames.push(name);
    return "([^/]+)";
  });
  return { pattern: new RegExp(`^${regexStr}$`), paramNames, handler };
}

// Order matters — deeper / more specific routes must come before shallower ones.
const ROUTES: Route[] = [
  // Asset sub-resources  (must be before /api/assets/:id)
  makeRoute("/api/assets/:id/threats",                  assetThreatsHandler as Handler),
  makeRoute("/api/assets/:id/vulnerability-categories", assetVulnCatsHandler as Handler),
  makeRoute("/api/assets/:id/cyber-risks",              assetCyberRisksHandler as Handler),
  makeRoute("/api/assets/:id/controls",                 assetControlsHandler as Handler),
  // Asset by id         (must be before /api/assets)
  makeRoute("/api/assets/:id",                          assetsIdHandler as Handler),
  // Asset list
  makeRoute("/api/assets",                              assetsHandler),
  // Other entities
  makeRoute("/api/threats/:id",                         threatsIdHandler as Handler),
  makeRoute("/api/threats",                             threatsHandler),
  makeRoute("/api/vulnerability-categories/:id",        vulnCatIdHandler as Handler),
  makeRoute("/api/vulnerability-categories",            vulnCatsHandler),
  makeRoute("/api/controls/:id",                        controlsIdHandler as Handler),
  makeRoute("/api/controls",                            controlsHandler),
  makeRoute("/api/cyber-risks/:id",                     cyberRisksIdHandler as Handler),
  makeRoute("/api/cyber-risks",                         cyberRisksHandler),
  // Cyber Risk Assessments (deeper routes first)
  makeRoute("/api/cyber-risk-assessments/:id/linked-entities", assessmentsLinkedEntitiesHandler as Handler),
  makeRoute("/api/cyber-risk-assessments/:id/generate-scenarios", assessmentsGenerateScenariosHandler as Handler),
  makeRoute("/api/cyber-risk-assessments/:id/scenarios",   assessmentsScenariosHandler as Handler),
  makeRoute("/api/cyber-risk-assessments/:id/scope",       assessmentsScopeHandler as Handler),
  makeRoute("/api/cyber-risk-assessments/:id/exclusions",  assessmentsExclusionsHandler as Handler),
  makeRoute("/api/cyber-risk-assessments/:id",             craAssessmentsIdHandler as Handler),
  makeRoute("/api/cyber-risk-assessments",                 craAssessmentsHandler),
  // Scenarios
  makeRoute("/api/scenarios/score",                        scenariosScoreHandler as Handler),
  makeRoute("/api/scenarios/:id",                          scenariosIdHandler as Handler),
];

// ---------------------------------------------------------------------------
// Vercel adapter helpers
// ---------------------------------------------------------------------------

function readBody(req: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = [];
    req.on("data", (chunk: Buffer) => chunks.push(chunk));
    req.on("end", () => {
      const raw = Buffer.concat(chunks).toString();
      if (!raw) return resolve(undefined);
      try {
        resolve(JSON.parse(raw));
      } catch {
        resolve(raw);
      }
    });
  });
}

function adaptResponse(res: ServerResponse): VercelResponse {
  let currentStatus = 200;
  const vres = res as unknown as VercelResponse;

  vres.status = (code: number) => {
    currentStatus = code;
    res.statusCode = code;
    return vres;
  };

  vres.json = (data: unknown) => {
    if (!res.headersSent) {
      res.setHeader("Content-Type", "application/json");
      res.statusCode = currentStatus;
    }
    res.end(JSON.stringify(data));
    return vres;
  };

  vres.send = (data: unknown) => {
    if (!res.headersSent) {
      res.statusCode = currentStatus;
    }
    if (typeof data === "string") {
      res.end(data);
    } else {
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify(data));
    }
    return vres;
  };

  return vres;
}

// ---------------------------------------------------------------------------
// HTTP server
// ---------------------------------------------------------------------------

const PORT = 3001;

const server = http.createServer(async (req, res) => {
  // CORS — Vite dev server runs on a different port
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const pathname = url.pathname;

  for (const { pattern, paramNames, handler } of ROUTES) {
    const match = pathname.match(pattern);
    if (!match) continue;

    // Build query object from URL search params
    const query: Record<string, string | string[]> = {};
    url.searchParams.forEach((value, key) => {
      const existing = query[key];
      if (existing === undefined) {
        query[key] = value;
      } else if (Array.isArray(existing)) {
        (existing as string[]).push(value);
      } else {
        query[key] = [existing as string, value];
      }
    });

    // Merge dynamic path params into query (Vercel convention: /threats/:id → req.query.id)
    const params: Record<string, string> = {};
    paramNames.forEach((name, i) => {
      params[name] = match[i + 1]!;
    });

    const body = await readBody(req);

    const vreq = req as unknown as VercelRequest;
    vreq.body = body;
    vreq.query = { ...query, ...params };
    vreq.cookies = {};

    const vres = adaptResponse(res);

    try {
      handler(vreq, vres);
    } catch (err) {
      console.error("[api-server] handler error:", err);
      if (!res.writableEnded) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Internal server error" }));
      }
    }
    return;
  }

  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: `No route matched: ${pathname}` }));
});

server.listen(PORT, () => {
  console.log(`  \x1b[36m➜\x1b[0m  API server:  \x1b[1mhttp://localhost:${PORT}\x1b[0m`);
});
