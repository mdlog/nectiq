CREATE TABLE "abuse_detections" (
	"id" serial PRIMARY KEY NOT NULL,
	"primary_wallet_address" varchar(100) NOT NULL,
	"suspicious_wallet_addresses" text NOT NULL,
	"similarity_score" numeric(5, 2) NOT NULL,
	"detection_reason" text NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"action" varchar(20) DEFAULT 'warn' NOT NULL,
	"reviewed_by" integer,
	"reviewed_at" timestamp,
	"review_notes" text,
	"ip_address" varchar(45) NOT NULL,
	"user_agent" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"target" integer NOT NULL,
	"reward" integer NOT NULL,
	"icon" varchar(50) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "admin_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"admin_id" integer NOT NULL,
	"action" text NOT NULL,
	"target_type" varchar(50),
	"target_id" integer,
	"details" text,
	"ip_address" varchar(45) NOT NULL,
	"user_agent" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "banners" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"image_url" text NOT NULL,
	"link_url" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"position" varchar(20) DEFAULT 'below_live_prices' NOT NULL,
	"priority" integer DEFAULT 0 NOT NULL,
	"start_date" timestamp,
	"end_date" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battle_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"battle_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"message" text NOT NULL,
	"reply_to_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battle_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"battle_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"reaction_type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "battle_spectators" (
	"id" serial PRIMARY KEY NOT NULL,
	"battle_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"left_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "crypto_transactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"transaction_hash" varchar(66) NOT NULL,
	"payment_token" varchar(10) NOT NULL,
	"crypto_amount" numeric(18, 8) NOT NULL,
	"ntiq_amount" integer NOT NULL,
	"user_address" varchar(42) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"block_number" integer,
	"gas_used" varchar(50),
	"network_fee" varchar(50),
	"exchange_rate" numeric(18, 2) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "crypto_transactions_transaction_hash_unique" UNIQUE("transaction_hash")
);
--> statement-breakpoint
CREATE TABLE "cryptocurrencies" (
	"id" varchar(20) PRIMARY KEY NOT NULL,
	"symbol" varchar(10) NOT NULL,
	"name" text NOT NULL,
	"current_price" numeric(18, 8) NOT NULL,
	"price_change_24h" numeric(5, 2) NOT NULL,
	"pyth_feed_id" varchar(66),
	"image" text,
	"last_updated" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "daily_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" text NOT NULL,
	"type" varchar(50) NOT NULL,
	"target" integer NOT NULL,
	"reward" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"is_active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "deposits" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"from_wallet_address" varchar(42) NOT NULL,
	"to_wallet_address" varchar(42) NOT NULL,
	"chain_name" varchar(20) NOT NULL,
	"chain_id" integer NOT NULL,
	"token_type" varchar(10) NOT NULL,
	"token_address" varchar(42) NOT NULL,
	"amount_usd" numeric(18, 6) NOT NULL,
	"ntiq_amount" integer NOT NULL,
	"eth_price_snapshot" numeric(20, 8),
	"transaction_hash" varchar(66),
	"block_number" integer,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"processed_at" timestamp,
	"expires_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "deposits_transaction_hash_unique" UNIQUE("transaction_hash")
);
--> statement-breakpoint
CREATE TABLE "events" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"short_description" text,
	"image_url" text,
	"event_type" varchar(30) DEFAULT 'nectiq' NOT NULL,
	"status" varchar(20) DEFAULT 'upcoming' NOT NULL,
	"start_date" timestamp NOT NULL,
	"end_date" timestamp NOT NULL,
	"registration_url" text,
	"external_url" text,
	"prize_pool" text,
	"participant_count" integer DEFAULT 0,
	"max_participants" integer,
	"requirements" text,
	"tags" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"is_featured" boolean DEFAULT false NOT NULL,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "loyalty_tiers" (
	"id" serial PRIMARY KEY NOT NULL,
	"tier_name" varchar(10) NOT NULL,
	"min_earnings" integer NOT NULL,
	"max_earnings" integer,
	"reward_multiplier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"cashback_percentage" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"monthly_bonus" integer DEFAULT 0 NOT NULL,
	"free_insurance_daily" integer DEFAULT 0 NOT NULL,
	"priority_support" boolean DEFAULT false NOT NULL,
	"early_access" boolean DEFAULT false NOT NULL,
	"personal_manager" boolean DEFAULT false NOT NULL,
	CONSTRAINT "loyalty_tiers_tier_name_unique" UNIQUE("tier_name")
);
--> statement-breakpoint
CREATE TABLE "monthly_tier_rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"month" varchar(7) NOT NULL,
	"tier" varchar(10) NOT NULL,
	"bonus_amount" integer NOT NULL,
	"free_entries" integer DEFAULT 0 NOT NULL,
	"claimed" boolean DEFAULT false NOT NULL,
	"claimed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_battles" (
	"id" serial PRIMARY KEY NOT NULL,
	"challenger_id" integer NOT NULL,
	"challenged_id" integer,
	"battle_type" varchar(20) DEFAULT 'head_to_head' NOT NULL,
	"cryptocurrency" varchar(20) NOT NULL,
	"timeframe" varchar(10) NOT NULL,
	"stake_amount" integer NOT NULL,
	"challenger_prediction" numeric(18, 8),
	"challenged_prediction" numeric(18, 8),
	"actual_price" numeric(18, 8),
	"winner_id" integer,
	"winner_reward" integer DEFAULT 0,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"target_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"accepted_at" timestamp,
	"completed_at" timestamp,
	"spectator_count" integer DEFAULT 0,
	"is_public" boolean DEFAULT true,
	"join_deadline" timestamp NOT NULL,
	"minimum_join_time" integer DEFAULT 300 NOT NULL,
	"price_at_creation" numeric(18, 8) NOT NULL,
	"price_movement_penalty" boolean DEFAULT true,
	"fairness_multiplier" numeric(5, 2) DEFAULT '1.00',
	"join_time_bonus" numeric(5, 2) DEFAULT '1.00'
);
--> statement-breakpoint
CREATE TABLE "prediction_comments" (
	"id" serial PRIMARY KEY NOT NULL,
	"prediction_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "prediction_reactions" (
	"id" serial PRIMARY KEY NOT NULL,
	"prediction_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(20) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"cryptocurrency" varchar(20) NOT NULL,
	"predicted_price" numeric(18, 8) NOT NULL,
	"actual_price" numeric(18, 8),
	"stake_amount" integer NOT NULL,
	"timeframe" varchar(10) NOT NULL,
	"target_time" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"reward_amount" integer DEFAULT 0,
	"accuracy" numeric(5, 2)
);
--> statement-breakpoint
CREATE TABLE "purchases" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"pts_amount" integer NOT NULL,
	"payment_amount" varchar(50) NOT NULL,
	"payment_token" varchar(10) NOT NULL,
	"transaction_hash" varchar(66),
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "referrals" (
	"id" serial PRIMARY KEY NOT NULL,
	"referrer_id" integer NOT NULL,
	"referred_id" integer NOT NULL,
	"referral_code" varchar(8),
	"reward" integer DEFAULT 100 NOT NULL,
	"is_rewarded" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rewards" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"prediction_id" integer NOT NULL,
	"amount" integer NOT NULL,
	"cryptocurrency" varchar(20) NOT NULL,
	"accuracy" varchar(10),
	"description" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "security_events" (
	"id" serial PRIMARY KEY NOT NULL,
	"event" text NOT NULL,
	"details" text NOT NULL,
	"severity" varchar(20) DEFAULT 'medium' NOT NULL,
	"wallet_address" varchar(42),
	"ip_address" varchar(45) NOT NULL,
	"country" varchar(100),
	"status" varchar(30) DEFAULT 'investigating' NOT NULL,
	"resolved" boolean DEFAULT false,
	"user_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"resolved_at" timestamp,
	"resolved_by" integer
);
--> statement-breakpoint
CREATE TABLE "survival_participants" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"status" varchar(20) DEFAULT 'active' NOT NULL,
	"eliminated_round" integer,
	"joined_at" timestamp DEFAULT now() NOT NULL,
	"eliminated_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "survival_predictions" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"round_id" integer NOT NULL,
	"participant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"prediction" varchar(10) NOT NULL,
	"starting_price" numeric(18, 8) NOT NULL,
	"ending_price" numeric(18, 8),
	"submitted_at" timestamp DEFAULT now() NOT NULL,
	"is_correct" boolean,
	"points" integer DEFAULT 0,
	"round_start_time" timestamp NOT NULL,
	"round_duration" integer NOT NULL,
	"submission_time_percentage" numeric(5, 2) NOT NULL,
	"timing_multiplier" numeric(3, 2) DEFAULT '1.00' NOT NULL,
	"prediction_deadline_passed" boolean DEFAULT false NOT NULL,
	"early_bird_bonus" boolean DEFAULT false NOT NULL,
	"late_penalty" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "survival_rounds" (
	"id" serial PRIMARY KEY NOT NULL,
	"tournament_id" integer NOT NULL,
	"round_number" integer NOT NULL,
	"cryptocurrency" varchar(20) NOT NULL,
	"start_time" timestamp NOT NULL,
	"end_time" timestamp NOT NULL,
	"start_price" numeric(18, 8) NOT NULL,
	"end_price" numeric(18, 8),
	"price_direction" varchar(10),
	"eliminated_count" integer DEFAULT 0 NOT NULL,
	"survivor_count" integer DEFAULT 0 NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "survival_tournaments" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"cryptocurrency" varchar(20) NOT NULL,
	"entry_fee" integer DEFAULT 100 NOT NULL,
	"prize_pool" integer DEFAULT 0 NOT NULL,
	"max_participants" integer DEFAULT 32 NOT NULL,
	"current_participants" integer DEFAULT 0 NOT NULL,
	"round_duration" integer DEFAULT 60 NOT NULL,
	"round1_duration" integer,
	"round2_duration" integer,
	"round3_duration" integer,
	"reward_type" varchar(10) DEFAULT 'NTIQ' NOT NULL,
	"reward_amount" integer DEFAULT 1000 NOT NULL,
	"status" varchar(20) DEFAULT 'open' NOT NULL,
	"current_round" integer DEFAULT 0 NOT NULL,
	"winner_id" integer,
	"start_time" timestamp,
	"end_time" timestamp,
	"next_round_time" timestamp,
	"created_by" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "system_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"category" varchar(50) NOT NULL,
	"key" varchar(100) NOT NULL,
	"value" text NOT NULL,
	"data_type" varchar(20) DEFAULT 'string' NOT NULL,
	"description" text,
	"updated_by" integer,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tier_promotions" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"from_tier" varchar(10) NOT NULL,
	"to_tier" varchar(10) NOT NULL,
	"lifetime_earnings" integer NOT NULL,
	"promoted_at" timestamp DEFAULT now() NOT NULL,
	"celebration_sent" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "transaction_logs" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"type" varchar(30) NOT NULL,
	"amount" integer NOT NULL,
	"token" varchar(10) NOT NULL,
	"status" varchar(20) DEFAULT 'completed' NOT NULL,
	"hash" varchar(66),
	"from_address" varchar(42),
	"to_address" varchar(42),
	"network_fee" varchar(50),
	"exchange_rate" numeric(18, 8),
	"related_id" integer,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_achievements" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"achievement_id" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_analytics" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"date" varchar(10) NOT NULL,
	"predictions_count" integer DEFAULT 0,
	"correct_predictions" integer DEFAULT 0,
	"total_staked" integer DEFAULT 0,
	"total_rewards" integer DEFAULT 0,
	"win_streak" integer DEFAULT 0,
	"max_win_streak" integer DEFAULT 0,
	"login_streak" integer DEFAULT 0,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_daily_challenges" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"challenge_id" integer NOT NULL,
	"progress" integer DEFAULT 0,
	"is_completed" boolean DEFAULT false,
	"completed_at" timestamp,
	"date" varchar(10) NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "user_verifications" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"wallet_address" text NOT NULL,
	"email" text,
	"twitter_handle" text,
	"email_verification_code" text,
	"twitter_verification_code" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"twitter_verified" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"uid" varchar(9) NOT NULL,
	"username" text NOT NULL,
	"password" text,
	"wallet_address" text,
	"auth_method" varchar(20) DEFAULT 'password' NOT NULL,
	"is_admin" boolean DEFAULT false NOT NULL,
	"balance" integer DEFAULT 1000 NOT NULL,
	"total_predictions" integer DEFAULT 0 NOT NULL,
	"correct_predictions" integer DEFAULT 0 NOT NULL,
	"total_rewards" integer DEFAULT 0 NOT NULL,
	"profile_photo" text,
	"email" text,
	"twitter_handle" text,
	"email_verified" boolean DEFAULT false NOT NULL,
	"twitter_verified" boolean DEFAULT false NOT NULL,
	"firebase_uid" text,
	"firebase_display_name" text,
	"referral_code" varchar(8),
	"referred_by" integer,
	"total_referrals" integer DEFAULT 0 NOT NULL,
	"referral_rewards" integer DEFAULT 0 NOT NULL,
	"loyalty_tier" varchar(10) DEFAULT 'bronze' NOT NULL,
	"lifetime_earnings" integer DEFAULT 0 NOT NULL,
	"last_tier_update" timestamp DEFAULT now(),
	CONSTRAINT "users_uid_unique" UNIQUE("uid"),
	CONSTRAINT "users_username_unique" UNIQUE("username"),
	CONSTRAINT "users_referral_code_unique" UNIQUE("referral_code")
);
--> statement-breakpoint
CREATE TABLE "wallet_fingerprints" (
	"id" serial PRIMARY KEY NOT NULL,
	"wallet_address" varchar(100) NOT NULL,
	"user_id" integer,
	"ip_address" varchar(45) NOT NULL,
	"user_agent" text NOT NULL,
	"browser_fingerprint" varchar(64),
	"device_fingerprint" varchar(64),
	"screen_resolution" varchar(20),
	"timezone" varchar(50),
	"language" varchar(10),
	"platform" varchar(50),
	"color_depth" varchar(10),
	"pixel_ratio" varchar(10),
	"hardware_concurrency" varchar(10),
	"max_touch_points" varchar(10),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "withdrawals" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"ntiq_amount" integer NOT NULL,
	"usd_amount" numeric(18, 6) NOT NULL,
	"fee_amount" numeric(18, 6) DEFAULT '0',
	"net_amount" numeric(18, 6) NOT NULL,
	"eth_price_snapshot" numeric(20, 8),
	"chain_name" varchar(20) NOT NULL,
	"token_type" varchar(10) NOT NULL,
	"to_wallet_address" varchar(42) NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"transaction_hash" varchar(66),
	"admin_note" text,
	"processed_by" integer,
	"processed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "abuse_detections" ADD CONSTRAINT "abuse_detections_reviewed_by_users_id_fk" FOREIGN KEY ("reviewed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "admin_logs" ADD CONSTRAINT "admin_logs_admin_id_users_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "banners" ADD CONSTRAINT "banners_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_comments" ADD CONSTRAINT "battle_comments_battle_id_prediction_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."prediction_battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_comments" ADD CONSTRAINT "battle_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_reactions" ADD CONSTRAINT "battle_reactions_battle_id_prediction_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."prediction_battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_reactions" ADD CONSTRAINT "battle_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_spectators" ADD CONSTRAINT "battle_spectators_battle_id_prediction_battles_id_fk" FOREIGN KEY ("battle_id") REFERENCES "public"."prediction_battles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "battle_spectators" ADD CONSTRAINT "battle_spectators_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "crypto_transactions" ADD CONSTRAINT "crypto_transactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "monthly_tier_rewards" ADD CONSTRAINT "monthly_tier_rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_battles" ADD CONSTRAINT "prediction_battles_challenger_id_users_id_fk" FOREIGN KEY ("challenger_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_battles" ADD CONSTRAINT "prediction_battles_challenged_id_users_id_fk" FOREIGN KEY ("challenged_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_battles" ADD CONSTRAINT "prediction_battles_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_comments" ADD CONSTRAINT "prediction_comments_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_comments" ADD CONSTRAINT "prediction_comments_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_reactions" ADD CONSTRAINT "prediction_reactions_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prediction_reactions" ADD CONSTRAINT "prediction_reactions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "predictions" ADD CONSTRAINT "predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referrer_id_users_id_fk" FOREIGN KEY ("referrer_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referred_id_users_id_fk" FOREIGN KEY ("referred_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rewards" ADD CONSTRAINT "rewards_prediction_id_predictions_id_fk" FOREIGN KEY ("prediction_id") REFERENCES "public"."predictions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "security_events" ADD CONSTRAINT "security_events_resolved_by_users_id_fk" FOREIGN KEY ("resolved_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_participants" ADD CONSTRAINT "survival_participants_tournament_id_survival_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."survival_tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_participants" ADD CONSTRAINT "survival_participants_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_predictions" ADD CONSTRAINT "survival_predictions_tournament_id_survival_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."survival_tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_predictions" ADD CONSTRAINT "survival_predictions_round_id_survival_rounds_id_fk" FOREIGN KEY ("round_id") REFERENCES "public"."survival_rounds"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_predictions" ADD CONSTRAINT "survival_predictions_participant_id_survival_participants_id_fk" FOREIGN KEY ("participant_id") REFERENCES "public"."survival_participants"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_predictions" ADD CONSTRAINT "survival_predictions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_rounds" ADD CONSTRAINT "survival_rounds_tournament_id_survival_tournaments_id_fk" FOREIGN KEY ("tournament_id") REFERENCES "public"."survival_tournaments"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_tournaments" ADD CONSTRAINT "survival_tournaments_winner_id_users_id_fk" FOREIGN KEY ("winner_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "survival_tournaments" ADD CONSTRAINT "survival_tournaments_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "system_settings" ADD CONSTRAINT "system_settings_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tier_promotions" ADD CONSTRAINT "tier_promotions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "transaction_logs" ADD CONSTRAINT "transaction_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_achievements" ADD CONSTRAINT "user_achievements_achievement_id_achievements_id_fk" FOREIGN KEY ("achievement_id") REFERENCES "public"."achievements"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_analytics" ADD CONSTRAINT "user_analytics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_challenges" ADD CONSTRAINT "user_daily_challenges_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_daily_challenges" ADD CONSTRAINT "user_daily_challenges_challenge_id_daily_challenges_id_fk" FOREIGN KEY ("challenge_id") REFERENCES "public"."daily_challenges"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_verifications" ADD CONSTRAINT "user_verifications_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_referred_by_users_id_fk" FOREIGN KEY ("referred_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "wallet_fingerprints" ADD CONSTRAINT "wallet_fingerprints_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "withdrawals" ADD CONSTRAINT "withdrawals_processed_by_users_id_fk" FOREIGN KEY ("processed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;