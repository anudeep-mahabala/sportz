import { WebSocket, WebSocketServer } from "ws";

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
  wss.on("connection", (socket) => {
    socket.isAlive = true;
    socket.on("pong", () => {
      socket.isAlive = true;
    });

    sendJson(socket, { type: "Welcome" });

    socket.on("error", (error) => console.log(error));
  });

  const interval = setInterval(() => {
    wss.clients.foreach((client) => {
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
