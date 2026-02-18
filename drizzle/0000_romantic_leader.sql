CREATE TABLE "decklist_cards" (
	"tournament_id" text NOT NULL,
	"standing_player" text NOT NULL,
	"card_type" text NOT NULL,
	"card_name" text NOT NULL,
	"card_set" text NOT NULL,
	"card_number" text NOT NULL,
	"count" integer NOT NULL,
	"card_id" text,
	CONSTRAINT "decklist_cards_pk" PRIMARY KEY("tournament_id","standing_player","card_name","card_set")
);
--> statement-breakpoint
CREATE TABLE "pairings" (
	"tournament_id" text NOT NULL,
	"round" integer NOT NULL,
	"phase" text NOT NULL,
	"tbl" integer NOT NULL,
	"player1" text NOT NULL,
	"player2" text NOT NULL,
	"winner" text,
	CONSTRAINT "pairings_pk" PRIMARY KEY("tournament_id","round","tbl")
);
--> statement-breakpoint
CREATE TABLE "standings" (
	"tournament_id" text NOT NULL,
	"player" text NOT NULL,
	"display_name" text NOT NULL,
	"country" text NOT NULL,
	"placing" integer,
	"wins" integer NOT NULL,
	"losses" integer NOT NULL,
	"ties" integer NOT NULL,
	"drop_round" integer,
	"deck_id" text,
	"deck_name" text,
	"leader_name" text,
	"leader_set" text,
	"leader_number" text,
	CONSTRAINT "standings_pk" PRIMARY KEY("tournament_id","player")
);
--> statement-breakpoint
CREATE TABLE "sync_log" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" text NOT NULL,
	"sync_type" text NOT NULL,
	"status" text NOT NULL,
	"message" text,
	"started_at" text NOT NULL,
	"completed_at" text
);
--> statement-breakpoint
CREATE TABLE "tournaments" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"date" text NOT NULL,
	"player_count" integer NOT NULL,
	"platform" text NOT NULL,
	"format" text NOT NULL,
	"round_count" integer NOT NULL,
	"synced_at" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "pairings" ADD CONSTRAINT "pairings_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "standings" ADD CONSTRAINT "standings_tournament_id_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."tournaments"("id") ON DELETE no action ON UPDATE no action;