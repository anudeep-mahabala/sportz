import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../../arcjet.js";

function sendJson(socket, payload) {
  if (socket.readyState != WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadCast(wss, payload) {
  wss.clients.forEach((client) => {
    if (client.readyState != WebSocket.OPEN) return;
    client.send(JSON.stringify(payload));
  });
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
    maxPayload: 1024 * 1024,
  });
  wss.on("connection", async (socket, req) => {
    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req);

        if (decision.isDenied) {
          const code = decision.reason.isRateLimit() ? 1013 : 1008;
          const reason = decision.reason.isRateLimit()
            ? "Rate Limit exceeded"
            : "Access denied";
          socket.close(code, reason);
          return;
        }
      } catch (error) {
        console.error("WS Connection Error", error);
        socket.close(1011, "Server Security error");
        return;
      }
    }

    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, { type: "Welcome" });

    socket.on("error", (error) => console.log(error));
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    }, 30000);
  });

  function broadCastMatchCreated(match) {
    broadCast(wss, { type: "match_created", data: match });
  }

  return { broadCastMatchCreated };
}
