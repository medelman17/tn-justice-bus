ALTER TABLE "verification_codes" ALTER COLUMN "phone" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "verification_codes" ADD COLUMN "email" varchar(255);