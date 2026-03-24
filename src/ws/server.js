import { WebSocket, WebSocketServer } from "ws";
import { wsArcjet } from "../../arcjet.js";

const matcheSubscribers = new Map();

function subscribe(matchId, socket) {
  if (!matcheSubscribers.has(matchId)) {
    matcheSubscribers.set(matchId, new Set());
  }

  matcheSubscribers.get(matchId).add(socket);
}

function unsubscribe(matchId, socket) {
  const subscribers = matcheSubscribers.get(matchId);
  if (!subscribers) return;

  subscribers.delete(socket);

  if (subscribers.size === 0) {
    matcheSubscribers.delete(matchId);
  }
}

function cleanup(socket) {
  for (const matchId of socket.subscription) {
    unsubscribe(matchId, socket);
  }
}

function broadcastToMatch(matchId, payload) {
  const subscribers = matcheSubscribers.get(matchId);

  if (!subscribers || subscribers.size === 0) return;

  const message = JSON.stringify(payload);
  for (const client of subscribers) {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  }
}

function sendJson(socket, payload) {
  if (socket.readyState != WebSocket.OPEN) return;
  socket.send(JSON.stringify(payload));
}

function broadCastToAll(wss, payload) {
  wss.clients.forEach((client) => {
    if (client.readyState != WebSocket.OPEN) return;
    client.send(JSON.stringify(payload));
  });
}

function handleMessage(socket, data) {
  let message;
  try {
    message = JSON.parse(data.toString());
  } catch (error) {
    sendJson(socket, { type: error, message: "Invalid JSON" });
  }
  if (message?.type === "subscribe" && Number.isInteger(message.matchId)) {
    subscribe(message.matchId, socket);
    socket.subscription.add(message.matchId);
    sendJson(socket, { type: "subscribed", matchId: message.matchId });
    return;
  }

  if (message?.type === "unsubscribe" && Number.isInteger(message.matchId)) {
    unsubscribe(message.matchId, socket);
    socket.subscription.delete(message.matchId);
    sendJson(socket, { type: "unsubscribed", matchId: message.matchId });
  }
}

export function attachWebSocketServer(server) {
  const wss = new WebSocketServer({
    path: "/ws",
    noServer: true,
    maxPayload: 1024 * 1024,
  });

  server.on("upgrade", async (req, socket, head) => {
    const { pathname } = new URL(req.url, `http://${req.headers.host}`);

    if (pathname !== "/ws") {
      socket.write("HTTP/1.1 404 Not Found\r\n\r\n");
      socket.destroy();
      return;
    }

    if (wsArcjet) {
      try {
        const decision = await wsArcjet.protect(req, {
          headers: {
            "user-agent": req.headers["user-agent"] ?? "unknown",
          },
        });

        if (decision.isDenied()) {
          if (decision.reason.isRateLimit()) {
            socket.write("HTTP/1.1 429 Too Many Requests\r\n\r\n");
          } else {
            socket.write("HTTP/1.1 403 Forbidden\r\n\r\n");
          }
          socket.destroy();
          return;
        }
      } catch (e) {
        console.error("WS upgrade protection error", e);
        socket.write("HTTP/1.1 500 Internal Server Error\r\n\r\n");
        socket.destroy();
        return;
      }
    }

    wss.handleUpgrade(req, socket, head, (ws) => {
      wss.emit("connection", ws, req);
    });
  });

  wss.on("connection", async (socket, req) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    socket.subscription = new Set();
    sendJson(socket, { type: "Welcome" });
    socket.on("message", (data) => {
      handleMessage(socket, data);
    });

    socket.on("error", (err) => {
      socket.terminate();
    });

    socket.on("close", () => {
      cleanup(socket);
    });
  });

  const interval = setInterval(() => {
    wss.clients.forEach((client) => {
      if (client.isAlive === false) return client.terminate();
      client.isAlive = false;
      client.ping();
    });
  }, 30000);

  wss.on("close", () => clearInterval(interval));

  function broadCastMatchCreated(match) {
    broadCastToAll(wss, { type: "match_created", data: match });
  }

  function broadCastCommentary(matchId, comment) {
    broadcastToMatch(matchId, { type: "commentary", data: comment });
  }

  return { broadCastMatchCreated, broadCastCommentary };
}
