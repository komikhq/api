ALTER TABLE "comments" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "guest_name" text;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "guest_email" text;--> statement-breakpoint
ALTER TABLE "comments" ADD COLUMN "is_spoiler" boolean DEFAULT false NOT NULL;