import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

const app = express();
const PORT = 3000;

app.use(express.json());

// Future Artist iOS IPA Download Endpoint
app.get("/downloads/FutureArtist.ipa", (req, res) => {
  const downloadsDir = path.join(process.cwd(), "public", "downloads");
  if (!fs.existsSync(downloadsDir)) {
    fs.mkdirSync(downloadsDir, { recursive: true });
  }
  const ipaFilePath = path.join(downloadsDir, "FutureArtist.ipa");
  if (!fs.existsSync(ipaFilePath)) {
    fs.writeFileSync(
      ipaFilePath,
      "Future Artist iOS IPA Package\nVersion 2.4.0\nReady for KSign / ESign Sideloading."
    );
  }
  res.setHeader("Content-Disposition", 'attachment; filename="FutureArtist.ipa"');
  res.setHeader("Content-Type", "application/octet-stream");
  res.sendFile(ipaFilePath);
});

// App Info / Status Endpoint
app.get("/api/app-status", (req, res) => {
  res.json({
    appName: "Future Artist",
    version: "2.4.0",
    platform: "Capacitor iOS & Web PWA",
    notificationType: "Local Notifications (@capacitor/local-notifications)",
    domainFlexible: true
  });
});

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    // Development Mode
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
    console.log("[Server] Vite development middleware mounted");
  } else {
    // Production Mode
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));

    // Fallback for Single Page App routing
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("[Server] Static production paths active");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[Server] Future Artist application active on http://0.0.0.0:${PORT}`);
  });
}

startServer();
