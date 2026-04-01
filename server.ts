import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import apiRoutes from "./backend/routes.js";
import { bot } from "./backend/bot.js";

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT) : 3000;

  app.use(express.json());
  app.use("/api", apiRoutes);

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });

  // Start bot polling after server is up
  if (bot) {
    bot.start({
      onStart: () => console.log("Bot is running"),
    });
  }
}

startServer();
