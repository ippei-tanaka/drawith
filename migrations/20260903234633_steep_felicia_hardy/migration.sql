CREATE TABLE "user_profiles" (
	"user_id" uuid PRIMARY KEY,
	"first_name" text,
	"last_name" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
