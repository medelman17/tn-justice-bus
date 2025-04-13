CREATE TABLE "verification_codes" (
	"id" text PRIMARY KEY NOT NULL,
	"phone" varchar(15) NOT NULL,
	"code" varchar(6) NOT NULL,
	"expires" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
