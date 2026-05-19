CREATE TABLE "client_messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"client_id" uuid NOT NULL,
	"occurred_at" timestamp with time zone DEFAULT now() NOT NULL,
	"channel" text NOT NULL,
	"channel_other" text,
	"body" text NOT NULL,
	"action_item" text,
	"action_done" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "client_messages" ADD CONSTRAINT "client_messages_client_id_clients_id_fk" FOREIGN KEY ("client_id") REFERENCES "public"."clients"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "client_messages_client_occurred_idx" ON "client_messages" USING btree ("client_id","occurred_at");--> statement-breakpoint
CREATE INDEX "client_messages_client_action_open_idx" ON "client_messages" USING btree ("client_id","action_done");