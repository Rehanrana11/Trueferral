# ════════════════════════════════════════════════════════════════════════════
# TRUEFERRAL — STEP 1: FIX ALL 5 BLOCKERS
# Run these in order in VS Code PowerShell terminal
# Current working dir assumption: E:\introflow - Copy\signaling-server
# ════════════════════════════════════════════════════════════════════════════


# ══════════════════════════════════════════════
# FIX 1 — JWT_SECRET missing from .env
# ══════════════════════════════════════════════
# Make sure you are in the signaling-server folder:
cd "E:\introflow - Copy\signaling-server"

# Generate a proper 128-char hex secret and write the FULL .env in one shot:
$secret = -join ((1..128) | ForEach-Object { '{0:x}' -f (Get-Random -Max 16) })

$envContent = @"
NODE_ENV=development
PORT=8443
TLS_KEY_PATH=./certs/server.key
TLS_CERT_PATH=./certs/server.crt
JWT_SECRET=$secret
JWT_EXPIRY=15m
REDIS_URL=redis://localhost:6379
REDIS_MOCK=true
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:8443
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX=100
LOG_LEVEL=info
STUN_URLS=stun:stun.l.google.com:19302,stun:stun1.l.google.com:19302
TURN_URLS=turn:your-turn-server.com:3478
TURN_USERNAME=placeholder
TURN_CREDENTIAL=placeholder
MAX_ROOM_PARTICIPANTS=10
SESSION_IDLE_TIMEOUT_MS=300000
"@

[System.IO.File]::WriteAllText("$PWD\.env", $envContent, [System.Text.Encoding]::UTF8)

# Verify it looks correct:
Get-Content .env


# ══════════════════════════════════════════════
# FIX 2 — Create missing metricsHandler.ts
# ══════════════════════════════════════════════

$metricsHandler = @'
import { Router, Request, Response } from 'express';
import { prometheusClient } from '../utils/metrics';

export const metricsRouter = Router();

metricsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    res.set('Content-Type', prometheusClient.register.contentType);
    res.end(await prometheusClient.register.metrics());
  } catch (_err) {
    res.status(500).end();
  }
});
'@
[System.IO.File]::WriteAllText("$PWD\src\handlers\metricsHandler.ts", $metricsHandler, [System.Text.Encoding]::UTF8)

Write-Host "metricsHandler.ts created" -ForegroundColor Green


# ══════════════════════════════════════════════
# FIX 3 — Create mock Redis service
# (lets server boot without Docker/Redis running)
# ══════════════════════════════════════════════

$mockRedis = @'
import { VideoSession, SessionStatus } from "./redisSessionService";
import { logger } from "../utils/logger";

export class RedisSessionService {
  private store = new Map<string, VideoSession>();

  constructor() {
    logger.warn("Using IN-MEMORY mock Redis — NOT for production");
  }

  async getSession(sessionId: string): Promise<VideoSession | null> {
    return this.store.get(sessionId) ?? null;
  }

  async setSession(session: VideoSession): Promise<void> {
    this.store.set(session.sessionId, session);
  }

  async addParticipant(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    if (!session.participants.includes(userId)) session.participants.push(userId);
    if (session.status === "scheduled") { session.status = "live"; session.startedAt = Date.now(); }
    await this.setSession(session);
  }

  async removeParticipant(sessionId: string, userId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    session.participants = session.participants.filter((p) => p !== userId);
    await this.setSession(session);
  }

  async markSessionEnded(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    session.status = "ended";
    session.endedAt = Date.now();
    await this.setSession(session);
  }

  async isHealthy(): Promise<boolean> { return true; }

  async disconnect(): Promise<void> {
    this.store.clear();
    logger.info("Mock Redis cleared");
  }
}

export type { VideoSession, SessionStatus };
'@
[System.IO.File]::WriteAllText("$PWD\src\services\redisSessionService.mock.ts", $mockRedis, [System.Text.Encoding]::UTF8)

Write-Host "redisSessionService.mock.ts created" -ForegroundColor Green


# ══════════════════════════════════════════════
# FIX 4 — Update server.ts to use mock Redis
# when REDIS_MOCK=true in .env
# ══════════════════════════════════════════════

$serverTs = @'
import "dotenv/config";
import https from "https";
import http from "http";
import fs from "fs";
import { WebSocketServer, WebSocket } from "ws";
import express from "express";
import helmet from "helmet";
import cors from "cors";
import { rateLimiter } from "./middleware/rateLimiter";
import { healthRouter } from "./handlers/healthHandler";
import { metricsRouter } from "./handlers/metricsHandler";
import { SignalingHandler } from "./handlers/signalingHandler";
import { logger } from "./utils/logger";
import { config } from "./config/config";
import { RedisSessionService as RealRedis } from "./services/redisSessionService";
import { RedisSessionService as MockRedis } from "./services/redisSessionService.mock";

const useMock = process.env.REDIS_MOCK === "true";
const sessionService: any = useMock ? new MockRedis() : new RealRedis();
if (useMock) logger.warn("REDIS_MOCK=true — using in-memory session store");

const app = express();
app.use(helmet());
app.use(cors({ origin: config.ALLOWED_ORIGINS, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(rateLimiter);
app.use("/health", healthRouter);
app.use("/metrics", metricsRouter);

let server: https.Server | http.Server;
if (config.NODE_ENV === "production") {
  server = https.createServer({ key: fs.readFileSync(config.TLS_KEY_PATH), cert: fs.readFileSync(config.TLS_CERT_PATH), minVersion: "TLSv1.2" }, app);
  logger.info("TLS enabled");
} else {
  server = http.createServer(app);
  logger.warn("TLS disabled — dev mode");
}

const wss = new WebSocketServer({
  server, path: "/ws", maxPayload: 64 * 1024,
  verifyClient: ({ req }, cb) => {
    const token = req.url ? new URL(req.url, `http://${req.headers.host}`).searchParams.get("token") : null;
    if (!token) { logger.warn("WS rejected — missing token"); cb(false, 401, "Unauthorized"); return; }
    cb(true);
  },
});

const signalingHandler = new SignalingHandler(wss, sessionService);
wss.on("connection", (ws: WebSocket, req) => signalingHandler.handleConnection(ws, req));
wss.on("error", (err) => logger.error("WSS error", { error: err.message }));

const shutdown = async (signal: string) => {
  logger.info(`${signal} — shutting down`);
  wss.clients.forEach((ws) => ws.close(1001, "Server shutting down"));
  wss.close(() => server.close(async () => { await sessionService.disconnect(); process.exit(0); }));
  setTimeout(() => process.exit(1), 10_000);
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => { logger.error("Uncaught", { error: err.message }); process.exit(1); });
process.on("unhandledRejection", (reason) => { logger.error("Unhandled rejection", { reason }); process.exit(1); });

server.listen(config.PORT, () => {
  logger.info(`Trueferral Signaling Server listening on port ${config.PORT}`, { env: config.NODE_ENV, pid: process.pid });
});

export { server, wss };
'@
[System.IO.File]::WriteAllText("$PWD\src\server.ts", $serverTs, [System.Text.Encoding]::UTF8)

Write-Host "server.ts updated with REDIS_MOCK support" -ForegroundColor Green


# ══════════════════════════════════════════════
# FIX 5 — Generate self-signed TLS certs
# using node-forge (no openssl binary needed)
# ══════════════════════════════════════════════

npm install node-forge --no-save

$certScript = @'
const fs = require("fs");
const forge = require("node-forge");

console.log("Generating self-signed cert...");
const keys = forge.pki.rsa.generateKeyPair(2048);
const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = "01";
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
const attrs = [{ name: "commonName", value: "localhost" }];
cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([{ name: "basicConstraints", cA: true }]);
cert.sign(keys.privateKey, forge.md.sha256.create());
fs.mkdirSync("certs", { recursive: true });
fs.writeFileSync("certs/server.key", forge.pki.privateKeyToPem(keys.privateKey));
fs.writeFileSync("certs/server.crt", forge.pki.certificateToPem(cert));
console.log("certs/server.key and certs/server.crt written OK");
'@

[System.IO.File]::WriteAllText("$PWD\generate-certs.js", $certScript, [System.Text.Encoding]::UTF8)
node generate-certs.js

Write-Host "TLS certs generated" -ForegroundColor Green


# ══════════════════════════════════════════════
# ALL FIXES APPLIED — NOW START THE SERVER
# ══════════════════════════════════════════════

npm run dev


# ══════════════════════════════════════════════
# VERIFY (open a NEW terminal tab: Ctrl+Shift+`)
# ══════════════════════════════════════════════
# Invoke-WebRequest -Uri http://localhost:8443/health | Select-Object -ExpandProperty Content
#
# Expected:
# {"status":"healthy","checks":{"redis":"ok","process":"ok"},...}
#
# ════════════════════════════════════════════════════════════════════════════
# AFTER THIS WORKS:
#   - Install Docker Desktop from: https://www.docker.com/products/docker-desktop
#   - Restart PC after Docker install
#   - Then run: docker run -d --name trueferral-redis -p 6379:6379 redis:7.2-alpine
#   - Remove REDIS_MOCK=true from .env
#   - npm run dev again — now using real Redis
# ════════════════════════════════════════════════════════════════════════════
