# 🏆 Sportz

A real-time sports data server built with Node.js, WebSockets, and Neon PostgreSQL — enabling users to subscribe to live match updates and commentary streams.

---

## Features

- **Real-time WebSocket broadcasting** — push live updates to subscribed clients instantly
- **Match subscriptions** — users can subscribe to specific matches and receive targeted updates
- **Global broadcasts** — send announcements or updates to all connected clients at once
- **Live commentary** — dedicated commentary route for ball-by-ball or event-based updates
- **Match management** — REST routes for match data and lifecycle management
- **Security with Arcjet** — rate limiting and bot protection out of the box
- **Neon PostgreSQL** — serverless, scalable PostgreSQL database
- **Drizzle ORM** — type-safe, lightweight database access layer

---

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Runtime    | Node.js                 |
| Database   | Neon PostgreSQL         |
| ORM        | Drizzle                 |
| Real-time  | WebSockets (ws)         |
| Security   | Arcjet                  |
| Validation | Custom validation layer |

---

## Project Structure

```
sportz/
├── src/
│   ├── db/             # Drizzle schema, migrations, and DB client
│   ├── routes/
│   │   ├── matches.js  # Match CRUD and management endpoints
│   │   └── commentary.js # Live commentary endpoints
│   ├── ws/
│   │   ├── broadcastToAll.js    # Broadcast updates to all connected clients
│   │   └── broadcastToMatch.js  # Broadcast updates to match subscribers
│   ├── validation/     # Request validation logic
│   └── util/           # Helper utilities
├── drizzle/            # Drizzle migration files
├── drizzle.config.js   # Drizzle ORM configuration
├── arcjet.js           # Arcjet security configuration
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Neon](https://neon.tech) PostgreSQL database
- An [Arcjet](https://arcjet.com) account and API key

### Installation

```bash
git clone https://github.com/anudeep-mahabala/sportz.git
cd sportz
npm install
```

### Environment Variables

Create a `.env` file in the root of the project:

```env
DATABASE_URL=your_neon_postgresql_connection_string
ARCJET_KEY=your_arcjet_api_key
```

### Database Setup

Run Drizzle migrations to set up the schema:

```bash
npx drizzle-kit push
```

### Running the Server

```bash
node src/index.js
```

---

## WebSocket API

### Connecting

```
ws://localhost:<PORT>
```

On connection, clients can subscribe to specific matches or receive global broadcasts.

### Subscribing to a Match

Send a subscription message after connecting:

```json
{
  "type": "subscribe",
  "matchId": "match_id_here"
}
```

### Broadcast Types

| Type               | Description                                                    |
| ------------------ | -------------------------------------------------------------- |
| `broadcastToAll`   | Sends a message to every connected client                      |
| `broadcastToMatch` | Sends a message only to clients subscribed to a specific match |

---

## REST API

### Matches

| Method | Endpoint       | Description          |
| ------ | -------------- | -------------------- |
| GET    | `/matches`     | Get all matches      |
| GET    | `/matches/:id` | Get a specific match |
| POST   | `/matches`     | Create a new match   |
| PUT    | `/matches/:id` | Update match details |

### Commentary

| Method | Endpoint               | Description                |
| ------ | ---------------------- | -------------------------- |
| GET    | `/commentary/:matchId` | Get commentary for a match |
| POST   | `/commentary`          | Add a commentary event     |

---

## Security

This project uses [Arcjet](https://arcjet.com) for:

- **Rate limiting** — prevents API abuse and excessive WebSocket connections
- **Bot detection** — blocks automated traffic from hitting your endpoints
- **Shield protection** — guards against common attack patterns

Configuration lives in `arcjet.js` at the project root.

---

## Database

Powered by [Neon](https://neon.tech) — a serverless PostgreSQL platform with autoscaling and branching support.

Schema and migrations are managed via [Drizzle ORM](https://orm.drizzle.team). All schema definitions live in `src/db/`.
