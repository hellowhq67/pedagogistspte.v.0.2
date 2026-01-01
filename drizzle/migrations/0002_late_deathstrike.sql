CREATE TYPE "public"."subscription_status" AS ENUM('active', 'expired', 'cancelled', 'trial');--> statement-breakpoint
CREATE TYPE "public"."subscription_tier" AS ENUM('free', 'basic', 'premium', 'unlimited');--> statement-breakpoint
CREATE TYPE "public"."pte_category" AS ENUM('speaking', 'writing', 'reading', 'listening');--> statement-breakpoint
CREATE TYPE "public"."pte_question_type_code" AS ENUM('read_aloud', 'repeat_sentence', 'describe_image', 'retell_lecture', 'answer_short_question', 'respond_to_situation', 'summarize_group_discussion', 'summarize_written_text', 'essay', 'reading_fill_blanks_dropdown', 'reading_mc_multiple', 'reorder_paragraphs', 'reading_fill_blanks_drag', 'reading_mc_single', 'summarize_spoken_text', 'listening_mc_multiple', 'listening_fill_blanks', 'highlight_correct_summary', 'listening_mc_single', 'select_missing_word', 'highlight_incorrect_words', 'write_from_dictation');--> statement-breakpoint
CREATE TYPE "public"."pte_attempt_status" AS ENUM('in_progress', 'completed', 'abandoned', 'under_review');--> statement-breakpoint
CREATE TYPE "public"."pte_mock_test_status" AS ENUM('not_started', 'in_progress', 'completed', 'expired');--> statement-breakpoint
CREATE TABLE "pte_listening_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"audio_file_url" text NOT NULL,
	"audio_duration" integer,
	"transcript" text,
	"question_text" text,
	"options" jsonb,
	"correct_answer_positions" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_listening_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_reading_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"passage_text" text NOT NULL,
	"question_text" text,
	"options" jsonb,
	"correct_answer_positions" jsonb,
	"explanation" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_reading_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_speaking_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"audio_prompt_url" text,
	"expected_duration" integer,
	"sample_transcript" text,
	"key_points" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_speaking_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_writing_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"question_id" uuid NOT NULL,
	"prompt_text" text NOT NULL,
	"passage_text" text,
	"word_count_min" integer NOT NULL,
	"word_count_max" integer NOT NULL,
	"essay_type" text,
	"key_themes" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pte_writing_questions_question_id_unique" UNIQUE("question_id")
);
--> statement-breakpoint
CREATE TABLE "pte_mock_test_questions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"mock_test_id" uuid NOT NULL,
	"question_id" uuid NOT NULL,
	"attempt_id" uuid,
	"question_order" integer NOT NULL,
	"section_name" text,
	"score" integer,
	"max_score" integer NOT NULL,
	"is_completed" boolean DEFAULT false NOT NULL,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "pte_mock_tests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"test_name" text NOT NULL,
	"status" "pte_mock_test_status" DEFAULT 'not_started' NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"total_duration" integer,
	"overall_score" integer,
	"speaking_score" integer,
	"writing_score" integer,
	"reading_score" integer,
	"listening_score" integer,
	"scores" jsonb,
	"total_questions" integer NOT NULL,
	"completed_questions" integer DEFAULT 0 NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "practice_sessions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_question_media" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_sync_jobs" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_tests" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "pte_user_exam_settings" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "test_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "mock_test_categories" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_subscriptions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "speaking_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "speaking_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "speaking_templates" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reading_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "reading_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "writing_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "writing_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "listening_attempts" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "listening_questions" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "practice_sessions" CASCADE;--> statement-breakpoint
DROP TABLE "pte_question_media" CASCADE;--> statement-breakpoint
DROP TABLE "pte_sync_jobs" CASCADE;--> statement-breakpoint
DROP TABLE "pte_tests" CASCADE;--> statement-breakpoint
DROP TABLE "pte_user_exam_settings" CASCADE;--> statement-breakpoint
DROP TABLE "test_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "mock_test_categories" CASCADE;--> statement-breakpoint
DROP TABLE "user_subscriptions" CASCADE;--> statement-breakpoint
DROP TABLE "speaking_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "speaking_questions" CASCADE;--> statement-breakpoint
DROP TABLE "speaking_templates" CASCADE;--> statement-breakpoint
DROP TABLE "reading_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "reading_questions" CASCADE;--> statement-breakpoint
DROP TABLE "writing_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "writing_questions" CASCADE;--> statement-breakpoint
DROP TABLE "listening_attempts" CASCADE;--> statement-breakpoint
DROP TABLE "listening_questions" CASCADE;--> statement-breakpoint
ALTER TABLE "test_answers" RENAME TO "pte_categories";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP CONSTRAINT "pte_questions_test_id_pte_tests_id_fk";
--> statement-breakpoint
ALTER TABLE "pte_categories" DROP CONSTRAINT "test_answers_attempt_id_test_attempts_id_fk";
--> statement-breakpoint
ALTER TABLE "pte_categories" DROP CONSTRAINT "test_answers_question_id_pte_questions_id_fk";
--> statement-breakpoint
DROP INDEX "idx_pte_attempts_user_created";--> statement-breakpoint
DROP INDEX "idx_pte_attempts_skill_type";--> statement-breakpoint
DROP INDEX "idx_pte_attempts_question";--> statement-breakpoint
ALTER TABLE "pte_question_types" ALTER COLUMN "code" SET DATA TYPE "public"."pte_question_type_code" USING "code"::"public"."pte_question_type_code";--> statement-breakpoint
ALTER TABLE "pte_questions" ALTER COLUMN "correct_answer" SET DATA TYPE jsonb;--> statement-breakpoint
ALTER TABLE "pte_questions" ALTER COLUMN "difficulty" SET DEFAULT 'Medium'::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "pte_questions" ALTER COLUMN "difficulty" SET DATA TYPE "public"."difficulty_level" USING "difficulty"::"public"."difficulty_level";--> statement-breakpoint
ALTER TABLE "pte_questions" ALTER COLUMN "difficulty" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_tier" "subscription_tier" DEFAULT 'free' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_status" "subscription_status" DEFAULT 'active' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "subscription_expires_at" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "exam_date" timestamp;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "monthly_practice_limit" integer DEFAULT 10 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "practice_questions_this_month" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "last_monthly_reset" timestamp DEFAULT now();--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "category_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "has_ai_scoring" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "max_score" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "scoring_criteria" jsonb;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "time_limit" integer;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "preparation_time" integer;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "word_count_min" integer;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "word_count_max" integer;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "display_order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "instructions" text;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "sample_question_url" text;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "question_type_id" uuid NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "title" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "content" text;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "audio_url" text;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "image_url" text;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "sample_answer" text;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "scoring_rubric" jsonb;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "is_premium" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "usage_count" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "average_score" integer;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "code" "pte_category" NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "name" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "description" text;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "display_order" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "is_active" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_categories" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "ai_credit_usage" ADD COLUMN "pte_attempt_id" uuid;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "status" "pte_attempt_status" DEFAULT 'in_progress' NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "attempt_number" integer DEFAULT 1 NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "response_text" text;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "response_audio_url" text;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "response_data" jsonb;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "started_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "completed_at" timestamp;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "ai_score" integer;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "ai_scores" jsonb;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "ai_feedback" text;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "ai_scored_at" timestamp;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "manual_score" integer;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "manual_feedback" text;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "reviewed_by" text;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "reviewed_at" timestamp;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "final_score" integer;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "metadata" jsonb;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "pte_listening_questions" ADD CONSTRAINT "pte_listening_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_reading_questions" ADD CONSTRAINT "pte_reading_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_speaking_questions" ADD CONSTRAINT "pte_speaking_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_writing_questions" ADD CONSTRAINT "pte_writing_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_mock_test_id_pte_mock_tests_id_fk" FOREIGN KEY ("mock_test_id") REFERENCES "public"."pte_mock_tests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_test_questions" ADD CONSTRAINT "pte_mock_test_questions_attempt_id_pte_attempts_id_fk" FOREIGN KEY ("attempt_id") REFERENCES "public"."pte_attempts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_mock_tests" ADD CONSTRAINT "pte_mock_tests_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_mock_test_id" ON "pte_mock_test_questions" USING btree ("mock_test_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_question_id" ON "pte_mock_test_questions" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_test_questions_attempt_id" ON "pte_mock_test_questions" USING btree ("attempt_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_user_id" ON "pte_mock_tests" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_status" ON "pte_mock_tests" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_scheduled_at" ON "pte_mock_tests" USING btree ("scheduled_at");--> statement-breakpoint
CREATE INDEX "idx_pte_mock_tests_created_at" ON "pte_mock_tests" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "pte_question_types" ADD CONSTRAINT "pte_question_types_category_id_pte_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."pte_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_questions" ADD CONSTRAINT "pte_questions_question_type_id_pte_question_types_id_fk" FOREIGN KEY ("question_type_id") REFERENCES "public"."pte_question_types"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pte_attempts" ADD CONSTRAINT "pte_attempts_question_id_pte_questions_id_fk" FOREIGN KEY ("question_id") REFERENCES "public"."pte_questions"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_category_id" ON "pte_question_types" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_code" ON "pte_question_types" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_pte_question_types_is_active" ON "pte_question_types" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_question_type_id" ON "pte_questions" USING btree ("question_type_id");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_difficulty" ON "pte_questions" USING btree ("difficulty");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_is_active" ON "pte_questions" USING btree ("is_active");--> statement-breakpoint
CREATE INDEX "idx_pte_questions_is_premium" ON "pte_questions" USING btree ("is_premium");--> statement-breakpoint
CREATE INDEX "idx_ai_usage_pte_attempt_id" ON "ai_credit_usage" USING btree ("pte_attempt_id");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_user_id" ON "pte_attempts" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_question_id" ON "pte_attempts" USING btree ("question_id");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_status" ON "pte_attempts" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_created_at" ON "pte_attempts" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "idx_pte_attempts_user_question" ON "pte_attempts" USING btree ("user_id","question_id");--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "title";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "icon";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "color";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "short_name";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "scoring_type";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "video_link";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "timer_prep_ms";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "timer_record_ms";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "section";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "parent_code";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "first_question_id";--> statement-breakpoint
ALTER TABLE "pte_question_types" DROP COLUMN "question_count";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "test_id";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "external_id";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "source";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "question";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "question_type";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "section";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "question_data";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "points";--> statement-breakpoint
ALTER TABLE "pte_questions" DROP COLUMN "order_index";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "attempt_id";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "question_id";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "user_answer";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "is_correct";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "points_earned";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "ai_feedback";--> statement-breakpoint
ALTER TABLE "pte_categories" DROP COLUMN "submitted_at";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "skill_type";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "source_attempt_id";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "source_table";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "question_type";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "section";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "user_response";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "scores";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "overall_score";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "accuracy";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "word_count";--> statement-breakpoint
ALTER TABLE "pte_attempts" DROP COLUMN "duration_ms";--> statement-breakpoint
ALTER TABLE "pte_categories" ADD CONSTRAINT "pte_categories_code_unique" UNIQUE("code");--> statement-breakpoint
DROP TYPE "public"."listening_question_type";--> statement-breakpoint
DROP TYPE "public"."reading_question_type";--> statement-breakpoint
DROP TYPE "public"."speaking_type";--> statement-breakpoint
DROP TYPE "public"."writing_question_type";