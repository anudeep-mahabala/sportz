import { Router } from "express";
import {
  createMatchSchema,
  listMatchesQuerySchema,
} from "../validation/matches.js";
import { db } from "../db/db.js";
import { matches } from "../db/schema.js";
import { getMatchStatus } from "../util/match-status.js";
import { desc } from "drizzle-orm";

export const matchRouter = Router();

matchRouter.get("/", async (req, res) => {
  const parsed = listMatchesQuerySchema.safeParse(req.body);
  if (!parsed)
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(parsed.error),
    });
  const limit = Math.min(parsed.data.limit ?? 50);

  try {
    const data = await db
      .select()
      .from(matches)
      .orderBy(desc(matches.createdAt))
      .limit(limit);
    res.json({ data });
  } catch (error) {
    res.status(500).json({
      error: "Failed to list match",
      details: JSON.stringify(error.message),
    });
  }
});

matchRouter.post("/", async (req, res) => {
  const parsed = createMatchSchema.safeParse(req.body);

  if (!parsed.success)
    return res.status(400).json({
      error: "Invalid payload",
      details: JSON.stringify(parsed.error),
    });
  try {
    const [event] = await db
      .insert(matches)
      .values({
        ...parsed.data,
        startTime: new Date(parsed.data.startTime),
        endTime: parsed.data.endTime ? new Date(parsed.data.endTime) : null,
        homeScore: parsed.data.homeScore ?? 0,
        awayScore: parsed.data.awayScore ?? 0,
        status: getMatchStatus(parsed.data.startTime, parsed.data.endTime),
      })
      .returning();

    if (res.app.locals.broadCastMatchCreated) {
      res.app.locals.broadCastMatchCreated(event);
    }

    res.status(201).json({ data: event });
  } catch (error) {
    res.status(500).json({
      error: "Failed to create match",
      details: JSON.stringify(error.message),
    });
  }
});
