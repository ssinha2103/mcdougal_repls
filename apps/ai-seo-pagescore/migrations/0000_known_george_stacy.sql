CREATE TABLE "analysis_jobs" (
	"id" serial PRIMARY KEY NOT NULL,
	"urls" text[] NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"results" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "seo_metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"url" text NOT NULL,
	"domain" text NOT NULL,
	"indexed_pages" integer,
	"referring_domains" integer,
	"backlinks" integer,
	"organic_keywords" integer,
	"organic_traffic" integer,
	"traffic_cost" text,
	"top_100_keywords" integer,
	"keyword_positions" text,
	"competitor_gap" integer,
	"page_speed" text,
	"has_author_box" boolean DEFAULT false,
	"has_linked_author" boolean DEFAULT false,
	"has_structured_data" boolean DEFAULT false,
	"structured_content_score" integer DEFAULT 0,
	"experience_signals" integer DEFAULT 0,
	"original_media_count" integer DEFAULT 0,
	"trust_signals_score" integer DEFAULT 0,
	"analysis_job_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "seo_metrics" ADD CONSTRAINT "seo_metrics_analysis_job_id_analysis_jobs_id_fk" FOREIGN KEY ("analysis_job_id") REFERENCES "public"."analysis_jobs"("id") ON DELETE no action ON UPDATE no action;