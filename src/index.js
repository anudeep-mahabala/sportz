import express from "express";
import { matchRouter } from "./routes/matches.js";
import "dotenv/config";
import http from "http";
import { attachWebSocketServer } from "./ws/server.js";
import { hostname } from "zod/mini";

const PORT = Number(process.env.PORT || 8000);
const HOST = process.env.HOST || "0.0.0.0";

const app = express();
const server = http.createServer(app);

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Hello from express");
});

app.use("/matches", matchRouter);

const { broadCastMatchCreated } = attachWebSocketServer(server);
app.locals.broadCastMatchCreated = broadCastMatchCreated;

server.listen(PORT, HOST, () => {
  const baseURL =
    HOST === "0.0.0.0" ? `http://localhost:${PORT}` : `http://${HOST}:${PORT}`;
  console.log(`Server running on ${baseURL}`);
  console.log(`WebSocket running on ${baseURL.replace("http", "ws")}/ws`);
});
