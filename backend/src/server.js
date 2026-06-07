//src/server.js
require("dotenv").config();

const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth.routes");
const messagesRoutes = require("./routes/messages.routes");
const tasksRoutes = require("./routes/tasks.routes");
const logsRoutes = require("./routes/logs.routes");
const crewRoutes = require("./routes/crew.routes");
const vitalsRoutes = require("./routes/vitals.routes");
const windowsRoutes = require("./routes/windows.routes");
const uploadRoutes = require("./routes/upload.routes");

const app = express();

app.use(cors());

app.use(
  express.json({
    limit: "1mb",
  }),
);

app.get("/", (req, res) => {
  return res.json({
    name: "MarsLink API",
    description:
      "API REST para comunicação e coordenação de missões em latência extrema.",
    status: "online",
    mission: "ARES-1",
  });
});

app.get("/api/health", (req, res) => {
  return res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/messages", messagesRoutes);
app.use("/api/tasks", tasksRoutes);
app.use("/api/logs", logsRoutes);
app.use("/api/crew", crewRoutes);
app.use("/api/vitals", vitalsRoutes);
app.use("/api/windows", windowsRoutes);
app.use("/api/upload", uploadRoutes);

app.use((req, res) => {
  return res.status(404).json({
    message: "Rota não encontrada.",
  });
});

const port = process.env.PORT || 3333;

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`MarsLink API rodando em http://localhost:${port}`);
  });
}

module.exports = app;