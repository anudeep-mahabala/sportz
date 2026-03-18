CREATE TYPE "public"."match_status" AS ENUM('scheduled', 'live', 'finished');--> statement-breakpoint
CREATE TABLE "matches" (
	"id" serial PRIMARY KEY NOT NULL,
	"sport" text NOT NULL,
	"home_team" text NOT NULL,
	"away_team" text NOT NULL,
	"status" "match_status" DEFAULT 'scheduled' NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp,
	"home_score" integer DEFAULT 0 NOT NULL,
	"away_score" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "demo_users" RENAME TO "commentary";--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "match_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "minute" integer;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "sequence" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "period" text;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "event_type" text NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "actor" text;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "team" text;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "message" text NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "tags" text[];--> statement-breakpoint
ALTER TABLE "commentary" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "commentary" ADD CONSTRAINT "commentary_match_id_matches_id_fk" FOREIGN KEY ("match_id") REFERENCES "public"."matches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "commentary" DROP COLUMN "name";