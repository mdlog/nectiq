--
-- PostgreSQL database dump
--

-- Dumped from database version 16.9
-- Dumped by pg_dump version 16.5

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: abuse_detections; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.abuse_detections (
    id integer NOT NULL,
    primary_wallet_address character varying(100) NOT NULL,
    suspicious_wallet_addresses text NOT NULL,
    similarity_score numeric(5,2) NOT NULL,
    detection_reason text NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    action character varying(20) DEFAULT 'warn'::character varying,
    reviewed_by integer,
    reviewed_at timestamp without time zone,
    review_notes text,
    ip_address character varying(45) NOT NULL,
    user_agent text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.abuse_detections OWNER TO neondb_owner;

--
-- Name: abuse_detections_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.abuse_detections_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.abuse_detections_id_seq OWNER TO neondb_owner;

--
-- Name: abuse_detections_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.abuse_detections_id_seq OWNED BY public.abuse_detections.id;


--
-- Name: achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.achievements (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    type character varying(50) NOT NULL,
    target integer NOT NULL,
    reward integer NOT NULL,
    icon character varying(50) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.achievements OWNER TO neondb_owner;

--
-- Name: achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.achievements_id_seq OWNER TO neondb_owner;

--
-- Name: achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.achievements_id_seq OWNED BY public.achievements.id;


--
-- Name: admin_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.admin_logs (
    id integer NOT NULL,
    admin_id integer NOT NULL,
    action text NOT NULL,
    target_type character varying(50),
    target_id integer,
    details text,
    ip_address character varying(45) NOT NULL,
    user_agent text,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.admin_logs OWNER TO neondb_owner;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.admin_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.admin_logs_id_seq OWNER TO neondb_owner;

--
-- Name: admin_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.admin_logs_id_seq OWNED BY public.admin_logs.id;


--
-- Name: banners; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.banners (
    id integer NOT NULL,
    title text NOT NULL,
    description text,
    image_url text NOT NULL,
    link_url text,
    is_active boolean DEFAULT true NOT NULL,
    "position" character varying(20) DEFAULT 'below_live_prices'::character varying NOT NULL,
    priority integer DEFAULT 0 NOT NULL,
    start_date timestamp without time zone,
    end_date timestamp without time zone,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.banners OWNER TO neondb_owner;

--
-- Name: banners_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.banners_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.banners_id_seq OWNER TO neondb_owner;

--
-- Name: banners_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.banners_id_seq OWNED BY public.banners.id;


--
-- Name: battle_comments; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.battle_comments (
    id bigint NOT NULL,
    battle_id integer NOT NULL,
    user_id integer NOT NULL,
    username character varying(255) NOT NULL,
    comment text NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.battle_comments OWNER TO neondb_owner;

--
-- Name: battle_comments_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.battle_comments_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.battle_comments_id_seq OWNER TO neondb_owner;

--
-- Name: battle_comments_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.battle_comments_id_seq OWNED BY public.battle_comments.id;


--
-- Name: cryptocurrencies; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.cryptocurrencies (
    id character varying(20) NOT NULL,
    symbol character varying(10) NOT NULL,
    name text NOT NULL,
    current_price numeric(18,8) NOT NULL,
    price_change_24h numeric(5,2) NOT NULL,
    last_updated timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.cryptocurrencies OWNER TO neondb_owner;

--
-- Name: daily_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.daily_challenges (
    id integer NOT NULL,
    name character varying(100) NOT NULL,
    description text NOT NULL,
    type character varying(50) NOT NULL,
    target integer NOT NULL,
    reward integer NOT NULL,
    date character varying(10) NOT NULL,
    is_active boolean DEFAULT true,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.daily_challenges OWNER TO neondb_owner;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.daily_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.daily_challenges_id_seq OWNER TO neondb_owner;

--
-- Name: daily_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.daily_challenges_id_seq OWNED BY public.daily_challenges.id;


--
-- Name: events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.events (
    id integer NOT NULL,
    title text NOT NULL,
    description text NOT NULL,
    short_description text,
    image_url text,
    event_type character varying(30) DEFAULT 'nectiq'::character varying NOT NULL,
    status character varying(20) DEFAULT 'upcoming'::character varying NOT NULL,
    start_date timestamp without time zone NOT NULL,
    end_date timestamp without time zone NOT NULL,
    registration_url text,
    external_url text,
    prize_pool text,
    participant_count integer DEFAULT 0,
    max_participants integer,
    requirements text,
    tags text,
    is_active boolean DEFAULT true NOT NULL,
    is_featured boolean DEFAULT false NOT NULL,
    created_by integer NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.events OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.events_id_seq OWNER TO neondb_owner;

--
-- Name: events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.events_id_seq OWNED BY public.events.id;


--
-- Name: prediction_battles; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.prediction_battles (
    id integer NOT NULL,
    challenger_id integer NOT NULL,
    challenged_id integer,
    battle_type character varying(20) DEFAULT 'head_to_head'::character varying NOT NULL,
    cryptocurrency character varying(20) NOT NULL,
    timeframe character varying(10) NOT NULL,
    stake_amount integer NOT NULL,
    challenger_prediction numeric(18,8),
    challenged_prediction numeric(18,8),
    actual_price numeric(18,8),
    winner_id integer,
    winner_reward integer DEFAULT 0,
    status character varying(20) DEFAULT 'open'::character varying NOT NULL,
    target_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    accepted_at timestamp without time zone,
    completed_at timestamp without time zone,
    spectator_count integer DEFAULT 0,
    is_public boolean DEFAULT true,
    join_deadline timestamp without time zone,
    minimum_join_time integer DEFAULT 300,
    price_at_creation numeric(18,8),
    price_movement_penalty boolean DEFAULT true,
    fairness_multiplier numeric(5,2) DEFAULT 1.00,
    join_time_bonus numeric(5,2) DEFAULT 1.00
);


ALTER TABLE public.prediction_battles OWNER TO neondb_owner;

--
-- Name: prediction_battles_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.prediction_battles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prediction_battles_id_seq OWNER TO neondb_owner;

--
-- Name: prediction_battles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.prediction_battles_id_seq OWNED BY public.prediction_battles.id;


--
-- Name: predictions; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.predictions (
    id integer NOT NULL,
    user_id integer NOT NULL,
    cryptocurrency character varying(20) NOT NULL,
    predicted_price numeric(18,8) NOT NULL,
    actual_price numeric(18,8),
    stake_amount integer NOT NULL,
    timeframe character varying(10) NOT NULL,
    target_time timestamp without time zone NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    completed_at timestamp without time zone,
    status character varying(20) DEFAULT 'pending'::character varying NOT NULL,
    reward_amount integer DEFAULT 0,
    accuracy numeric(5,2)
);


ALTER TABLE public.predictions OWNER TO neondb_owner;

--
-- Name: predictions_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.predictions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.predictions_id_seq OWNER TO neondb_owner;

--
-- Name: predictions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.predictions_id_seq OWNED BY public.predictions.id;


--
-- Name: purchases; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.purchases (
    id integer NOT NULL,
    user_id integer NOT NULL,
    pts_amount integer NOT NULL,
    payment_amount character varying(50) NOT NULL,
    payment_token character varying(10) NOT NULL,
    transaction_hash character varying(66),
    status character varying(20) DEFAULT 'completed'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.purchases OWNER TO neondb_owner;

--
-- Name: purchases_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.purchases_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.purchases_id_seq OWNER TO neondb_owner;

--
-- Name: purchases_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.purchases_id_seq OWNED BY public.purchases.id;


--
-- Name: referrals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.referrals (
    id integer NOT NULL,
    referrer_id integer NOT NULL,
    referred_id integer NOT NULL,
    referral_code character varying(20) NOT NULL,
    reward integer DEFAULT 1000,
    is_rewarded boolean DEFAULT false,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.referrals OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.referrals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.referrals_id_seq OWNER TO neondb_owner;

--
-- Name: referrals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.referrals_id_seq OWNED BY public.referrals.id;


--
-- Name: rewards; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.rewards (
    id integer NOT NULL,
    user_id integer NOT NULL,
    prediction_id integer NOT NULL,
    amount integer NOT NULL,
    description text NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.rewards OWNER TO neondb_owner;

--
-- Name: rewards_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.rewards_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.rewards_id_seq OWNER TO neondb_owner;

--
-- Name: rewards_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.rewards_id_seq OWNED BY public.rewards.id;


--
-- Name: security_events; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.security_events (
    id integer NOT NULL,
    event text NOT NULL,
    details text NOT NULL,
    severity character varying(20) DEFAULT 'medium'::character varying NOT NULL,
    wallet_address character varying(42),
    ip_address character varying(45) NOT NULL,
    country character varying(100),
    status character varying(30) DEFAULT 'investigating'::character varying NOT NULL,
    resolved boolean DEFAULT false,
    user_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL,
    resolved_at timestamp without time zone,
    resolved_by integer
);


ALTER TABLE public.security_events OWNER TO neondb_owner;

--
-- Name: security_events_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.security_events_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.security_events_id_seq OWNER TO neondb_owner;

--
-- Name: security_events_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.security_events_id_seq OWNED BY public.security_events.id;


--
-- Name: system_settings; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.system_settings (
    id integer NOT NULL,
    category character varying(50) NOT NULL,
    key character varying(100) NOT NULL,
    value text NOT NULL,
    data_type character varying(20) DEFAULT 'string'::character varying NOT NULL,
    description text,
    updated_by integer,
    updated_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.system_settings OWNER TO neondb_owner;

--
-- Name: system_settings_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.system_settings_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_settings_id_seq OWNER TO neondb_owner;

--
-- Name: system_settings_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.system_settings_id_seq OWNED BY public.system_settings.id;


--
-- Name: transaction_logs; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.transaction_logs (
    id integer NOT NULL,
    user_id integer NOT NULL,
    type character varying(30) NOT NULL,
    amount integer NOT NULL,
    token character varying(10) NOT NULL,
    status character varying(20) DEFAULT 'completed'::character varying NOT NULL,
    hash character varying(66),
    from_address character varying(42),
    to_address character varying(42),
    network_fee character varying(50),
    exchange_rate numeric(18,8),
    related_id integer,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.transaction_logs OWNER TO neondb_owner;

--
-- Name: transaction_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.transaction_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.transaction_logs_id_seq OWNER TO neondb_owner;

--
-- Name: transaction_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.transaction_logs_id_seq OWNED BY public.transaction_logs.id;


--
-- Name: user_achievements; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_achievements (
    id integer NOT NULL,
    user_id integer NOT NULL,
    achievement_id integer NOT NULL,
    progress integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_achievements OWNER TO neondb_owner;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_achievements_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_achievements_id_seq OWNER TO neondb_owner;

--
-- Name: user_achievements_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_achievements_id_seq OWNED BY public.user_achievements.id;


--
-- Name: user_analytics; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_analytics (
    id integer NOT NULL,
    user_id integer NOT NULL,
    date character varying(10) NOT NULL,
    predictions_count integer DEFAULT 0,
    correct_predictions integer DEFAULT 0,
    total_staked integer DEFAULT 0,
    total_rewards integer DEFAULT 0,
    win_streak integer DEFAULT 0,
    max_win_streak integer DEFAULT 0,
    login_streak integer DEFAULT 0,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_analytics OWNER TO neondb_owner;

--
-- Name: user_analytics_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_analytics_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_analytics_id_seq OWNER TO neondb_owner;

--
-- Name: user_analytics_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_analytics_id_seq OWNED BY public.user_analytics.id;


--
-- Name: user_daily_challenges; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.user_daily_challenges (
    id integer NOT NULL,
    user_id integer NOT NULL,
    challenge_id integer NOT NULL,
    progress integer DEFAULT 0,
    is_completed boolean DEFAULT false,
    completed_at timestamp without time zone,
    date character varying(10) NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.user_daily_challenges OWNER TO neondb_owner;

--
-- Name: user_daily_challenges_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.user_daily_challenges_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.user_daily_challenges_id_seq OWNER TO neondb_owner;

--
-- Name: user_daily_challenges_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.user_daily_challenges_id_seq OWNED BY public.user_daily_challenges.id;


--
-- Name: users; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text,
    balance integer DEFAULT 1000 NOT NULL,
    total_predictions integer DEFAULT 0 NOT NULL,
    correct_predictions integer DEFAULT 0 NOT NULL,
    total_rewards integer DEFAULT 0 NOT NULL,
    wallet_address text,
    auth_method character varying(20) DEFAULT 'password'::character varying NOT NULL,
    is_admin boolean DEFAULT false NOT NULL,
    uid character varying(9) NOT NULL,
    profile_photo text
);


ALTER TABLE public.users OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO neondb_owner;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: wallet_fingerprints; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.wallet_fingerprints (
    id integer NOT NULL,
    wallet_address character varying(100) NOT NULL,
    user_id integer,
    ip_address character varying(45) NOT NULL,
    user_agent text NOT NULL,
    browser_fingerprint character varying(64),
    device_fingerprint character varying(64),
    screen_resolution character varying(20),
    timezone character varying(50),
    language character varying(10),
    platform character varying(50),
    color_depth character varying(10),
    pixel_ratio character varying(10),
    hardware_concurrency character varying(10),
    max_touch_points character varying(10),
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.wallet_fingerprints OWNER TO neondb_owner;

--
-- Name: wallet_fingerprints_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.wallet_fingerprints_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.wallet_fingerprints_id_seq OWNER TO neondb_owner;

--
-- Name: wallet_fingerprints_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.wallet_fingerprints_id_seq OWNED BY public.wallet_fingerprints.id;


--
-- Name: withdrawals; Type: TABLE; Schema: public; Owner: neondb_owner
--

CREATE TABLE public.withdrawals (
    id integer NOT NULL,
    user_id integer NOT NULL,
    pts_amount integer NOT NULL,
    token_amount character varying(50) NOT NULL,
    token character varying(10) NOT NULL,
    wallet_address character varying(42) NOT NULL,
    status character varying(20) DEFAULT 'completed'::character varying NOT NULL,
    created_at timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.withdrawals OWNER TO neondb_owner;

--
-- Name: withdrawals_id_seq; Type: SEQUENCE; Schema: public; Owner: neondb_owner
--

CREATE SEQUENCE public.withdrawals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.withdrawals_id_seq OWNER TO neondb_owner;

--
-- Name: withdrawals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: neondb_owner
--

ALTER SEQUENCE public.withdrawals_id_seq OWNED BY public.withdrawals.id;


--
-- Name: abuse_detections id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.abuse_detections ALTER COLUMN id SET DEFAULT nextval('public.abuse_detections_id_seq'::regclass);


--
-- Name: achievements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements ALTER COLUMN id SET DEFAULT nextval('public.achievements_id_seq'::regclass);


--
-- Name: admin_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_logs ALTER COLUMN id SET DEFAULT nextval('public.admin_logs_id_seq'::regclass);


--
-- Name: banners id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banners ALTER COLUMN id SET DEFAULT nextval('public.banners_id_seq'::regclass);


--
-- Name: battle_comments id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.battle_comments ALTER COLUMN id SET DEFAULT nextval('public.battle_comments_id_seq'::regclass);


--
-- Name: daily_challenges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges ALTER COLUMN id SET DEFAULT nextval('public.daily_challenges_id_seq'::regclass);


--
-- Name: events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events ALTER COLUMN id SET DEFAULT nextval('public.events_id_seq'::regclass);


--
-- Name: prediction_battles id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prediction_battles ALTER COLUMN id SET DEFAULT nextval('public.prediction_battles_id_seq'::regclass);


--
-- Name: predictions id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.predictions ALTER COLUMN id SET DEFAULT nextval('public.predictions_id_seq'::regclass);


--
-- Name: purchases id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases ALTER COLUMN id SET DEFAULT nextval('public.purchases_id_seq'::regclass);


--
-- Name: referrals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals ALTER COLUMN id SET DEFAULT nextval('public.referrals_id_seq'::regclass);


--
-- Name: rewards id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rewards ALTER COLUMN id SET DEFAULT nextval('public.rewards_id_seq'::regclass);


--
-- Name: security_events id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_events ALTER COLUMN id SET DEFAULT nextval('public.security_events_id_seq'::regclass);


--
-- Name: system_settings id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings ALTER COLUMN id SET DEFAULT nextval('public.system_settings_id_seq'::regclass);


--
-- Name: transaction_logs id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_logs ALTER COLUMN id SET DEFAULT nextval('public.transaction_logs_id_seq'::regclass);


--
-- Name: user_achievements id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements ALTER COLUMN id SET DEFAULT nextval('public.user_achievements_id_seq'::regclass);


--
-- Name: user_analytics id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_analytics ALTER COLUMN id SET DEFAULT nextval('public.user_analytics_id_seq'::regclass);


--
-- Name: user_daily_challenges id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_daily_challenges ALTER COLUMN id SET DEFAULT nextval('public.user_daily_challenges_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Name: wallet_fingerprints id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wallet_fingerprints ALTER COLUMN id SET DEFAULT nextval('public.wallet_fingerprints_id_seq'::regclass);


--
-- Name: withdrawals id; Type: DEFAULT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawals ALTER COLUMN id SET DEFAULT nextval('public.withdrawals_id_seq'::regclass);


--
-- Data for Name: abuse_detections; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.abuse_detections (id, primary_wallet_address, suspicious_wallet_addresses, similarity_score, detection_reason, status, action, reviewed_by, reviewed_at, review_notes, ip_address, user_agent, created_at) FROM stdin;
1	0xa9620179a3105fD4673bA2A27701eBd80ffee070	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	70.00	Beberapa wallet berbeda terdeteksi dari IP yang sama	pending	warn	\N	\N	\N	172.31.128.96	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	2025-06-25 23:35:47.736709
2	0x28b50E928092b646dAe08EC5115A75Ee0abF44Bd	["0xa9620179a3105fD4673bA2A27701eBd80ffee070"]	95.00	Device fingerprint sama dengan wallet berbeda terdeteksi	confirmed	block	\N	\N	\N	172.31.128.96	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	2025-06-25 23:36:18.891991
3	0x4c6165286739696849fb3e77a16b0639d762c5b6	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	95.00	Device fingerprint sama dengan wallet berbeda terdeteksi	confirmed	block	\N	\N	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-25 23:41:26.05727
4	0x4c6165286739696849fb3e77a16b0639d762c5b6	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	95.00	Device fingerprint sama dengan wallet berbeda terdeteksi	confirmed	block	\N	\N	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-25 23:41:45.674068
5	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-25 23:55:37.981644
6	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-25 23:58:08.059762
7	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x28b50E928092b646dAe08EC5115A75Ee0abF44Bd"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.30	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	2025-06-26 06:31:16.099063
8	0x4c6165286739696849fb3e77a16b0639d762c5b6	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 13:33:41.875066
9	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 13:34:20.591473
10	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 13:35:34.228967
11	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 13:41:29.08317
12	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 13:49:33.528045
13	0xaCA879a1570d445A165228e8Fa93EB7cfC9c42A7	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 17:40:06.337656
14	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0xaCA879a1570d445A165228e8Fa93EB7cfC9c42A7"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-26 17:58:02.645658
15	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 03:12:56.389472
16	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:13:38.035922
17	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:16:44.847672
18	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:19:56.493255
19	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:25:19.609477
20	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 03:31:28.045675
21	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:34:47.946607
22	0x4c6165286739696849fb3e77a16b0639d762c5b6	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 03:41:51.122903
23	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 03:59:38.716012
24	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 04:15:42.178655
25	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 04:16:42.870528
26	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 05:36:08.482495
27	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 05:42:09.656686
28	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 05:43:50.126226
29	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 05:52:08.263194
30	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 05:55:16.657136
31	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:04:12.704558
32	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:04:50.617063
33	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:05:11.197739
34	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:06:09.358575
35	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:06:52.170183
36	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:10:49.902643
37	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:20:22.052834
38	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:20:51.469108
39	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:21:44.840545
40	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:22:25.594503
41	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:22:50.08363
42	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:24:11.634189
43	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:27:49.36577
44	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:31:07.746279
45	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:32:41.121405
46	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 06:41:25.769334
47	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:44:54.531396
48	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:45:58.48135
49	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:47:30.623942
50	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:47:53.374776
51	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:48:52.744724
52	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:49:41.078459
53	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 06:52:45.88325
54	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Beberapa wallet berbeda terdeteksi dari IP yang sama - threshold tinggi	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 07:06:47.00421
55	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:07:21.801723
56	0x4c6165286739696849fb3e77a16b0639d762c5b6	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint sama dengan wallet berbeda terdeteksi - diizinkan untuk review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:16:41.444278
57	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:33:08.513092
58	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 07:35:45.452518
59	0x4C6165286739696849Fb3e77A16b0639D762c5B6	["0x4c6165286739696849fb3e77a16b0639d762c5b6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4c6165286739696849fb3e77a16b0639d762c5b6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:36:25.475302
60	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:37:27.301431
61	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 07:45:30.605621
62	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 07:49:19.438666
63	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:52:49.984795
64	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 07:57:44.79071
65	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 08:01:14.936688
66	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4c6165286739696849fb3e77a16b0639d762c5b6","0x4C6165286739696849Fb3e77A16b0639D762c5B6","0x4C6165286739696849Fb3e77A16b0639D762c5B6"]	85.00	Device fingerprint matches different wallet detected - allowed for review	pending	warn	\N	\N	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 08:02:54.488054
67	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 10:56:10.201832
68	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:01:29.033454
69	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:01:39.360242
70	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:03:08.973867
71	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:05:50.09761
72	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:09:23.205416
73	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:12:41.555187
74	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:13:20.683353
75	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:16:33.599072
76	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:31:06.168417
77	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:32:04.369096
78	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	["0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D","0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	2025-06-27 11:35:53.401309
79	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:40:38.502887
80	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	["0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F","0xA127700ab9718Bb480137FE5F8422d6dd48A162F"]	60.00	Multiple different wallets detected from same IP - high threshold	pending	warn	\N	\N	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	2025-06-27 11:43:35.29162
\.


--
-- Data for Name: achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.achievements (id, name, description, type, target, reward, icon, is_active, created_at) FROM stdin;
1	First Prediction	Make your first crypto prediction	prediction_count	1	100	🎯	t	2025-06-22 16:59:16.929906
2	Prediction Rookie	Make 10 successful predictions	prediction_count	10	500	🏆	t	2025-06-22 16:59:16.929906
3	Prediction Expert	Make 50 successful predictions	prediction_count	50	2000	🥇	t	2025-06-22 16:59:16.929906
4	Accuracy Master	Achieve 80% accuracy with at least 10 predictions	accuracy	80	1500	🎪	t	2025-06-22 16:59:16.929906
5	Win Streak	Get 5 predictions correct in a row	streak	5	1000	🔥	t	2025-06-22 16:59:16.929906
6	Reward Hunter	Earn 10,000 PTS in total rewards	rewards	10000	3000	💎	t	2025-06-22 16:59:16.929906
7	Big Player	Make a single prediction with 1000+ PTS stake	high_stake	1000	2500	💰	t	2025-06-22 16:59:16.929906
\.


--
-- Data for Name: admin_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.admin_logs (id, admin_id, action, target_type, target_id, details, ip_address, user_agent, created_at) FROM stdin;
\.


--
-- Data for Name: banners; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.banners (id, title, description, image_url, link_url, is_active, "position", priority, start_date, end_date, created_by, created_at, updated_at) FROM stdin;
3	Ilan	dfff	/uploads/banner-1750891784237-430396694.png	https://coinmarketcap.com/	t	below_live_prices	0	2025-06-25 00:00:00	2025-06-30 00:00:00	37	2025-06-25 22:49:46.632653	2025-06-25 23:58:29.392
\.


--
-- Data for Name: battle_comments; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.battle_comments (id, battle_id, user_id, username, comment, created_at) FROM stdin;
\.


--
-- Data for Name: cryptocurrencies; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.cryptocurrencies (id, symbol, name, current_price, price_change_24h, last_updated) FROM stdin;
litecoin	LTC	Litecoin	83.63367494	-1.04	2025-06-27 17:52:37.339
bitcoin	BTC	Bitcoin	106638.68579968	-0.66	2025-06-27 17:52:37.363
sui	SUI	Sui	2.71048239	3.28	2025-06-27 17:52:38.106
tron	TRX	TRON	0.27219744	0.49	2025-06-27 17:52:38.13
polkadot	DOT	Polkadot	3.33059275	1.01	2025-06-27 17:52:38.155
chainlink	LINK	Chainlink	12.88229268	-1.51	2025-06-27 17:52:38.179
sahara-ai	SAHARA	Sahara AI	0.08238766	-14.91	2025-06-27 17:52:38.203
ethereum	ETH	Ethereum	2404.72797293	-0.96	2025-06-27 17:52:38.227
cardano	ADA	Cardano	0.54950380	-1.10	2025-06-27 17:52:38.258
stellar	XLM	Stellar	0.23427769	-0.32	2025-06-27 17:52:38.282
solana	SOL	Solana	141.42516964	-0.63	2025-06-27 17:52:38.306
binancecoin	BNB	Binance Coin	643.90459664	-0.46	2025-06-27 17:52:38.331
\.


--
-- Data for Name: daily_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.daily_challenges (id, name, description, type, target, reward, date, is_active, created_at) FROM stdin;
1	Daily Predictor	Make 3 predictions today	make_predictions	3	200	2025-06-22	t	2025-06-22 17:08:28.599252
2	Accuracy Champion	Achieve 70% accuracy on predictions today	accuracy_target	70	300	2025-06-22	t	2025-06-22 17:08:28.624234
3	High Roller	Make a prediction with 500+ PTS stake	high_stake	500	400	2025-06-22	t	2025-06-22 17:08:28.647659
4	Daily Predictor	Make 3 predictions today	make_predictions	3	200	2025-06-23	t	2025-06-23 06:40:34.738714
5	Accuracy Champion	Achieve 70% accuracy on predictions today	accuracy_target	70	300	2025-06-23	t	2025-06-23 06:40:34.762975
6	Crypto Explorer	Make predictions on 2 different cryptocurrencies	diverse_predictions	2	250	2025-06-24	t	2025-06-24 01:54:45.376302
7	Accuracy Champion	Achieve 70% accuracy on predictions today	accuracy_target	70	300	2025-06-24	t	2025-06-24 01:54:45.402497
8	Daily Predictor	Make 3 predictions today	make_predictions	3	200	2025-06-24	t	2025-06-24 01:54:45.425877
9	Crypto Explorer	Make predictions on 2 different cryptocurrencies	diverse_predictions	2	250	2025-06-25	t	2025-06-25 15:32:28.530833
10	High Roller	Make a prediction with 500+ PTS stake	high_stake	500	400	2025-06-25	t	2025-06-25 15:32:28.555585
11	Accuracy Champion	Achieve 70% accuracy on predictions today	accuracy_target	70	300	2025-06-25	t	2025-06-25 15:32:28.577426
12	Crypto Explorer	Make predictions on 2 different cryptocurrencies	diverse_predictions	2	250	2025-06-26	t	2025-06-26 13:10:44.067692
13	Daily Predictor	Make 3 predictions today	make_predictions	3	200	2025-06-26	t	2025-06-26 13:10:44.093277
14	Accuracy Champion	Achieve 70% accuracy on predictions today	accuracy_target	70	300	2025-06-26	t	2025-06-26 13:10:44.117867
15	High Roller	Make a prediction with 500+ PTS stake	high_stake	500	400	2025-06-27	t	2025-06-27 02:59:58.485025
16	Daily Predictor	Make 3 predictions today	make_predictions	3	200	2025-06-27	t	2025-06-27 02:59:58.512302
\.


--
-- Data for Name: events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.events (id, title, description, short_description, image_url, event_type, status, start_date, end_date, registration_url, external_url, prize_pool, participant_count, max_participants, requirements, tags, is_active, is_featured, created_by, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: prediction_battles; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.prediction_battles (id, challenger_id, challenged_id, battle_type, cryptocurrency, timeframe, stake_amount, challenger_prediction, challenged_prediction, actual_price, winner_id, winner_reward, status, target_time, created_at, accepted_at, completed_at, spectator_count, is_public, join_deadline, minimum_join_time, price_at_creation, price_movement_penalty, fairness_multiplier, join_time_bonus) FROM stdin;
5	39	37	head_to_head	ethereum	1h	50	2437.00000000	2435.00000000	50000.00000000	39	100	completed	2025-06-27 03:57:50.497	2025-06-27 02:57:50.551971	2025-06-27 03:03:27.093	\N	0	t	2025-06-27 03:45:50.519	300	2438.67428375	t	1.00	1.20
4	39	37	head_to_head	stellar	1h	50	0.26000000	0.28000000	50000.00000000	37	100	completed	2025-06-27 03:46:13.817	2025-06-27 02:46:13.849544	2025-06-27 03:20:08.949	\N	0	t	\N	300	\N	t	1.00	1.00
6	39	37	head_to_head	sui	1h	80	2.45000000	2.43000000	2.63859453	39	0	completed	2025-06-27 07:05:34.019	2025-06-27 06:05:34.086631	2025-06-27 06:11:07.598	\N	0	t	2025-06-27 06:53:34.045	300	2.61902604	t	1.00	1.20
7	43	39	head_to_head	cardano	1h	50	0.59000000	0.60000000	0.55715300	43	0	completed	2025-06-27 07:23:17.825	2025-06-27 06:23:17.903784	2025-06-27 06:28:19.912	\N	0	t	2025-06-27 07:11:17.849	300	0.55632173	t	1.00	1.20
8	43	39	head_to_head	sahara-ai	1h	50	0.07000000	0.10000000	0.08169741	43	0	completed	2025-06-27 07:43:12.286	2025-06-27 06:43:12.360857	2025-06-27 06:50:08.176	\N	0	t	2025-06-27 07:31:12.308	300	0.08051019	t	1.00	1.20
3	39	37	head_to_head	bitcoin	6h	50	107218.00000000	107302.00000000	106789.46136713	39	0	completed	2025-06-27 08:37:15.486	2025-06-27 02:37:15.517236	2025-06-27 02:52:17.697	\N	0	t	\N	300	\N	t	1.00	1.00
9	39	43	head_to_head	solana	1h	120	142.09000000	142.12000000	142.01887380	39	0	completed	2025-06-27 10:47:48.071	2025-06-27 09:47:48.149974	2025-06-27 09:56:14.469	\N	0	t	2025-06-27 10:35:48.094	300	142.05019147	t	1.00	1.20
1	37	\N	head_to_head	ethereum	6h	50	2429.00000000	\N	\N	\N	0	open	2025-06-27 00:24:02.43	2025-06-26 18:24:02.465536	\N	\N	0	t	\N	5	\N	t	1.00	1.00
2	37	\N	head_to_head	ethereum	6h	50	2429.00000000	\N	\N	\N	0	open	2025-06-27 00:27:17.196	2025-06-26 18:27:17.229988	\N	\N	0	t	\N	5	\N	t	1.00	1.00
10	39	43	head_to_head	chainlink	1h	90	13.27000000	13.45000000	13.04000000	39	0	completed	2025-06-27 11:38:13.355	2025-06-27 10:38:13.433092	2025-06-27 10:44:48.631	\N	0	t	2025-06-27 11:26:13.378	300	13.06834743	t	1.00	1.20
11	43	39	head_to_head	binancecoin	1h	77	645.30000000	644.78000000	645.08314291	43	0	completed	2025-06-27 11:55:16.016	2025-06-27 10:55:16.093203	2025-06-27 11:05:59.144	\N	0	t	2025-06-27 11:43:16.037	300	645.19964476	t	1.00	1.20
12	39	43	head_to_head	ethereum	1h	80	2448.90000000	2449.50000000	2446.14586800	39	0	completed	2025-06-27 12:11:55.336	2025-06-27 11:11:55.447905	2025-06-27 11:16:47.886	\N	0	t	2025-06-27 11:59:55.397	5	2449.08720927	t	1.00	1.20
\.


--
-- Data for Name: predictions; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.predictions (id, user_id, cryptocurrency, predicted_price, actual_price, stake_amount, timeframe, target_time, created_at, completed_at, status, reward_amount, accuracy) FROM stdin;
40	37	bitcoin	107350.00000000	107592.00000000	50	1h	2025-06-26 00:19:35.181	2025-06-25 23:19:35.192445	2025-06-26 00:19:40.077	completed	150	0.22
41	37	ethereum	2416.00000000	2424.85000000	50	1h	2025-06-26 00:19:52.128	2025-06-25 23:19:52.139014	2025-06-26 00:20:40.078	completed	150	0.36
42	37	polkadot	3.38000000	3.36000000	50	1h	2025-06-26 00:52:08.167	2025-06-25 23:52:08.177052	2025-06-26 06:28:42.452	completed	150	0.60
43	40	bitcoin	107450.00000000	108038.00000000	50	1h	2025-06-26 07:28:50.144	2025-06-26 06:28:50.15453	2025-06-26 07:50:41.951	completed	150	0.54
44	37	polkadot	3.36000000	3.28000000	50	1h	2025-06-26 14:13:50.01	2025-06-26 13:13:50.021201	2025-06-26 14:14:03.25	completed	75	2.44
46	37	sahara-ai	0.12800000	0.10177500	50	1h	2025-06-26 14:24:02.496	2025-06-26 13:24:02.507729	2025-06-26 14:24:03.413	completed	0	25.77
47	37	tron	0.27000000	0.27147800	50	1h	2025-06-26 14:32:10.583	2025-06-26 13:32:10.594518	2025-06-26 17:35:45.709	completed	150	0.54
48	37	stellar	0.25000000	0.23508200	50	1h	2025-06-26 14:35:46.177	2025-06-26 13:35:46.188952	2025-06-26 17:35:45.919	completed	0	6.35
49	43	chainlink	13.07000000	13.02000000	100	1h	2025-06-26 18:58:19.49	2025-06-26 17:58:19.502496	2025-06-27 02:27:08.254	completed	300	0.38
50	37	polkadot	3.26000000	3.35000000	50	1h	2025-06-26 18:58:55.514	2025-06-26 17:58:55.526849	2025-06-27 02:27:08.434	completed	75	2.69
51	39	stellar	0.25000000	0.23581500	50	1h	2025-06-27 04:00:33.56	2025-06-27 03:00:33.569903	2025-06-27 04:03:39.545	completed	0	6.02
52	39	polkadot	3.36000000	3.31000000	50	1h	2025-06-27 06:47:45.591	2025-06-27 05:47:45.602837	2025-06-27 06:51:53.137	completed	75	1.51
53	39	tron	0.28000000	0.27130300	50	1h	2025-06-27 06:47:56.461	2025-06-27 05:47:56.474098	2025-06-27 06:51:53.313	completed	75	3.21
54	43	litecoin	84.90000000	84.58000000	60	1h	2025-06-27 08:58:09.242	2025-06-27 07:58:09.254811	2025-06-27 08:59:21.932	completed	180	0.38
55	39	solana	141.40000000	141.83000000	50	1h	2025-06-27 11:34:11.08	2025-06-27 10:34:11.093822	2025-06-27 11:35:12.497	completed	150	0.30
45	37	litecoin	84.78000000	84.17000000	100	24h	2025-06-27 13:14:09.601	2025-06-26 13:14:09.613152	2025-06-27 13:17:28.825	completed	300	0.72
\.


--
-- Data for Name: purchases; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.purchases (id, user_id, pts_amount, payment_amount, payment_token, transaction_hash, status, created_at) FROM stdin;
11	37	1000	0.003333	ETH	\N	completed	2025-06-25 23:20:15.327713
12	37	1000	10.000000	USDT	\N	completed	2025-06-25 23:51:15.443799
\.


--
-- Data for Name: referrals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.referrals (id, referrer_id, referred_id, referral_code, reward, is_rewarded, created_at) FROM stdin;
\.


--
-- Data for Name: rewards; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.rewards (id, user_id, prediction_id, amount, description, created_at) FROM stdin;
30	37	40	150	BITCOIN Prediction Reward	2025-06-26 00:19:40.194581
31	37	41	150	ETHEREUM Prediction Reward	2025-06-26 00:20:40.181524
32	37	42	150	POLKADOT Prediction Reward	2025-06-26 06:28:42.552517
33	40	43	150	BITCOIN Prediction Reward	2025-06-26 07:50:42.075836
34	37	44	75	POLKADOT Prediction Reward	2025-06-26 14:14:03.354578
35	37	47	150	TRON Prediction Reward	2025-06-26 17:35:45.81225
36	43	49	300	CHAINLINK Prediction Reward	2025-06-27 02:27:08.357577
37	37	50	75	POLKADOT Prediction Reward	2025-06-27 02:27:08.528214
38	39	52	75	POLKADOT Prediction Reward	2025-06-27 06:51:53.241462
39	39	53	75	TRON Prediction Reward	2025-06-27 06:51:53.417614
40	43	54	180	LITECOIN Prediction Reward	2025-06-27 08:59:22.036727
41	39	55	150	SOLANA Prediction Reward	2025-06-27 11:35:12.597006
42	37	45	300	LITECOIN Prediction Reward	2025-06-27 13:17:28.921981
\.


--
-- Data for Name: security_events; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.security_events (id, event, details, severity, wallet_address, ip_address, country, status, resolved, user_id, created_at, resolved_at, resolved_by) FROM stdin;
2291	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:47:56.245498	\N	\N
2292	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:03.860744	\N	\N
2298	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:12.852524	\N	\N
2299	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:13.096695	\N	\N
2316	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:04.684456	\N	\N
2317	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:06.258816	\N	\N
2389	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:06.96948	\N	\N
2390	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:09.349601	\N	\N
2391	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:10.134712	\N	\N
2392	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:10.769134	\N	\N
2499	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:27:52.967384	\N	\N
2500	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:27:53.785102	\N	\N
2509	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.88	medium	\N	172.31.128.88	Unknown	investigating	f	\N	2025-06-26 08:06:23.396401	\N	\N
2510	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.88	medium	\N	172.31.128.88	Unknown	investigating	f	\N	2025-06-26 08:06:27.983376	\N	\N
2511	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.88	medium	\N	172.31.128.88	Unknown	investigating	f	\N	2025-06-26 08:06:28.269874	\N	\N
2512	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.88	medium	\N	172.31.128.88	Unknown	investigating	f	\N	2025-06-26 08:06:31.3125	\N	\N
2513	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:08:04.02966	\N	\N
2514	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:08:05.729684	\N	\N
2589	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:40:52.258745	\N	\N
2590	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:40:53.183604	\N	\N
2591	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:40:53.43116	\N	\N
2617	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:34:55.034068	\N	\N
2618	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:34:55.680787	\N	\N
2619	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:34:55.735282	\N	\N
2620	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:34:55.983776	\N	\N
2795	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:29:21.477758	\N	\N
2796	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:29:21.970843	\N	\N
2813	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:19.032641	\N	\N
2814	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:24.721388	\N	\N
2815	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:24.815663	\N	\N
2816	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:25.327308	\N	\N
3018	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:29.658898	\N	\N
3022	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:30.188334	\N	\N
3024	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:47.760788	\N	\N
3234	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:28.762919	\N	\N
2293	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:06.172421	\N	\N
2318	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:06.451571	\N	\N
2319	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:06.841277	\N	\N
2393	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:11.508375	\N	\N
2501	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:27:53.958972	\N	\N
2502	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:27:54.122646	\N	\N
2515	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:08:05.883534	\N	\N
2516	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:08:05.995843	\N	\N
2592	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:40:55.319448	\N	\N
2621	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:30.81989	\N	\N
2622	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:34.080786	\N	\N
2625	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:43.581875	\N	\N
2626	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:45.279623	\N	\N
2627	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:45.310807	\N	\N
2797	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:31:12.349883	\N	\N
2801	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:14.82149	\N	\N
2802	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:16.747064	\N	\N
2817	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:45.904028	\N	\N
2818	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:55.665966	\N	\N
2822	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:27:07.864298	\N	\N
2823	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:27:09.395586	\N	\N
3021	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:30.061827	\N	\N
3235	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:29.489529	\N	\N
3236	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:29.573084	\N	\N
3237	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:29.821029	\N	\N
3238	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:30.080554	\N	\N
3423	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:58:41.304916	\N	\N
3427	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:58:43.760281	\N	\N
3428	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:58:45.547439	\N	\N
3667	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:31.645572	\N	\N
3668	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:31.821387	\N	\N
3669	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:32.077526	\N	\N
3862	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:42:27.740224	\N	\N
3863	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:42:27.777808	\N	\N
3927	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:42.255742	\N	\N
2294	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:06.17773	\N	\N
2295	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:06.277517	\N	\N
2320	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:28.976245	\N	\N
2321	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:30.824453	\N	\N
2322	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:30.94529	\N	\N
2323	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:31.191486	\N	\N
2324	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:37.023901	\N	\N
2325	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:42.661413	\N	\N
2326	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:44.228597	\N	\N
2394	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:13.232324	\N	\N
2396	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:14.267835	\N	\N
2397	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:14.561703	\N	\N
2398	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:15.156349	\N	\N
2503	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:30:49.83736	\N	\N
2504	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:30:51.321272	\N	\N
2517	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:06.745967	\N	\N
2518	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:09.077108	\N	\N
2593	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:41:05.751342	\N	\N
2594	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:41:05.924089	\N	\N
2595	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:41:05.994053	\N	\N
2597	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:09.054273	\N	\N
2598	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:10.371857	\N	\N
2599	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:10.584403	\N	\N
2600	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:10.755891	\N	\N
2601	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:10.992388	\N	\N
2623	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:34.287121	\N	\N
2624	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:34.386816	\N	\N
2798	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:31:13.384325	\N	\N
2799	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:31:13.449535	\N	\N
2806	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:18.670776	\N	\N
2819	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:58.592455	\N	\N
3025	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:47.76327	\N	\N
3026	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:48.078033	\N	\N
3239	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:30.800939	\N	\N
3424	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:58:41.436683	\N	\N
2296	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:11.372175	\N	\N
2297	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:12.840466	\N	\N
2327	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:44.380095	\N	\N
2328	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:05:44.493426	\N	\N
2395	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:14.037074	\N	\N
2399	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:15.158781	\N	\N
2400	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:15.419282	\N	\N
2401	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:22.189312	\N	\N
2505	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:30:51.321689	\N	\N
2506	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:30:51.604398	\N	\N
2519	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:09.22342	\N	\N
2520	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:09.341955	\N	\N
2596	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:41:06.072075	\N	\N
2602	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:11.840097	\N	\N
2628	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:35:45.568246	\N	\N
2800	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:31:13.563578	\N	\N
2820	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:58.600549	\N	\N
2821	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:26:58.991044	\N	\N
3027	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:10.731841	\N	\N
3028	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:12.525936	\N	\N
3240	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:03:21.17563	\N	\N
3241	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:03:22.956364	\N	\N
3242	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:03:23.011566	\N	\N
3245	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:06.601318	\N	\N
3425	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:58:41.45513	\N	\N
3864	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:42:27.778636	\N	\N
3870	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:51.725097	\N	\N
3871	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:56.120198	\N	\N
3875	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:43:09.178431	\N	\N
3928	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:43.931676	\N	\N
3929	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:43.969034	\N	\N
3930	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:44.229046	\N	\N
2300	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:56.97634	\N	\N
2301	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:58.539867	\N	\N
2302	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:58.67462	\N	\N
2303	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:48:58.922451	\N	\N
2329	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:08:09.001488	\N	\N
2330	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:08:10.489408	\N	\N
2402	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:25.985145	\N	\N
2403	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:27.84491	\N	\N
2404	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:27.973817	\N	\N
2405	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:28.360263	\N	\N
2406	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:36.317395	\N	\N
2407	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:38.454097	\N	\N
2408	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:38.68881	\N	\N
2410	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:08.121073	\N	\N
2411	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:09.840705	\N	\N
2412	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:09.870724	\N	\N
2507	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:31:55.216114	\N	\N
2521	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:19.031061	\N	\N
2522	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:20.613207	\N	\N
2523	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:20.724381	\N	\N
2524	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:09:20.971181	\N	\N
2603	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:11.854883	\N	\N
2604	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:41:12.344938	\N	\N
2629	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:38:41.458358	\N	\N
2630	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:38:43.083651	\N	\N
2803	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:16.752396	\N	\N
2804	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:16.952737	\N	\N
2805	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:17.024451	\N	\N
2824	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:27:09.39781	\N	\N
3029	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:12.536881	\N	\N
3243	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:03:23.10873	\N	\N
3426	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:58:41.464584	\N	\N
3865	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:42:27.885148	\N	\N
3931	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:58:48.24161	\N	\N
3932	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:58:48.341506	\N	\N
2304	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:50:03.459354	\N	\N
2306	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:50:05.15399	\N	\N
2307	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:50:05.399373	\N	\N
2331	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:08:10.497617	\N	\N
2332	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:08:10.745643	\N	\N
2409	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:35:38.992326	\N	\N
2413	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:10.432517	\N	\N
2414	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:33.217932	\N	\N
2415	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:35.456501	\N	\N
2416	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:35.541352	\N	\N
2508	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.30	medium	\N	172.31.128.30	Unknown	investigating	f	\N	2025-06-26 06:31:56.189574	\N	\N
2525	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:16:54.691184	\N	\N
2605	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:48:08.775615	\N	\N
2606	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:48:08.812213	\N	\N
2631	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:38:43.084392	\N	\N
2632	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:38:43.347561	\N	\N
2807	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:18.680795	\N	\N
2808	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:31:18.930889	\N	\N
2825	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:27:09.65345	\N	\N
3030	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:12.796128	\N	\N
3033	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:27.634728	\N	\N
3244	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:03:26.559692	\N	\N
3429	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:58:45.553352	\N	\N
3430	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:58:45.84804	\N	\N
3866	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:32.923636	\N	\N
3876	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:43:09.185766	\N	\N
3877	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:43:09.438302	\N	\N
3879	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:44:04.515871	\N	\N
3933	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:58:48.421498	\N	\N
3937	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:58:54.536444	\N	\N
3938	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:58:55.488804	\N	\N
4088	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:38.881067	\N	\N
4090	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:46.721663	\N	\N
4091	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:47.916531	\N	\N
4092	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:47.985888	\N	\N
2305	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:50:05.153267	\N	\N
2333	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:09:52.643385	\N	\N
2334	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:09:53.781816	\N	\N
2335	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:09:53.84212	\N	\N
2417	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:36:35.965176	\N	\N
2526	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:16:56.301342	\N	\N
2607	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:48:08.813677	\N	\N
2608	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:48:08.86866	\N	\N
2609	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:48:11.878431	\N	\N
2612	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:48:13.873233	\N	\N
2633	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:39:53.624384	\N	\N
2634	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:39:55.190475	\N	\N
2637	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:40:13.308965	\N	\N
2638	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:40:14.935064	\N	\N
2639	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:40:15.007151	\N	\N
2640	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:40:15.251632	\N	\N
2809	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:32:11.723969	\N	\N
2826	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:27:59.333123	\N	\N
2827	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:28:00.945753	\N	\N
2828	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:28:01.057032	\N	\N
2829	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:28:01.322664	\N	\N
3031	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:25.906524	\N	\N
3032	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:27.430583	\N	\N
3034	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:13:27.896439	\N	\N
3246	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:08.914921	\N	\N
3247	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:09.0119	\N	\N
3248	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:09.26112	\N	\N
3431	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:33.413945	\N	\N
3434	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:35.958279	\N	\N
3867	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:34.70645	\N	\N
3934	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:58:48.423233	\N	\N
4087	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:38.871417	\N	\N
4089	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:46.718215	\N	\N
2308	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:53:16.181109	\N	\N
2309	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:53:17.88888	\N	\N
2336	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:09:53.945344	\N	\N
2339	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:09:56.985176	\N	\N
2340	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:09:57.230878	\N	\N
2418	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:37:50.119681	\N	\N
2419	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:37:54.997975	\N	\N
2527	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:16:56.306011	\N	\N
2610	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:48:13.567857	\N	\N
2635	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:39:55.368164	\N	\N
2636	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:39:55.43734	\N	\N
2810	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:32:11.858209	\N	\N
2830	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:17.934684	\N	\N
2831	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:18.006113	\N	\N
2835	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:19.802203	\N	\N
2840	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:21.841364	\N	\N
2841	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:22.098603	\N	\N
3035	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:15:56.683487	\N	\N
3041	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:01.39432	\N	\N
3044	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:14.184109	\N	\N
3045	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:14.343131	\N	\N
3046	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:14.608946	\N	\N
3053	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:37.15681	\N	\N
3249	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:39.333787	\N	\N
3251	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:41.347116	\N	\N
3252	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:41.603947	\N	\N
3254	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:05:57.401733	\N	\N
3432	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:35.68659	\N	\N
3868	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:34.708179	\N	\N
3869	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:34.955723	\N	\N
3935	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:58:52.282302	\N	\N
4093	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:50.086913	\N	\N
4094	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:16:50.297152	\N	\N
2310	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:53:18.033779	\N	\N
2311	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:53:18.146373	\N	\N
2337	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:09:55.282332	\N	\N
2338	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:09:56.979826	\N	\N
2420	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:37:55.148986	\N	\N
2421	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:37:55.736047	\N	\N
2528	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:16:56.351236	\N	\N
2529	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:16:58.79612	\N	\N
2530	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:17:03.871374	\N	\N
2531	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:17:04.119853	\N	\N
2532	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:17:04.799826	\N	\N
2611	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:48:13.581468	\N	\N
2641	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:14.827936	\N	\N
2642	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:16.539451	\N	\N
2645	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:22.776574	\N	\N
2646	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:24.498652	\N	\N
2811	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:32:11.881896	\N	\N
2832	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:18.011404	\N	\N
2839	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:21.828594	\N	\N
3036	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:15:56.687379	\N	\N
3250	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:04:41.346474	\N	\N
3433	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:35.687507	\N	\N
3872	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:56.121525	\N	\N
3873	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:42:56.68328	\N	\N
3878	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:44:02.782083	\N	\N
3880	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:44:04.526485	\N	\N
3881	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:44:05.510486	\N	\N
3936	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:58:54.526363	\N	\N
4095	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:17:59.204456	\N	\N
4096	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:00.929233	\N	\N
2312	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:54:58.728224	\N	\N
2313	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:55:00.431729	\N	\N
2341	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:09.379536	\N	\N
2422	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:41:24.223817	\N	\N
2423	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:41:25.944735	\N	\N
2533	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:22:37.350377	\N	\N
2534	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:22:38.749065	\N	\N
2535	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:22:38.801254	\N	\N
2536	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:22:39.071477	\N	\N
2613	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:49:21.49362	\N	\N
2614	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:49:23.021959	\N	\N
2615	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:49:23.060849	\N	\N
2616	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:49:23.453086	\N	\N
2643	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:16.692892	\N	\N
2644	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:16.796087	\N	\N
2647	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:24.502378	\N	\N
2648	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:41:24.761024	\N	\N
2812	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:32:11.883055	\N	\N
2833	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:18.029862	\N	\N
2834	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:18.080868	\N	\N
3037	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:15:56.816374	\N	\N
3253	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:05:55.889954	\N	\N
3255	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:05:57.404394	\N	\N
3256	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:05:57.857482	\N	\N
3258	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:06:37.223669	\N	\N
3259	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:06:37.248446	\N	\N
3435	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:00:46.148619	\N	\N
3874	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:43:07.084196	\N	\N
3939	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:27.111244	\N	\N
3940	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:29.057412	\N	\N
4097	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:01.067365	\N	\N
4098	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:01.448291	\N	\N
2314	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:55:00.576397	\N	\N
2315	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:55:00.684161	\N	\N
2342	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:09.464364	\N	\N
2424	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:41:26.148881	\N	\N
2537	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:24:44.016411	\N	\N
2538	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:24:45.388067	\N	\N
2539	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:24:45.543598	\N	\N
2540	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:24:45.676444	\N	\N
2541	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:24:45.728223	\N	\N
2649	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:43:58.671381	\N	\N
2836	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:20.016003	\N	\N
2837	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:20.057993	\N	\N
2838	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:31:20.2716	\N	\N
3038	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:15:56.949754	\N	\N
3039	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:15:59.615503	\N	\N
3040	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:01.388729	\N	\N
3042	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:01.65234	\N	\N
3257	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:06:35.475782	\N	\N
3260	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:06:37.505763	\N	\N
3436	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:00:46.277049	\N	\N
3882	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:48:57.630662	\N	\N
3883	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:48:57.705759	\N	\N
3941	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:29.059129	\N	\N
3942	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:29.548389	\N	\N
4099	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:19.393329	\N	\N
4100	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:30.374218	\N	\N
4101	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:30.43444	\N	\N
4102	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:31.655636	\N	\N
2343	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:09.477391	\N	\N
2425	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:41:26.212288	\N	\N
2426	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:28.492809	\N	\N
2427	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:33.186935	\N	\N
2428	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:33.433891	\N	\N
2429	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:34.621443	\N	\N
2430	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:49.330489	\N	\N
2431	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:50.803765	\N	\N
2433	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:51.0618	\N	\N
2434	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:00.294133	\N	\N
2435	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:02.003688	\N	\N
2542	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:24:45.730086	\N	\N
2545	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:25:27.702871	\N	\N
2650	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:43:58.802648	\N	\N
2842	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:42.932744	\N	\N
2844	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:43.197065	\N	\N
3043	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:12.35405	\N	\N
3261	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:09:08.164744	\N	\N
3437	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:00:46.330566	\N	\N
3884	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:48:57.804464	\N	\N
3943	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:41.742001	\N	\N
3944	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:43.490578	\N	\N
3945	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:43.51975	\N	\N
3946	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:00:43.787738	\N	\N
4103	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:47.138535	\N	\N
4104	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:49.083269	\N	\N
2344	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:09.500216	\N	\N
2345	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:13:11.208559	\N	\N
2346	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:13:12.896112	\N	\N
2432	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:41:50.804071	\N	\N
2543	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:24:45.825647	\N	\N
2544	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:24:45.974796	\N	\N
2651	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:43:58.809543	\N	\N
2653	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:01.590701	\N	\N
2654	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:03.082462	\N	\N
2655	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:03.283929	\N	\N
2656	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:03.530636	\N	\N
2657	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:42.505759	\N	\N
2658	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:44.203578	\N	\N
2660	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:44.464759	\N	\N
2843	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:43.19534	\N	\N
2845	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:31:43.273229	\N	\N
3047	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:16.113988	\N	\N
3048	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:17.920627	\N	\N
3049	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:18.078035	\N	\N
3050	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:18.331361	\N	\N
3262	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:09:08.16567	\N	\N
3263	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:09:08.204596	\N	\N
3438	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:00:46.406886	\N	\N
3885	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:48:57.819	\N	\N
3888	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:03.221003	\N	\N
3889	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:04.931187	\N	\N
3890	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:24.572741	\N	\N
3891	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:26.398942	\N	\N
3947	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:02:49.142347	\N	\N
3948	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:02:51.078678	\N	\N
4105	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:49.218134	\N	\N
4106	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.4	medium	\N	172.31.128.4	Unknown	investigating	f	\N	2025-06-27 13:18:49.582895	\N	\N
2347	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:13:12.898538	\N	\N
2348	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:13:13.142805	\N	\N
2436	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:02.018582	\N	\N
2437	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:02.254808	\N	\N
2438	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:12.09944	\N	\N
2439	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:13.58144	\N	\N
2440	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:13.790235	\N	\N
2441	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:42:14.062008	\N	\N
2546	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:25:29.458396	\N	\N
2652	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:43:58.879127	\N	\N
2846	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:32:34.714374	\N	\N
2847	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:32:36.574924	\N	\N
2848	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:32:36.694108	\N	\N
2849	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:32:36.949832	\N	\N
3051	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:35.374483	\N	\N
3052	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:37.155505	\N	\N
3264	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:09:08.304285	\N	\N
3266	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:09:13.866854	\N	\N
3271	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:10:42.809292	\N	\N
3272	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:10:43.067097	\N	\N
3439	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:49.551895	\N	\N
3440	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:51.42344	\N	\N
3441	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:51.552513	\N	\N
3442	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:00:51.809388	\N	\N
3886	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:01.252976	\N	\N
3949	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:02:51.088051	\N	\N
3950	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:02:52.995759	\N	\N
4107	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:28:28.876528	\N	\N
4108	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:28:35.132433	\N	\N
4109	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:28:35.375216	\N	\N
4110	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:28:36.144096	\N	\N
4111	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:29:18.002594	\N	\N
2349	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:58.253461	\N	\N
2442	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:45:36.469345	\N	\N
2446	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:39.341044	\N	\N
2447	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:41.114454	\N	\N
2450	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:45.544732	\N	\N
2452	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:47.428705	\N	\N
2547	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:25:29.604459	\N	\N
2548	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:25:29.711857	\N	\N
2659	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:44:44.204456	\N	\N
2850	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:33:37.021903	\N	\N
2851	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:33:38.77188	\N	\N
3054	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:16:37.413978	\N	\N
3265	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:09:10.874056	\N	\N
3443	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:04:34.576786	\N	\N
3506	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:30:19.87842	\N	\N
3670	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:04.211462	\N	\N
3674	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:30.997458	\N	\N
3887	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:03.218231	\N	\N
3892	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:26.399807	\N	\N
3951	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:04:49.89479	\N	\N
3952	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:04:49.930309	\N	\N
3958	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:04:57.160208	\N	\N
3959	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:04:57.712782	\N	\N
3962	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:04.513643	\N	\N
3963	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:28.141615	\N	\N
3964	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:29.958032	\N	\N
4112	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:29:20.362493	\N	\N
2350	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:58.395132	\N	\N
2443	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:45:36.576352	\N	\N
2454	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:55.570583	\N	\N
2549	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:26:07.331574	\N	\N
2550	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:26:08.911915	\N	\N
2661	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:49:50.263875	\N	\N
2662	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:49:50.472304	\N	\N
2663	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:49:50.554628	\N	\N
2852	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:33:38.779497	\N	\N
2853	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:33:39.036022	\N	\N
3055	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:19:22.792433	\N	\N
3064	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:29.867257	\N	\N
3267	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:09:13.869299	\N	\N
3268	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:09:14.123093	\N	\N
3444	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:04:34.747203	\N	\N
3507	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:30:21.176037	\N	\N
3671	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:27.103227	\N	\N
3672	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:29.478354	\N	\N
3673	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:29.658165	\N	\N
3893	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:49:26.658489	\N	\N
3953	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:04:49.930634	\N	\N
3954	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:04:50.021427	\N	\N
4113	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:29:20.364005	\N	\N
4114	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:29:20.986209	\N	\N
2351	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:58.42162	\N	\N
2444	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:45:36.695189	\N	\N
2448	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:41.123497	\N	\N
2449	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:41.371325	\N	\N
2451	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:47.422748	\N	\N
2551	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:26:08.925893	\N	\N
2552	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:26:09.177245	\N	\N
2553	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:28:56.989247	\N	\N
2554	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:28:58.697548	\N	\N
2664	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:49:50.660566	\N	\N
2854	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:34:04.959768	\N	\N
2855	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:34:06.785493	\N	\N
2856	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:34:06.95052	\N	\N
3056	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:19:22.908194	\N	\N
3058	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:19:22.989842	\N	\N
3066	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:30.655173	\N	\N
3269	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:10:41.047747	\N	\N
3270	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:10:42.807413	\N	\N
3445	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:04:34.753112	\N	\N
3508	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:30:21.176961	\N	\N
3675	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:36:57.521423	\N	\N
3677	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:37:02.533515	\N	\N
3678	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:37:03.078284	\N	\N
3894	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:52:08.4469	\N	\N
3955	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:04:53.912762	\N	\N
3960	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:03.453574	\N	\N
3961	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:03.699982	\N	\N
4115	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:33:27.733357	\N	\N
4116	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:33:27.847347	\N	\N
4117	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:33:27.910587	\N	\N
4119	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:29.833438	\N	\N
4120	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:31.88873	\N	\N
4125	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:37.351502	\N	\N
2352	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:13:58.42801	\N	\N
2353	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:00.947611	\N	\N
2356	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.472572	\N	\N
2357	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.520955	\N	\N
2358	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.672043	\N	\N
2359	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.76572	\N	\N
2360	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.918226	\N	\N
2445	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:45:36.697462	\N	\N
2453	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:47.681076	\N	\N
2555	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:28:58.717275	\N	\N
2556	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:28:58.963618	\N	\N
2665	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:49:54.051708	\N	\N
2666	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:49:55.643573	\N	\N
2857	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:34:07.234336	\N	\N
3057	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:19:22.988204	\N	\N
3273	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:14:05.619324	\N	\N
3446	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:04:34.765212	\N	\N
3509	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:30:21.253032	\N	\N
3676	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:37:02.530955	\N	\N
3895	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:52:08.478627	\N	\N
3898	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:15.140391	\N	\N
3899	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:18.463487	\N	\N
3900	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:19.873009	\N	\N
3901	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:19.929714	\N	\N
3902	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:20.507439	\N	\N
3904	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:22.739103	\N	\N
3905	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:22.994694	\N	\N
3956	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:04:57.146177	\N	\N
4118	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:33:27.989699	\N	\N
4123	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:35.144315	\N	\N
4126	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:37.858103	\N	\N
2354	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:00.957253	\N	\N
2355	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:02.458242	\N	\N
2455	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:57.035574	\N	\N
2557	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:09.545544	\N	\N
2558	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:11.246025	\N	\N
2559	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:11.360561	\N	\N
2560	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:11.606515	\N	\N
2667	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:49:55.752301	\N	\N
2668	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:49:56.001182	\N	\N
2858	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:37:42.517474	\N	\N
2859	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:37:42.584852	\N	\N
2862	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:46.115242	\N	\N
2863	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:48.008038	\N	\N
2864	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:48.216174	\N	\N
2865	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:48.469529	\N	\N
2866	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:54.236418	\N	\N
2867	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:56.294458	\N	\N
2868	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:56.427082	\N	\N
2869	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:37:56.685369	\N	\N
2870	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:38:06.664727	\N	\N
2871	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:38:08.34604	\N	\N
2872	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:38:08.372479	\N	\N
2873	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:38:08.634673	\N	\N
3059	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:25.421687	\N	\N
3060	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:27.258752	\N	\N
3061	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:28.806309	\N	\N
3067	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:41.864394	\N	\N
3274	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:14:05.717863	\N	\N
3447	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:04:36.830354	\N	\N
3448	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:04:38.879115	\N	\N
3510	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:30:23.958258	\N	\N
3511	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:30:27.556106	\N	\N
3513	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:30:28.000917	\N	\N
3679	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:14.094957	\N	\N
3683	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:45:19.292276	\N	\N
3684	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:45:21.683984	\N	\N
2361	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:14:59.227622	\N	\N
2363	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:00.846204	\N	\N
2456	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:57.037173	\N	\N
2457	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:45:57.294218	\N	\N
2561	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:31:34.947792	\N	\N
2669	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:53:02.497706	\N	\N
2670	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:53:02.56506	\N	\N
2860	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:37:42.681078	\N	\N
3062	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:28.809382	\N	\N
3063	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:29.064395	\N	\N
3275	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:14:05.718641	\N	\N
3277	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:14:09.95532	\N	\N
3278	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:14:12.202921	\N	\N
3449	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:04:38.880412	\N	\N
3450	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:04:39.140904	\N	\N
3512	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:30:27.557006	\N	\N
3680	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:15.391683	\N	\N
3896	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:52:08.579168	\N	\N
3957	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:04:57.149458	\N	\N
3965	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:29.960914	\N	\N
3966	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:30.217589	\N	\N
3967	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:30.681391	\N	\N
3968	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:32.608714	\N	\N
3969	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:32.639728	\N	\N
3970	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:05:33.079001	\N	\N
4121	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:31.89657	\N	\N
4122	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:32.147936	\N	\N
2362	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:00.839817	\N	\N
2364	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:01.093941	\N	\N
2365	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:05.265805	\N	\N
2366	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:06.950411	\N	\N
2368	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:07.198723	\N	\N
2458	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:46:59.162452	\N	\N
2459	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:47:00.842801	\N	\N
2562	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:31:36.330606	\N	\N
2569	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:47.826229	\N	\N
2570	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:49.343761	\N	\N
2571	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:49.369901	\N	\N
2572	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:49.647457	\N	\N
2671	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:53:02.573239	\N	\N
2861	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:37:42.683251	\N	\N
3065	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:29.868691	\N	\N
3276	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:14:05.73895	\N	\N
3279	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:14:12.217432	\N	\N
3451	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:06:21.250485	\N	\N
3514	Unauthorized admin access attempt	Attempted to access /admin without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:23.790984	\N	\N
3515	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:24.174317	\N	\N
3520	Unauthorized admin access attempt	Attempted to access /admin without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:25.007649	\N	\N
3521	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:28.819218	\N	\N
3522	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:31.272454	\N	\N
3681	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:15.39874	\N	\N
3682	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:15.459053	\N	\N
3897	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:52:08.581495	\N	\N
3971	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:09:02.126162	\N	\N
4124	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:33:37.349097	\N	\N
2367	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:15:06.952014	\N	\N
2460	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:47:00.847569	\N	\N
2461	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:47:01.094799	\N	\N
2563	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:31:36.33237	\N	\N
2672	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:53:02.72377	\N	\N
2676	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:53:07.947328	\N	\N
2874	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:40:26.469494	\N	\N
2875	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:40:27.457302	\N	\N
2876	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:40:27.628301	\N	\N
3068	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:43.663041	\N	\N
3069	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:43.699127	\N	\N
3070	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:19:43.955437	\N	\N
3280	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:14:12.474287	\N	\N
3452	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:06:21.403815	\N	\N
3516	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:24.301867	\N	\N
3685	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:45:21.684887	\N	\N
3686	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:45:22.324579	\N	\N
3903	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:52:22.727149	\N	\N
3972	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:09:02.232356	\N	\N
3975	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:07.275253	\N	\N
3976	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:07.573057	\N	\N
3977	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:09.165981	\N	\N
3978	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:09.224571	\N	\N
3979	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:09.311229	\N	\N
3980	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:09.340596	\N	\N
3981	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:09.606939	\N	\N
3982	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:10.113387	\N	\N
3985	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:40.842767	\N	\N
3986	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:41.112518	\N	\N
4127	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:35:37.816615	\N	\N
2369	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:24.491403	\N	\N
2370	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:26.201829	\N	\N
2462	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:48:44.840946	\N	\N
2564	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:31:36.373134	\N	\N
2565	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:38.45754	\N	\N
2566	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:40.078725	\N	\N
2567	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:40.162681	\N	\N
2568	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:31:40.409378	\N	\N
2673	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:53:06.001288	\N	\N
2674	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:53:07.458241	\N	\N
2877	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:40:27.743567	\N	\N
3071	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:24:42.165168	\N	\N
3074	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:43.57656	\N	\N
3080	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:52.035637	\N	\N
3281	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:15:28.480771	\N	\N
3453	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:06:21.478958	\N	\N
3517	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:24.302776	\N	\N
3518	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:31:24.366869	\N	\N
3687	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:59.245063	\N	\N
3906	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:53:13.984524	\N	\N
3973	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:09:02.238598	\N	\N
4128	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:35:37.919407	\N	\N
4133	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:35:42.696303	\N	\N
4134	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:35:43.144198	\N	\N
2371	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:26.204743	\N	\N
2372	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:26.452075	\N	\N
2375	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:33.947282	\N	\N
2376	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:34.194256	\N	\N
2463	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:48:44.944163	\N	\N
2573	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:32:28.938875	\N	\N
2675	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:53:07.469526	\N	\N
2878	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:40:30.182272	\N	\N
2879	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:40:31.966426	\N	\N
2880	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:40:32.157725	\N	\N
3072	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:24:43.430616	\N	\N
3073	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:24:43.500751	\N	\N
3076	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:48.707891	\N	\N
3077	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:48.847402	\N	\N
3078	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:49.265793	\N	\N
3282	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:15:28.590901	\N	\N
3454	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:06:21.529007	\N	\N
3519	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:24.381547	\N	\N
3523	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:31.281279	\N	\N
3524	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:31.772635	\N	\N
3525	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:31:33.435199	\N	\N
3526	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:32:57.242865	\N	\N
3688	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:59.459197	\N	\N
3907	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:53:14.109027	\N	\N
3974	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:09:02.305547	\N	\N
4129	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:35:37.921151	\N	\N
2373	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:32.248332	\N	\N
2374	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:16:33.945399	\N	\N
2464	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:48:44.965411	\N	\N
2471	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:16.020188	\N	\N
2474	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:17.500357	\N	\N
2475	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:17.780769	\N	\N
2477	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:18.683907	\N	\N
2478	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:19.169123	\N	\N
2574	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:32:29.028521	\N	\N
2677	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:54:48.15947	\N	\N
2678	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:54:49.607509	\N	\N
2679	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:54:49.632704	\N	\N
2680	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:54:50.12862	\N	\N
2881	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:40:32.411774	\N	\N
3075	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:24:43.609891	\N	\N
3083	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:25:01.816153	\N	\N
3084	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:25:03.579937	\N	\N
3085	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:25:03.625623	\N	\N
3283	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:15:28.593976	\N	\N
3455	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:06:24.165176	\N	\N
3456	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:06:26.134922	\N	\N
3457	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:06:26.176679	\N	\N
3458	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:06:26.429315	\N	\N
3527	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:32:59.499809	\N	\N
3689	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:59.459985	\N	\N
3908	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:53:14.139842	\N	\N
3910	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:17.996397	\N	\N
3911	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:21.340524	\N	\N
3983	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:38.98181	\N	\N
3984	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:09:40.823792	\N	\N
3989	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:10:54.952123	\N	\N
3990	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:10:55.972834	\N	\N
4130	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:35:37.937052	\N	\N
2377	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:17:26.844504	\N	\N
2378	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:17:28.905287	\N	\N
2379	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:17:28.953277	\N	\N
2380	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:17:29.770318	\N	\N
2465	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:48:44.989652	\N	\N
2466	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:48:48.650488	\N	\N
2467	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:48:50.166378	\N	\N
2575	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:32:29.046453	\N	\N
2577	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:32:30.355727	\N	\N
2578	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:32:32.0493	\N	\N
2580	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:32:32.30383	\N	\N
2681	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:54:57.593736	\N	\N
2682	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:54:57.767275	\N	\N
2882	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:41:49.88245	\N	\N
2883	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:41:50.912038	\N	\N
2885	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:41:51.976443	\N	\N
3079	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:49.758139	\N	\N
3086	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:25:03.882296	\N	\N
3284	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:15:28.633274	\N	\N
3285	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:15:31.950724	\N	\N
3286	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:15:33.724071	\N	\N
3287	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:15:33.863161	\N	\N
3459	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:06:52.014818	\N	\N
3460	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:07:07.891964	\N	\N
3461	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:07:09.615759	\N	\N
3462	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:07:09.67749	\N	\N
3463	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:07:09.936376	\N	\N
3528	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:32:59.658624	\N	\N
3529	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:32:59.77335	\N	\N
3690	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:45:59.461259	\N	\N
3909	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:53:14.161497	\N	\N
3912	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:21.342775	\N	\N
3913	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:21.625404	\N	\N
3914	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:32.063093	\N	\N
3915	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:32.924089	\N	\N
2381	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:24:42.654397	\N	\N
2382	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:24:42.700637	\N	\N
2383	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:24:42.75447	\N	\N
2468	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:48:50.172863	\N	\N
2469	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:48:50.636565	\N	\N
2576	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 13:32:29.051242	\N	\N
2579	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:32:32.054928	\N	\N
2683	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:54:57.808811	\N	\N
2884	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:41:51.1345	\N	\N
3081	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:52.038734	\N	\N
3082	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:24:52.40207	\N	\N
3288	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:15:34.117511	\N	\N
3464	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:14:32.427313	\N	\N
3465	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:14:36.900905	\N	\N
3466	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:14:37.261007	\N	\N
3468	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:14:37.59158	\N	\N
3469	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:14:37.90047	\N	\N
3470	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:14:43.354894	\N	\N
3530	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:33:47.53438	\N	\N
3532	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:33:49.301258	\N	\N
3533	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:33:49.558743	\N	\N
3691	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:04.09247	\N	\N
3692	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:06.518032	\N	\N
3916	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:34.26129	\N	\N
3987	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:10:53.241929	\N	\N
3993	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:12:28.256431	\N	\N
3994	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:12:28.509862	\N	\N
3996	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:13:07.854774	\N	\N
4131	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:35:40.975013	\N	\N
4132	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:35:42.691747	\N	\N
2384	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 23:24:42.870721	\N	\N
2385	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:24:45.602147	\N	\N
2387	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:24:47.309362	\N	\N
2388	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:24:47.554513	\N	\N
2470	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:10.80642	\N	\N
2472	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:16.072887	\N	\N
2473	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:17.49692	\N	\N
2476	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:18.491117	\N	\N
2479	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:26.778165	\N	\N
2481	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:28.240516	\N	\N
2482	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:28.492315	\N	\N
2581	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:34:08.250377	\N	\N
2582	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:34:09.815763	\N	\N
2684	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:54:57.94514	\N	\N
2685	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:55:01.970638	\N	\N
2686	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:55:03.670382	\N	\N
2886	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:42:05.992063	\N	\N
2888	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:42:06.047079	\N	\N
3087	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:26:39.264772	\N	\N
3089	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:26:44.447003	\N	\N
3289	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:16:34.076924	\N	\N
3467	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:14:37.586314	\N	\N
3471	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:14:43.582689	\N	\N
3472	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:14:44.378887	\N	\N
3531	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:33:49.293692	\N	\N
3693	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:06.523338	\N	\N
3694	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:07.418932	\N	\N
3917	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:34.406987	\N	\N
3918	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:53:34.525099	\N	\N
3988	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:10:54.944693	\N	\N
4135	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:36:22.352435	\N	\N
4138	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:36:25.083175	\N	\N
2386	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:24:47.305051	\N	\N
2480	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:49:28.23981	\N	\N
2486	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:24.673828	\N	\N
2583	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:34:09.823281	\N	\N
2584	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:34:10.077485	\N	\N
2687	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:55:03.673815	\N	\N
2688	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:55:03.921337	\N	\N
2887	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:42:06.039023	\N	\N
3088	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:26:44.426694	\N	\N
3091	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:26:59.920949	\N	\N
3092	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:27:01.437715	\N	\N
3093	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:27:01.545823	\N	\N
3094	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:27:02.125518	\N	\N
3290	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:16:36.068004	\N	\N
3292	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:16:37.359348	\N	\N
3473	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:16:14.927491	\N	\N
3474	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:16:15.019122	\N	\N
3477	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:17.245725	\N	\N
3478	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:19.026982	\N	\N
3482	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:34.341418	\N	\N
3483	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:36.249913	\N	\N
3534	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:34:26.791515	\N	\N
3535	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:34:29.069072	\N	\N
3537	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:34:29.340632	\N	\N
3695	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:38.655125	\N	\N
3696	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:39.171628	\N	\N
3919	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:21.323061	\N	\N
3920	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:23.044004	\N	\N
3991	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:12:26.52976	\N	\N
3992	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:12:28.237873	\N	\N
3995	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:13:06.204696	\N	\N
3997	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:13:07.906169	\N	\N
3998	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:13:08.165666	\N	\N
4136	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:36:24.331815	\N	\N
2483	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:22.857237	\N	\N
2484	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:24.393987	\N	\N
2485	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:24.421481	\N	\N
2585	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:35:13.654822	\N	\N
2586	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:35:15.188162	\N	\N
2587	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:35:15.214131	\N	\N
2588	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 13:35:15.46757	\N	\N
2689	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:55:53.458241	\N	\N
2889	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:42:06.208114	\N	\N
3090	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:26:45.229993	\N	\N
3291	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:16:36.083153	\N	\N
3475	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:16:15.105079	\N	\N
3536	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:34:29.07294	\N	\N
3697	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:40.918532	\N	\N
3698	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:46:41.184863	\N	\N
3921	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:23.048351	\N	\N
3922	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:23.299308	\N	\N
3999	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:15:43.454194	\N	\N
4137	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:36:24.348657	\N	\N
2487	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:25.471531	\N	\N
2488	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:26.954919	\N	\N
2690	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:55:53.590802	\N	\N
2890	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:09.295242	\N	\N
2892	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:11.543252	\N	\N
2893	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:11.799492	\N	\N
3095	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:31:19.3778	\N	\N
3293	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:17:28.721916	\N	\N
3296	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:17:30.774744	\N	\N
3476	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:16:15.127623	\N	\N
3538	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:37:09.483628	\N	\N
3539	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:37:12.65718	\N	\N
3541	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:37:12.916059	\N	\N
3699	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:59:49.791652	\N	\N
3700	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:59:50.043627	\N	\N
3701	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:59:50.129109	\N	\N
3705	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:59:55.661764	\N	\N
3923	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:27.036672	\N	\N
3924	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:30.143854	\N	\N
3925	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:30.17107	\N	\N
3926	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:54:30.437216	\N	\N
4000	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:15:43.549689	\N	\N
4139	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:39:42.934384	\N	\N
4141	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:39:44.866315	\N	\N
4142	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:39:45.358741	\N	\N
2489	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:26.956276	\N	\N
2490	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:50:27.449767	\N	\N
2691	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:55:53.593631	\N	\N
2891	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:11.340254	\N	\N
3096	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:31:21.153788	\N	\N
3098	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:31:22.023671	\N	\N
3294	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:17:30.512991	\N	\N
3479	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:19.032175	\N	\N
3480	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:19.292922	\N	\N
3481	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:31.094005	\N	\N
3484	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:36.267271	\N	\N
3485	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:16:36.529382	\N	\N
3540	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:37:12.658234	\N	\N
3702	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 09:59:50.269119	\N	\N
4001	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:15:43.646272	\N	\N
4014	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:16:26.316769	\N	\N
4140	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:39:44.791751	\N	\N
2491	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:55:27.433178	\N	\N
2492	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:55:29.126765	\N	\N
2692	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 17:55:53.60691	\N	\N
2693	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:56:20.87394	\N	\N
2694	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:56:22.331432	\N	\N
2894	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:37.223342	\N	\N
2897	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:39.238604	\N	\N
3097	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:31:21.154896	\N	\N
3295	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:17:30.515856	\N	\N
3486	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:17:48.330633	\N	\N
3488	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:17:48.447782	\N	\N
3542	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:40:00.807304	\N	\N
3543	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:01.307071	\N	\N
3703	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:59:53.226165	\N	\N
3704	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:59:55.661325	\N	\N
3706	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 09:59:55.975481	\N	\N
4002	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:15:43.670082	\N	\N
4143	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:39:56.285839	\N	\N
2493	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:55:29.147834	\N	\N
2494	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:55:29.461353	\N	\N
2695	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:56:22.485263	\N	\N
2696	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:56:23.044063	\N	\N
2895	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:38.948642	\N	\N
2896	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:42:38.978584	\N	\N
3099	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:34:36.254457	\N	\N
3100	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:34:37.786479	\N	\N
3101	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:34:37.912514	\N	\N
3297	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:20:36.819192	\N	\N
3300	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:20:38.628335	\N	\N
3487	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:17:48.333415	\N	\N
3490	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:17:50.434074	\N	\N
3544	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:40:02.523484	\N	\N
3707	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:00:38.842596	\N	\N
4003	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:47.693052	\N	\N
4004	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:49.814186	\N	\N
4008	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:56.606674	\N	\N
4010	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:57.612301	\N	\N
4144	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:39:56.441568	\N	\N
4145	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:39:56.53909	\N	\N
2495	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:56:19.761276	\N	\N
2496	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:56:21.46961	\N	\N
2697	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:57:33.925709	\N	\N
2698	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:57:35.799754	\N	\N
2898	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:44:21.172256	\N	\N
3102	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:34:38.170795	\N	\N
3298	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:20:38.334117	\N	\N
3299	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:20:38.372263	\N	\N
3489	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:17:48.583188	\N	\N
3492	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:17:56.011071	\N	\N
3545	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:40:02.524797	\N	\N
3708	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:00:39.078236	\N	\N
3714	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:00:45.285942	\N	\N
4005	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:49.819572	\N	\N
4009	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:56.859047	\N	\N
4146	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:39:56.673014	\N	\N
2497	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:56:21.634966	\N	\N
2498	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.96	medium	\N	172.31.128.96	Unknown	investigating	f	\N	2025-06-25 23:56:22.054153	\N	\N
2699	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:57:35.933539	\N	\N
2700	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 17:57:36.055103	\N	\N
2899	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:44:21.305164	\N	\N
3103	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:41:08.777093	\N	\N
3104	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:41:10.363039	\N	\N
3105	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:41:10.42412	\N	\N
3107	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:11.389532	\N	\N
3119	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:34.301079	\N	\N
3120	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:34.768255	\N	\N
3301	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:20:50.096407	\N	\N
3491	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:17:55.9897	\N	\N
3493	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:17:57.04986	\N	\N
3546	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:40:02.56528	\N	\N
3548	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:09.982915	\N	\N
3551	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:11.428955	\N	\N
3709	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:00:39.081209	\N	\N
3711	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:00:41.765152	\N	\N
3712	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:00:44.399421	\N	\N
4006	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:50.452039	\N	\N
4007	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:15:50.645021	\N	\N
4011	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:16:23.828711	\N	\N
4013	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:16:25.794807	\N	\N
4147	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:39:59.822396	\N	\N
4148	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:40:01.559764	\N	\N
2701	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:01:10.824446	\N	\N
2900	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:44:21.316386	\N	\N
3106	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:41:10.51716	\N	\N
3303	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:20:52.197337	\N	\N
3494	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:18:44.076832	\N	\N
3547	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:07.577886	\N	\N
3710	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:00:39.084041	\N	\N
3713	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:00:44.405805	\N	\N
3721	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:10.688731	\N	\N
3722	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:10.951219	\N	\N
3725	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:22.526073	\N	\N
3726	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:22.783303	\N	\N
4012	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:16:25.789214	\N	\N
4149	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:40:01.565765	\N	\N
4150	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:40:02.00943	\N	\N
2702	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:01:13.608365	\N	\N
2703	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:01:13.644752	\N	\N
2901	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:44:21.35521	\N	\N
3108	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:13.630796	\N	\N
3113	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:26.368413	\N	\N
3117	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:32.757419	\N	\N
3118	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:34.296515	\N	\N
3121	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:41.639483	\N	\N
3123	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:48.474687	\N	\N
3125	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:48.742048	\N	\N
3128	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:52.068172	\N	\N
3129	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:52.428612	\N	\N
3302	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:20:52.1966	\N	\N
3304	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:20:52.264262	\N	\N
3495	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:18:46.362296	\N	\N
3497	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:18:46.643334	\N	\N
3549	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:09.988316	\N	\N
3550	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:40:10.25204	\N	\N
3715	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:06.129089	\N	\N
3716	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:07.790835	\N	\N
4015	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:17.935819	\N	\N
4016	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:18.072772	\N	\N
4017	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:18.299882	\N	\N
4151	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:00.9782	\N	\N
4152	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:03.673475	\N	\N
4153	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:03.74031	\N	\N
2704	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:01:16.231603	\N	\N
2902	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:44:24.407546	\N	\N
3109	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:13.633551	\N	\N
3110	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:13.892799	\N	\N
3111	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:22.067121	\N	\N
3112	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:24.31826	\N	\N
3114	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:26.378497	\N	\N
3115	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:26.638507	\N	\N
3116	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:30.764951	\N	\N
3305	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:18.672546	\N	\N
3307	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:20.486187	\N	\N
3496	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:18:46.377372	\N	\N
3552	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:27.713001	\N	\N
3559	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:37.542276	\N	\N
3717	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:07.796671	\N	\N
3718	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:08.263289	\N	\N
3719	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:08.625617	\N	\N
4018	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:18.456433	\N	\N
4026	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:21:30.633162	\N	\N
4154	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:03.993996	\N	\N
2705	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:03:28.594741	\N	\N
2706	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:03:30.060448	\N	\N
2709	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:03:34.285987	\N	\N
2710	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:03:36.004919	\N	\N
2903	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:44:26.205826	\N	\N
2904	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:44:26.23719	\N	\N
2905	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:44:26.496516	\N	\N
3122	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:45.060191	\N	\N
3124	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:48.477355	\N	\N
3126	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:49.422543	\N	\N
3127	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:41:52.067204	\N	\N
3132	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:42:10.750111	\N	\N
3306	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:20.462437	\N	\N
3308	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:20.753104	\N	\N
3311	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:58.89365	\N	\N
3498	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:19:35.457491	\N	\N
3503	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:19:43.99349	\N	\N
3504	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:19:44.239761	\N	\N
3553	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:42:28.968711	\N	\N
3720	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:10.676424	\N	\N
4019	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:21:23.928675	\N	\N
4022	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:28.917752	\N	\N
4155	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:32.715412	\N	\N
4157	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:34.450005	\N	\N
4158	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:34.702124	\N	\N
2707	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:03:30.143534	\N	\N
2906	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:45:20.553223	\N	\N
2909	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:45:22.60141	\N	\N
3130	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:42:08.716494	\N	\N
3131	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:42:10.748889	\N	\N
3309	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:57.061267	\N	\N
3310	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:58.891129	\N	\N
3499	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:19:35.458916	\N	\N
3554	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:42:29.058279	\N	\N
3723	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:20.732757	\N	\N
3724	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:01:22.509336	\N	\N
4020	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:28.761667	\N	\N
4021	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:28.914046	\N	\N
4025	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:21:29.955675	\N	\N
4156	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:41:34.440233	\N	\N
2708	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:03:30.155561	\N	\N
2907	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:45:22.343604	\N	\N
3133	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:42:11.070955	\N	\N
3312	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:21:59.152698	\N	\N
3313	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:22:39.424504	\N	\N
3314	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:22:41.212726	\N	\N
3315	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:22:41.341344	\N	\N
3500	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:19:35.495902	\N	\N
3555	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:42:29.065473	\N	\N
3727	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:03:09.203508	\N	\N
4023	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:21:28.995687	\N	\N
4024	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:21:29.93431	\N	\N
4159	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:43:39.790803	\N	\N
4162	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:43:42.038922	\N	\N
2711	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:03:36.012068	\N	\N
2712	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:03:36.2618	\N	\N
2908	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.38	medium	\N	172.31.128.38	Unknown	investigating	f	\N	2025-06-27 02:45:22.345051	\N	\N
3134	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:43:07.2992	\N	\N
3138	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:43:12.028896	\N	\N
3139	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:43:17.811678	\N	\N
3316	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:22:41.598591	\N	\N
3501	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:19:35.576746	\N	\N
3556	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:42:29.069314	\N	\N
3557	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:35.04687	\N	\N
3558	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:37.541894	\N	\N
3560	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:37.812556	\N	\N
3561	Unauthorized admin access attempt	Attempted to access /admin without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:42:38.973057	\N	\N
3728	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:03:10.98728	\N	\N
4027	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:40.246582	\N	\N
4028	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:41.989729	\N	\N
4029	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:42.055684	\N	\N
4030	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:42.596093	\N	\N
4031	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:43.945695	\N	\N
4032	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:45.560806	\N	\N
4033	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:46.924342	\N	\N
4035	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:49.165016	\N	\N
4036	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:51.01954	\N	\N
4038	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:51.749853	\N	\N
4160	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:43:41.763276	\N	\N
2713	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:04:06.052723	\N	\N
2715	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:04:07.74955	\N	\N
2716	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:04:08.005005	\N	\N
2910	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:49:09.10214	\N	\N
2911	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:49:11.073782	\N	\N
3135	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:43:07.406069	\N	\N
3317	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:23:41.490529	\N	\N
3321	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:24:03.465657	\N	\N
3323	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:24:04.027724	\N	\N
3502	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:19:39.069898	\N	\N
3505	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:19:45.010532	\N	\N
3562	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:43:25.610646	\N	\N
3729	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:03:10.992508	\N	\N
3730	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:03:11.256903	\N	\N
4034	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:46.964374	\N	\N
4037	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:30:51.022774	\N	\N
4161	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:43:41.783645	\N	\N
2714	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:04:07.748486	\N	\N
2912	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:49:11.08428	\N	\N
2913	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:49:11.343614	\N	\N
2914	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:29.537154	\N	\N
2915	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:31.529423	\N	\N
2917	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:31.805525	\N	\N
2918	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:37.883354	\N	\N
2919	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:39.602611	\N	\N
2920	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:39.647606	\N	\N
2921	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:39.952189	\N	\N
3136	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:43:07.437466	\N	\N
3140	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:43:17.81515	\N	\N
3141	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:43:18.623923	\N	\N
3318	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:23:43.268409	\N	\N
3324	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:24:05.241811	\N	\N
3563	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:43:25.715259	\N	\N
3731	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:06:18.924356	\N	\N
3732	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:06:18.991498	\N	\N
3747	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:07:00.244526	\N	\N
3748	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:07:01.74602	\N	\N
4039	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:31:39.397481	\N	\N
4040	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:31:44.650875	\N	\N
4163	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:45:36.47041	\N	\N
4164	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:45:36.526273	\N	\N
4165	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:45:36.648287	\N	\N
4168	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:45:38.942461	\N	\N
4169	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:45:39.0386	\N	\N
4170	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:45:39.379259	\N	\N
2717	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:07:38.390091	\N	\N
2916	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:50:31.549232	\N	\N
3137	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:43:07.463892	\N	\N
3319	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:23:43.282877	\N	\N
3320	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:23:43.543788	\N	\N
3564	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:43:25.746462	\N	\N
3733	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:06:19.066146	\N	\N
4041	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:31:44.652965	\N	\N
4166	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:45:36.69803	\N	\N
4167	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:45:37.181712	\N	\N
2718	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:07:38.44955	\N	\N
2719	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:07:38.513088	\N	\N
2922	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:51:26.996613	\N	\N
2923	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:51:27.026716	\N	\N
2926	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:31.726598	\N	\N
2927	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:37.042989	\N	\N
3142	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:02:43.268217	\N	\N
3146	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:02:48.203072	\N	\N
3147	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:02:49.802155	\N	\N
3148	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:02:49.970553	\N	\N
3322	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:24:03.768798	\N	\N
3565	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:43:25.747271	\N	\N
3566	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:43:29.239103	\N	\N
3568	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:43:31.835214	\N	\N
3569	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:43:32.466281	\N	\N
3734	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:06:19.075518	\N	\N
3735	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:24.160348	\N	\N
3743	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:42.576985	\N	\N
3744	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:44.591115	\N	\N
3745	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:44.618026	\N	\N
3750	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:07:03.519492	\N	\N
4042	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:31:46.111624	\N	\N
4171	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:46:30.648794	\N	\N
4176	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:32.511347	\N	\N
4181	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:35.880835	\N	\N
4182	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:36.343103	\N	\N
2720	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:07:38.528102	\N	\N
2924	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:51:27.027786	\N	\N
3143	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:02:44.647732	\N	\N
3144	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:02:44.740603	\N	\N
3325	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:27:11.899641	\N	\N
3327	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:27:13.243011	\N	\N
3567	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:43:31.8341	\N	\N
3736	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:26.645674	\N	\N
3737	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:26.754678	\N	\N
3738	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:27.263471	\N	\N
3739	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:29.434091	\N	\N
3740	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:33.97454	\N	\N
3741	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:34.224272	\N	\N
3742	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:34.813164	\N	\N
3746	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:06:44.873795	\N	\N
3749	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:07:01.756843	\N	\N
4043	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:35:38.999115	\N	\N
4044	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:35:40.459565	\N	\N
4172	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:46:30.737973	\N	\N
4177	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:32.512247	\N	\N
4178	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:33.038548	\N	\N
4179	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:33.89426	\N	\N
4180	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:35.87731	\N	\N
2721	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:07:41.387055	\N	\N
2925	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:51:27.114008	\N	\N
3145	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:02:44.832718	\N	\N
3326	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:27:13.240485	\N	\N
3328	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:27:13.329772	\N	\N
3570	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:45:19.67635	\N	\N
3571	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:45:21.674233	\N	\N
3751	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:08:57.116204	\N	\N
3752	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:08:59.978196	\N	\N
3753	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:00.015096	\N	\N
3754	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:01.327093	\N	\N
4045	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:35:40.471655	\N	\N
4046	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:35:40.768376	\N	\N
4173	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:46:30.745931	\N	\N
2722	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:07:43.052007	\N	\N
2724	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:07:43.569333	\N	\N
2928	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:37.044516	\N	\N
2929	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:37.886455	\N	\N
2930	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:51.218803	\N	\N
2932	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:52.987471	\N	\N
2933	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:53.243318	\N	\N
3149	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:02:50.295138	\N	\N
3329	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:17.414644	\N	\N
3572	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:45:21.695219	\N	\N
3573	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:45:22.981779	\N	\N
3755	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:09:17.228758	\N	\N
3757	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:09:17.279148	\N	\N
4047	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:09.155922	\N	\N
4048	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:09.274531	\N	\N
4050	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:09.36444	\N	\N
4055	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:31.235823	\N	\N
4056	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:31.440147	\N	\N
4058	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:31.47682	\N	\N
4059	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:40:04.541684	\N	\N
4060	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:40:06.247039	\N	\N
4062	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:40:06.507199	\N	\N
4174	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:46:30.751447	\N	\N
4175	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:46:30.809894	\N	\N
2723	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:07:43.069519	\N	\N
2931	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:51:52.972021	\N	\N
3150	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:04:43.390096	\N	\N
3330	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:35.893337	\N	\N
3574	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:46:59.342691	\N	\N
3756	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:09:17.236565	\N	\N
4049	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:09.276292	\N	\N
4052	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:38:14.881135	\N	\N
4053	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:38:14.904562	\N	\N
4054	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:38:16.061599	\N	\N
4057	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:38:31.441198	\N	\N
4183	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:50:13.197471	\N	\N
2725	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:08:16.054002	\N	\N
2730	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:08:21.339529	\N	\N
2934	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:52:59.893556	\N	\N
2935	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:01.653481	\N	\N
2937	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:01.922699	\N	\N
3151	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:04:43.391245	\N	\N
3331	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:37.190122	\N	\N
3575	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:46:59.456415	\N	\N
3578	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:47:02.332349	\N	\N
3579	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:47:05.403335	\N	\N
3758	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:09:17.418133	\N	\N
3761	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:24.007413	\N	\N
4051	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:38:12.479311	\N	\N
4184	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:50:14.799732	\N	\N
4189	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:50:20.172064	\N	\N
4190	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:50:20.418991	\N	\N
2726	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:08:16.129145	\N	\N
2936	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:01.663061	\N	\N
3152	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:04:43.544359	\N	\N
3332	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:37.204325	\N	\N
3576	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:46:59.481329	\N	\N
3759	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:21.796863	\N	\N
3760	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:24.000749	\N	\N
3762	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:09:24.727695	\N	\N
4061	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:40:06.251274	\N	\N
4185	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:50:14.803402	\N	\N
4187	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:50:18.450526	\N	\N
4188	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.69	medium	\N	172.31.128.69	Unknown	investigating	f	\N	2025-06-27 17:50:20.168213	\N	\N
2727	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:08:16.141206	\N	\N
2731	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:08:21.341568	\N	\N
2732	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:08:21.786576	\N	\N
2938	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:53:26.782396	\N	\N
2943	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:33.394525	\N	\N
2945	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:34.04656	\N	\N
2946	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:39.644907	\N	\N
2947	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:40.925259	\N	\N
2948	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:41.159512	\N	\N
3153	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 04:04:43.545512	\N	\N
3333	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:38.007201	\N	\N
3340	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:28:55.006465	\N	\N
3341	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:28:55.266169	\N	\N
3346	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:31:22.00099	\N	\N
3347	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:31:23.766083	\N	\N
3349	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:31:24.045321	\N	\N
3577	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:46:59.49562	\N	\N
3580	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:47:05.409596	\N	\N
3581	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:47:05.690999	\N	\N
3763	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:06.803183	\N	\N
4063	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:00.62881	\N	\N
4064	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:04.835313	\N	\N
4065	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:05.088878	\N	\N
4186	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 17:50:14.843506	\N	\N
2728	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:08:16.171904	\N	\N
2939	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:53:27.9182	\N	\N
3154	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:15:32.781022	\N	\N
3155	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:15:35.263033	\N	\N
3334	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:39.9175	\N	\N
3335	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:41.553253	\N	\N
3336	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:41.66486	\N	\N
3337	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:27:41.919898	\N	\N
3582	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:48:45.879339	\N	\N
3583	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:48:47.772795	\N	\N
3764	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:08.586404	\N	\N
3765	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:08.80706	\N	\N
3766	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:09.598659	\N	\N
3767	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:39.915787	\N	\N
4066	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:05.622423	\N	\N
2729	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:08:19.571372	\N	\N
2940	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:53:28.040697	\N	\N
3156	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:15:35.265157	\N	\N
3157	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:15:35.523464	\N	\N
3338	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:28:53.220671	\N	\N
3339	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:28:54.998043	\N	\N
3348	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:31:23.775588	\N	\N
3355	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:33:37.759138	\N	\N
3584	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:48:47.88522	\N	\N
3768	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:41.969028	\N	\N
3769	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:42.069538	\N	\N
3770	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:42.332899	\N	\N
4067	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:42:48.691889	\N	\N
4068	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:42:48.758304	\N	\N
4071	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:52.650781	\N	\N
4072	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:55.615468	\N	\N
4077	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:12.171971	\N	\N
4078	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:12.583316	\N	\N
4079	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:24.546168	\N	\N
4080	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:26.577227	\N	\N
4082	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:26.840924	\N	\N
2733	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:09:25.783289	\N	\N
2734	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:09:27.007615	\N	\N
2736	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:09:27.722021	\N	\N
2941	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:53:28.042991	\N	\N
2942	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:31.328284	\N	\N
3158	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:16:35.253524	\N	\N
3159	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:16:37.038353	\N	\N
3160	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:16:37.220849	\N	\N
3161	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 04:16:37.49064	\N	\N
3342	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:30:40.144329	\N	\N
3343	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:30:41.92785	\N	\N
3344	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:30:42.071605	\N	\N
3345	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:30:42.338521	\N	\N
3585	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:48:48.147444	\N	\N
3771	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:10:53.360683	\N	\N
3772	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:10:55.133827	\N	\N
3773	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:10:55.214439	\N	\N
3777	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:11:00.860323	\N	\N
4069	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:42:48.778724	\N	\N
4075	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:09.333034	\N	\N
4076	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:12.161069	\N	\N
4081	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:43:26.595576	\N	\N
2735	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:09:27.026872	\N	\N
2944	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:33.587656	\N	\N
3162	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:35:56.481053	\N	\N
3163	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:35:58.229812	\N	\N
3350	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:32:31.10929	\N	\N
3351	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:32:32.629765	\N	\N
3352	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:32:32.855597	\N	\N
3586	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:09.295841	\N	\N
3587	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:10.846805	\N	\N
3588	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:10.978141	\N	\N
3589	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:11.314338	\N	\N
3774	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:10:55.386537	\N	\N
4070	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 11:42:48.89847	\N	\N
2737	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:11:47.933662	\N	\N
2738	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:11:49.634522	\N	\N
2739	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:11:49.67954	\N	\N
2740	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:11:49.929151	\N	\N
2949	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:53:41.431025	\N	\N
3164	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:35:58.238886	\N	\N
3165	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:35:58.502661	\N	\N
3353	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:32:33.098146	\N	\N
3590	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:39.935962	\N	\N
3591	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:42.413756	\N	\N
3592	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:42.455423	\N	\N
3593	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:49:42.694965	\N	\N
3775	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:10:58.305046	\N	\N
3776	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:11:00.858995	\N	\N
3778	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:11:01.185345	\N	\N
4073	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:55.623975	\N	\N
4074	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 11:42:56.096528	\N	\N
2741	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:33.454331	\N	\N
2744	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:33.533244	\N	\N
2746	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:14:39.095394	\N	\N
2950	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:54:18.960526	\N	\N
3166	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:38:51.462558	\N	\N
3170	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:38:53.808962	\N	\N
3171	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:38:54.031108	\N	\N
3174	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:38:54.269201	\N	\N
3354	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:33:35.979323	\N	\N
3357	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:33:38.022472	\N	\N
3594	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:51:40.010494	\N	\N
3779	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:21:44.903399	\N	\N
3780	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:21:44.975212	\N	\N
3783	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:21:49.075163	\N	\N
3784	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:21:53.393815	\N	\N
3785	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:21:53.589052	\N	\N
3786	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:21:54.135061	\N	\N
4083	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 12:38:15.006705	\N	\N
4086	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 12:38:17.08483	\N	\N
2742	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:33.482894	\N	\N
2951	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:54:19.065721	\N	\N
2956	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:54:24.347132	\N	\N
3167	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:38:52.825767	\N	\N
3356	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:33:37.776741	\N	\N
3595	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:51:40.138368	\N	\N
3781	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:21:45.07656	\N	\N
4084	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 12:38:16.80944	\N	\N
2743	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:33.484585	\N	\N
2952	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:54:19.147242	\N	\N
2955	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:54:24.3244	\N	\N
2957	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:54:24.602975	\N	\N
3168	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:38:53.601044	\N	\N
3169	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:38:53.804563	\N	\N
3172	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:38:54.038773	\N	\N
3173	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:38:54.100487	\N	\N
3358	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:39:33.023723	\N	\N
3596	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:51:40.142282	\N	\N
3782	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:21:45.097622	\N	\N
3787	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:12.269936	\N	\N
3788	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:14.265726	\N	\N
4085	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 12:38:16.825297	\N	\N
2745	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:14:37.3635	\N	\N
2749	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:52.857148	\N	\N
2751	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:53.070223	\N	\N
2752	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:53.112778	\N	\N
2953	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 02:54:19.191898	\N	\N
2954	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:54:22.460135	\N	\N
3175	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:41:52.919963	\N	\N
3359	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:39:36.639082	\N	\N
3360	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:39:36.86369	\N	\N
3361	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:39:37.469995	\N	\N
3366	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:39:38.767006	\N	\N
3597	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:51:40.162419	\N	\N
3789	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:14.423156	\N	\N
3790	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:14.687678	\N	\N
2747	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:14:39.099209	\N	\N
2748	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:14:39.347863	\N	\N
2958	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:57:31.495305	\N	\N
2960	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:57:33.022457	\N	\N
2961	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:57:33.281817	\N	\N
3176	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:41:53.044961	\N	\N
3179	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:53.922715	\N	\N
3181	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:55.65279	\N	\N
3182	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:55.886334	\N	\N
3183	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:55.920676	\N	\N
3362	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:39:37.509772	\N	\N
3363	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:39:37.753162	\N	\N
3364	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:39:38.437876	\N	\N
3365	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:39:38.506147	\N	\N
3598	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:30.711544	\N	\N
3604	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:33.805582	\N	\N
3791	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:22:24.404328	\N	\N
2750	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:14:53.067183	\N	\N
2959	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:57:33.020269	\N	\N
3177	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:41:53.073266	\N	\N
3180	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:55.650891	\N	\N
3367	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:40:43.672526	\N	\N
3376	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:55.199564	\N	\N
3599	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:30.727391	\N	\N
3600	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:32.497483	\N	\N
3601	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:32.529162	\N	\N
3602	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:33.082869	\N	\N
3603	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:33.804345	\N	\N
3605	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:52:34.078065	\N	\N
3792	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:22:24.474426	\N	\N
2753	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:16:51.435361	\N	\N
2755	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:16:53.383938	\N	\N
2756	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:16:53.634857	\N	\N
2962	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:58:28.389538	\N	\N
3178	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:41:53.101815	\N	\N
3184	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:57.665083	\N	\N
3368	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:40:43.677078	\N	\N
3370	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:40:43.723541	\N	\N
3606	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:53:11.446179	\N	\N
3607	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:53:12.946916	\N	\N
3608	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:53:13.026148	\N	\N
3793	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:22:24.493288	\N	\N
2754	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:16:53.381482	\N	\N
2963	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:58:30.152192	\N	\N
3185	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:57.679873	\N	\N
3186	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:41:57.940194	\N	\N
3369	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:40:43.720173	\N	\N
3374	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:50.519133	\N	\N
3375	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:50.937543	\N	\N
3609	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:53:13.28514	\N	\N
3794	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:22:24.505653	\N	\N
3797	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:30.933936	\N	\N
3798	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:31.393899	\N	\N
2757	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:19:40.210941	\N	\N
2964	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:58:30.304496	\N	\N
2965	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 02:58:30.421802	\N	\N
3187	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:32.654481	\N	\N
3189	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:34.161551	\N	\N
3371	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:47.534809	\N	\N
3372	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:49.063127	\N	\N
3373	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:49.223639	\N	\N
3610	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:56:17.474846	\N	\N
3611	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:56:17.64281	\N	\N
3616	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:56:24.61029	\N	\N
3617	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:56:25.41614	\N	\N
3795	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:28.696339	\N	\N
3796	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:22:30.92384	\N	\N
2758	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:19:40.295107	\N	\N
2966	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:00:44.542895	\N	\N
2967	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:00:44.613624	\N	\N
2971	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:00:50.605523	\N	\N
2972	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:00:50.631066	\N	\N
2973	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:00:50.889887	\N	\N
3188	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:33.917253	\N	\N
3190	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:34.698169	\N	\N
3377	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:55.314088	\N	\N
3378	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:40:55.829578	\N	\N
3612	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:56:17.814782	\N	\N
3799	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:26:42.276861	\N	\N
2759	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:19:40.355952	\N	\N
2968	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:00:44.717226	\N	\N
2970	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:00:48.855323	\N	\N
3191	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:43:50.016718	\N	\N
3192	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:43:50.164286	\N	\N
3196	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:55.960674	\N	\N
3197	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:56.186651	\N	\N
3198	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:56.44015	\N	\N
3379	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:44:41.748446	\N	\N
3613	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:56:17.822852	\N	\N
3614	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:56:22.163044	\N	\N
3615	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:56:24.599696	\N	\N
3800	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:26:42.433178	\N	\N
2760	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:19:40.365016	\N	\N
2761	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:19:44.825394	\N	\N
2763	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:19:46.546779	\N	\N
2969	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:00:44.718085	\N	\N
3193	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:43:50.289095	\N	\N
3195	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:43:53.996385	\N	\N
3380	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:44:43.763182	\N	\N
3618	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:17.920232	\N	\N
3619	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:18.517123	\N	\N
3620	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:19.777158	\N	\N
3801	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:26:42.439262	\N	\N
3803	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:26:45.391202	\N	\N
3804	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:26:47.498023	\N	\N
3809	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:27:08.993633	\N	\N
3810	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:27:09.251041	\N	\N
2762	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:19:46.544212	\N	\N
2974	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:01:47.936579	\N	\N
2975	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:01:48.101188	\N	\N
3194	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:43:50.290829	\N	\N
3381	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:44:43.765681	\N	\N
3382	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:44:44.032021	\N	\N
3621	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:19.798347	\N	\N
3622	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:20.061322	\N	\N
3802	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:26:42.536625	\N	\N
3805	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:26:47.513106	\N	\N
3807	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:27:06.752141	\N	\N
3808	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:27:08.97915	\N	\N
2764	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:19:46.796489	\N	\N
2976	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:01:48.159642	\N	\N
3199	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:12.252296	\N	\N
3383	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:45:35.167838	\N	\N
3384	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:45:37.125053	\N	\N
3385	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:45:37.156452	\N	\N
3386	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:45:37.673032	\N	\N
3623	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:24.962811	\N	\N
3628	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:33.028584	\N	\N
3629	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:33.545557	\N	\N
3806	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:26:48.28127	\N	\N
2765	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:21:36.385104	\N	\N
2771	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:21:40.676942	\N	\N
2977	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:01:48.251656	\N	\N
2978	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:01:51.303037	\N	\N
2979	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:44.676497	\N	\N
2980	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:46.802431	\N	\N
2981	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.205072	\N	\N
2984	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.343989	\N	\N
2985	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.470447	\N	\N
2986	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.92916	\N	\N
2987	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:55.679396	\N	\N
2988	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:57.449918	\N	\N
2990	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:57.707552	\N	\N
3200	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:14.44897	\N	\N
3201	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:14.631144	\N	\N
3202	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:15.33678	\N	\N
3387	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:47:00.210107	\N	\N
3389	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:47:02.600806	\N	\N
3393	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:05.942723	\N	\N
3394	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:06.201079	\N	\N
3624	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:25.207696	\N	\N
3625	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:27.461957	\N	\N
3626	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:28.17506	\N	\N
3627	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:57:33.02437	\N	\N
3811	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:28:43.705065	\N	\N
3817	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:28:51.605173	\N	\N
3818	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:28:52.289628	\N	\N
3821	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:29:01.657697	\N	\N
3822	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:29:01.693501	\N	\N
2766	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:21:37.74177	\N	\N
2770	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:21:40.673267	\N	\N
2772	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:21:40.922042	\N	\N
2982	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.211625	\N	\N
2983	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:48.337279	\N	\N
2989	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:02:57.450327	\N	\N
3203	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:34.914788	\N	\N
3206	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:37.402296	\N	\N
3388	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:47:02.599031	\N	\N
3630	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:59:36.802263	\N	\N
3812	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:28:43.717036	\N	\N
3819	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:29:01.400344	\N	\N
3820	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:29:01.657155	\N	\N
2767	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:21:37.805172	\N	\N
2769	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:21:38.952177	\N	\N
2991	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:06:38.173935	\N	\N
3204	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:36.682611	\N	\N
3390	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:47:02.782404	\N	\N
3391	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:03.960885	\N	\N
3392	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:05.931106	\N	\N
3631	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:59:37.014304	\N	\N
3813	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:28:43.834096	\N	\N
2768	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:21:37.964244	\N	\N
2775	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:28.423833	\N	\N
2992	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:06:39.955067	\N	\N
2993	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:06:40.190726	\N	\N
2994	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:06:40.45497	\N	\N
3205	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:49:36.693346	\N	\N
3395	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:20.795487	\N	\N
3396	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:22.535433	\N	\N
3397	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:22.564146	\N	\N
3398	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:22.844372	\N	\N
3632	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:59:37.12531	\N	\N
3634	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:59:42.789692	\N	\N
3636	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:59:44.867081	\N	\N
3637	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:59:45.29148	\N	\N
3814	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:28:43.835309	\N	\N
3815	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:28:47.992786	\N	\N
3816	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:28:51.604353	\N	\N
2773	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:26.635069	\N	\N
2776	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:28.690243	\N	\N
2995	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:06:58.075691	\N	\N
2999	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:07:01.517733	\N	\N
3000	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:07:03.302012	\N	\N
3002	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:07:03.564932	\N	\N
3207	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:50:00.057479	\N	\N
3213	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:50:01.923338	\N	\N
3214	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:50:01.976499	\N	\N
3215	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:50:02.221745	\N	\N
3399	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:43.602653	\N	\N
3400	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:45.410801	\N	\N
3401	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:45.594003	\N	\N
3402	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:47:45.856519	\N	\N
3633	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 07:59:37.150124	\N	\N
3635	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 07:59:44.853086	\N	\N
3823	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:53.386899	\N	\N
3824	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:56.361701	\N	\N
3825	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:56.563562	\N	\N
3826	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:57.961216	\N	\N
3827	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:59.838339	\N	\N
3828	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:30:59.87183	\N	\N
3829	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:31:00.125059	\N	\N
2774	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:28.416531	\N	\N
2996	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:06:58.314864	\N	\N
2997	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:06:58.425879	\N	\N
3208	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:50:00.394898	\N	\N
3403	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:48:37.847639	\N	\N
3404	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:48:39.639975	\N	\N
3407	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:49:10.497388	\N	\N
3408	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:49:12.264068	\N	\N
3409	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:49:12.29511	\N	\N
3638	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:00:49.770307	\N	\N
3640	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:00:53.922853	\N	\N
3642	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:02.701179	\N	\N
3648	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:55.482967	\N	\N
3649	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:55.747036	\N	\N
3830	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:35:00.915178	\N	\N
3833	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:35:05.699536	\N	\N
2777	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:23:36.676327	\N	\N
2783	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:40.931648	\N	\N
2998	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:06:58.557229	\N	\N
3209	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:50:01.413668	\N	\N
3210	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:50:01.799787	\N	\N
3211	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:50:01.835746	\N	\N
3212	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:50:01.91464	\N	\N
3405	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:48:39.64693	\N	\N
3406	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:48:39.913445	\N	\N
3639	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:00:53.915839	\N	\N
3641	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:00:54.497566	\N	\N
3831	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:35:04.877783	\N	\N
3832	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:35:04.916196	\N	\N
2778	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:23:36.678063	\N	\N
2781	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:38.705198	\N	\N
3001	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:07:03.302724	\N	\N
3004	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:08:15.43802	\N	\N
3005	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:08:15.580389	\N	\N
3006	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:08:15.836148	\N	\N
3216	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:51:25.108418	\N	\N
3410	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:49:12.558802	\N	\N
3643	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:04.796828	\N	\N
3644	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:04.923378	\N	\N
3646	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:53.734704	\N	\N
3647	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:55.48241	\N	\N
3652	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:59.401638	\N	\N
3653	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:59.590575	\N	\N
3834	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:12.079524	\N	\N
2779	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:23:36.873809	\N	\N
3003	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:08:13.824512	\N	\N
3217	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:51:25.210245	\N	\N
3411	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:52:34.855975	\N	\N
3412	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:52:36.625762	\N	\N
3413	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:52:36.758959	\N	\N
3645	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:05.200759	\N	\N
3835	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:12.311404	\N	\N
3840	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:18.23342	\N	\N
3841	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:18.975064	\N	\N
2780	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:23:36.901261	\N	\N
2782	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:40.926965	\N	\N
2784	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:23:41.176494	\N	\N
3007	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:11:53.766439	\N	\N
3012	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:11:59.703934	\N	\N
3218	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:51:25.229253	\N	\N
3220	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:51:28.186118	\N	\N
3221	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:51:30.423963	\N	\N
3414	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:52:37.654042	\N	\N
3650	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:57.781644	\N	\N
3651	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:01:59.321612	\N	\N
3836	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:12.484603	\N	\N
3838	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:15.525581	\N	\N
3839	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:18.231988	\N	\N
2785	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:26:43.702378	\N	\N
2786	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:26:44.930748	\N	\N
3008	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:11:53.879332	\N	\N
3219	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 05:51:25.324202	\N	\N
3223	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:51:30.689668	\N	\N
3415	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:56:28.817377	\N	\N
3416	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:56:29.057092	\N	\N
3654	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 08:12:27.232997	\N	\N
3655	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 08:12:27.33781	\N	\N
3656	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 08:12:27.399916	\N	\N
3658	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:12:31.296345	\N	\N
3661	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:12:34.559073	\N	\N
3837	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:12.513217	\N	\N
2787	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:26:44.932811	\N	\N
2788	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:26:45.42366	\N	\N
3009	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:11:53.880382	\N	\N
3011	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:11:57.316354	\N	\N
3222	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:51:30.431893	\N	\N
3417	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:56:29.108162	\N	\N
3657	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 08:12:27.505287	\N	\N
3660	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:12:33.8631	\N	\N
3842	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:48.211051	\N	\N
3843	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:48.405329	\N	\N
3853	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:05.532464	\N	\N
3854	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:06.258685	\N	\N
2789	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:29:16.205518	\N	\N
3010	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 03:11:53.906369	\N	\N
3224	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:05.497722	\N	\N
3225	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:06.500499	\N	\N
3226	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:08.088742	\N	\N
3229	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:08.474505	\N	\N
3230	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:08.739872	\N	\N
3231	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:09.117313	\N	\N
3418	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 06:56:29.133618	\N	\N
3422	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:56:34.642095	\N	\N
3659	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:12:33.850123	\N	\N
3844	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:48.54441	\N	\N
3848	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:55.423239	\N	\N
3849	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:56.195366	\N	\N
3850	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:56.619342	\N	\N
3855	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:08.881515	\N	\N
3856	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:09.317669	\N	\N
3857	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:09.567101	\N	\N
3858	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:09.7634	\N	\N
2790	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:29:16.236986	\N	\N
3013	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:11:59.937693	\N	\N
3014	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:00.18785	\N	\N
3020	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:29.918979	\N	\N
3023	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:46.004679	\N	\N
3227	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:08.106116	\N	\N
3228	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:55:08.470517	\N	\N
3419	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:56:32.084068	\N	\N
3420	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:56:34.373851	\N	\N
3662	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:00.727939	\N	\N
3663	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:02.6928	\N	\N
3665	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:02.98214	\N	\N
3845	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-27 10:36:48.54607	\N	\N
3851	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:05.423703	\N	\N
3852	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:05.527206	\N	\N
3859	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:11.857181	\N	\N
3860	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:11.969116	\N	\N
3861	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:37:12.234533	\N	\N
2791	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:29:16.239191	\N	\N
2792	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-26 18:29:16.291349	\N	\N
2793	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:29:20.005068	\N	\N
2279	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 22:44:44.371581	\N	\N
2280	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 22:44:44.499387	\N	\N
2282	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 22:44:44.583178	\N	\N
2281	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 127.0.0.1	medium	\N	127.0.0.1	Unknown	investigating	f	\N	2025-06-25 22:44:44.582101	\N	\N
2283	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:48.875714	\N	\N
2284	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:50.34757	\N	\N
2285	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:50.396264	\N	\N
2286	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:50.562269	\N	\N
2287	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:50.811481	\N	\N
2288	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:51.885305	\N	\N
2289	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:52.088351	\N	\N
2290	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-growth-chart.tsx without authentication from 172.31.128.77	medium	\N	172.31.128.77	Unknown	investigating	f	\N	2025-06-25 22:44:52.401993	\N	\N
2794	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.35	medium	\N	172.31.128.35	Unknown	investigating	f	\N	2025-06-26 18:29:21.475731	\N	\N
3015	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:27.252456	\N	\N
3016	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:28.202756	\N	\N
3017	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:29.65353	\N	\N
3019	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 03:12:29.912225	\N	\N
3232	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:26.984175	\N	\N
3233	Unauthorized admin access attempt	Attempted to access /src/components/admin/banner-management.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 05:59:28.758621	\N	\N
3421	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 06:56:34.384728	\N	\N
3664	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:02.712346	\N	\N
3666	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.44	medium	\N	172.31.128.44	Unknown	investigating	f	\N	2025-06-27 08:13:28.970233	\N	\N
3846	Unauthorized admin access attempt	Attempted to access /src/pages/admin.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:53.832426	\N	\N
3847	Unauthorized admin access attempt	Attempted to access /src/components/admin/user-statistics.tsx without authentication from 172.31.128.113	medium	\N	172.31.128.113	Unknown	investigating	f	\N	2025-06-27 10:36:55.418904	\N	\N
\.


--
-- Data for Name: system_settings; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.system_settings (id, category, key, value, data_type, description, updated_by, updated_at) FROM stdin;
\.


--
-- Data for Name: transaction_logs; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.transaction_logs (id, user_id, type, amount, token, status, hash, from_address, to_address, network_fee, exchange_rate, related_id, created_at) FROM stdin;
\.


--
-- Data for Name: user_achievements; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_achievements (id, user_id, achievement_id, progress, is_completed, completed_at, created_at) FROM stdin;
43	37	1	3	t	2025-06-26 13:10:43.566	2025-06-26 13:10:43.579126
44	37	2	7	f	\N	2025-06-26 13:10:43.653195
45	37	3	7	f	\N	2025-06-26 13:10:43.69836
46	37	4	0	f	\N	2025-06-26 13:10:43.742854
47	37	5	0	f	\N	2025-06-26 13:10:43.810575
48	37	6	675	f	\N	2025-06-26 13:10:43.856091
49	37	7	0	f	\N	2025-06-26 13:10:43.922734
50	39	1	4	t	2025-06-27 11:35:23.561	2025-06-27 02:59:58.03004
51	39	2	4	f	\N	2025-06-27 02:59:58.081901
52	39	3	4	f	\N	2025-06-27 02:59:58.13197
53	39	4	0	f	\N	2025-06-27 02:59:58.182314
54	39	5	0	f	\N	2025-06-27 02:59:58.256931
55	39	6	2060	f	\N	2025-06-27 02:59:58.307004
56	39	7	0	f	\N	2025-06-27 02:59:58.384983
\.


--
-- Data for Name: user_analytics; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_analytics (id, user_id, date, predictions_count, correct_predictions, total_staked, total_rewards, win_streak, max_win_streak, login_streak, created_at) FROM stdin;
\.


--
-- Data for Name: user_daily_challenges; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.user_daily_challenges (id, user_id, challenge_id, progress, is_completed, completed_at, date, created_at) FROM stdin;
40	39	15	50	f	\N	2025-06-27	2025-06-27 02:59:58.586083
41	39	16	4	t	2025-06-27 11:35:23.265	2025-06-27	2025-06-27 02:59:58.641543
31	37	9	2	t	2025-06-25 23:49:45.907	2025-06-25	2025-06-25 23:49:45.782016
32	37	10	50	f	\N	2025-06-25	2025-06-25 23:49:45.828325
33	37	11	0	f	\N	2025-06-25	2025-06-25 23:49:45.873001
34	39	9	0	f	\N	2025-06-25	2025-06-25 23:56:07.353108
35	39	10	0	f	\N	2025-06-25	2025-06-25 23:56:07.40287
36	39	11	0	f	\N	2025-06-25	2025-06-25 23:56:07.450438
37	37	12	5	t	2025-06-26 18:17:41.098	2025-06-26	2025-06-26 13:10:44.183987
38	37	13	6	t	2025-06-26 18:17:41.189	2025-06-26	2025-06-26 13:10:44.23102
39	37	14	0	f	\N	2025-06-26	2025-06-26 13:10:44.274857
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.users (id, username, password, balance, total_predictions, correct_predictions, total_rewards, wallet_address, auth_method, is_admin, uid, profile_photo) FROM stdin;
43	FastPredictor2280	\N	1663	2	2	1450	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	wallet	f	366113158	\N
39	mdlog123	\N	3013	4	3	2810	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	wallet	f	627780669	/uploads/profile_39_1750895760604.png
37	admin	\N	1620	9	7	1150	0x4C6165286739696849Fb3e77A16b0639D762c5B6	wallet	t	304447815	\N
40	ProKing4687	\N	1050	1	1	150	0x28b50E928092b646dAe08EC5115A75Ee0abF44Bd	wallet	f	521648893	\N
41	Admin_62c5b6	\N	1000	0	0	0	0x4c6165286739696849fb3e77a16b0639d762c5b6	wallet	t	686110543	\N
42	FastTrader2799	\N	1000	0	0	0	0xaCA879a1570d445A165228e8Fa93EB7cfC9c42A7	wallet	f	437699250	\N
\.


--
-- Data for Name: wallet_fingerprints; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.wallet_fingerprints (id, wallet_address, user_id, ip_address, user_agent, browser_fingerprint, device_fingerprint, screen_resolution, timezone, language, platform, color_depth, pixel_ratio, hardware_concurrency, max_touch_points, created_at) FROM stdin;
1	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:14:13.691368
2	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:15:16.353149
3	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:16:39.858553
4	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:18:30.611553
5	0xa9620179a3105fD4673bA2A27701eBd80ffee070	\N	172.31.128.96	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	6b01988ad5991a70	6b01988ad5991a70			id-ID		\N	\N	\N	\N	2025-06-25 23:35:47.762172
6	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:36:58.487112
7	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:41:15.062848
8	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:42:22.091822
9	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:46:07.294482
10	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:47:08.314355
11	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:47:30.626193
12	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:49:35.332786
13	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:49:57.724258
14	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:50:39.887091
15	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	600a892b9088b8d0	600a892b9088b8d0			en-US	"Linux"	\N	\N	\N	\N	2025-06-25 23:50:43.43686
16	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:55:38.022092
17	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.96	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	d893a26d535e8ef8	d893a26d535e8ef8			en-US		\N	\N	\N	\N	2025-06-25 23:58:08.09201
18	0x28b50E928092b646dAe08EC5115A75Ee0abF44Bd	\N	172.31.128.30	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	96c6c8ea498bceb0	96c6c8ea498bceb0			id-ID		\N	\N	\N	\N	2025-06-26 06:28:04.96903
19	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.30	Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 WebView MetaMaskMobile	96c6c8ea498bceb0	96c6c8ea498bceb0			id-ID		\N	\N	\N	\N	2025-06-26 06:31:16.141706
20	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:09:41.688281
21	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:22:51.392633
22	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:25:41.789731
23	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:26:21.848095
24	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:29:06.809421
25	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:31:20.080474
26	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:31:59.641162
27	0x4c6165286739696849fb3e77a16b0639d762c5b6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:33:41.917783
28	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:34:20.613766
29	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:35:34.273631
30	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:41:29.108751
31	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 13:49:33.55468
32	0xaCA879a1570d445A165228e8Fa93EB7cfC9c42A7	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 17:40:06.369054
33	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 17:41:38.795637
34	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 17:44:54.222563
35	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 17:56:44.340096
36	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.35	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	3e0ca5720a558b44	3e0ca5720a558b44			en-US	"Linux"	\N	\N	\N	\N	2025-06-26 17:58:02.678627
37	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:05:08.76256
38	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:11:10.009063
39	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:13:24.943162
40	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:17:01.28415
41	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:23:49.814145
42	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.35	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	6c7bc58db6011ba7	6c7bc58db6011ba7			en-US		\N	\N	\N	\N	2025-06-26 18:27:05.214418
43	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.38	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	fdc50d100b17d7e6	fdc50d100b17d7e6			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:27:24.403781
44	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.38	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	a837994ea4c8962b	a837994ea4c8962b			en-US		\N	\N	\N	\N	2025-06-27 02:28:20.797705
45	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.38	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	fdc50d100b17d7e6	fdc50d100b17d7e6			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:31:32.925677
46	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.38	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	fdc50d100b17d7e6	fdc50d100b17d7e6			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:32:56.871643
47	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.38	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	fdc50d100b17d7e6	fdc50d100b17d7e6			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:33:48.172838
48	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.38	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	a837994ea4c8962b	a837994ea4c8962b			en-US		\N	\N	\N	\N	2025-06-27 02:34:18.029058
49	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.38	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	a837994ea4c8962b	a837994ea4c8962b			en-US		\N	\N	\N	\N	2025-06-27 02:38:21.16323
50	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.38	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	a837994ea4c8962b	a837994ea4c8962b			en-US		\N	\N	\N	\N	2025-06-27 02:42:04.791997
51	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.38	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	a837994ea4c8962b	a837994ea4c8962b			en-US		\N	\N	\N	\N	2025-06-27 02:45:41.141867
52	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:50:52.018475
53	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:52:07.642284
54	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 02:53:12.734796
55	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 02:53:52.559828
56	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 02:57:40.297467
57	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 02:58:47.08245
58	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:03:13.786589
59	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 03:08:02.193207
60	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:08:26.166206
61	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 03:12:56.43892
62	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:13:38.064599
63	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:16:44.883245
64	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:19:56.515459
65	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:25:19.633415
66	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 03:31:28.070337
67	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:34:47.971007
68	0x4c6165286739696849fb3e77a16b0639d762c5b6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 03:41:51.147211
69	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 03:59:38.739582
70	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 04:15:42.204506
71	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 04:16:42.893725
72	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 05:36:08.506512
73	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 05:42:09.681852
74	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 05:43:50.163436
75	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 05:52:08.286941
76	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 05:55:16.681374
77	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:04:12.72999
78	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:04:50.642396
79	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:05:11.223019
80	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:06:09.382893
81	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:06:52.194355
82	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:10:49.929165
83	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:20:22.077433
84	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:20:51.787124
85	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:21:44.867672
86	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:22:25.619508
87	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:22:50.106916
88	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:24:11.65758
89	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:27:49.388908
90	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:31:07.769671
91	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:32:41.145406
92	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 06:41:25.793624
93	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:44:54.554975
94	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:45:58.50959
95	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:47:30.647802
96	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:47:53.398289
97	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:48:52.768873
98	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:49:41.101708
99	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 06:52:45.906409
100	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 07:06:47.027909
101	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:07:21.827973
102	0x4c6165286739696849fb3e77a16b0639d762c5b6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:16:41.468325
103	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:33:08.540166
104	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 07:35:45.477525
105	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:36:25.49894
106	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:37:27.324686
107	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 07:45:30.630111
108	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.44	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	384e9b34d7caa578	384e9b34d7caa578			en-US		\N	\N	\N	\N	2025-06-27 07:49:19.46118
109	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:52:50.009804
110	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 07:57:44.821073
111	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 08:01:14.963204
112	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.44	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	1b8b239c78921fbd	1b8b239c78921fbd			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 08:02:54.509946
113	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 09:46:51.692619
114	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 09:47:22.643992
115	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 10:33:53.42443
116	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 10:35:26.512889
117	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 10:37:32.766871
118	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 10:37:39.529314
119	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 10:43:48.81189
120	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 10:44:25.536317
121	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 10:49:36.237469
122	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 10:54:37.603588
123	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 10:56:10.247247
124	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:01:29.054549
125	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:01:39.381534
126	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:03:08.993908
127	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:05:50.119334
128	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:09:23.227555
129	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:12:41.580121
130	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:13:20.713867
131	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:16:33.621195
132	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:31:06.188986
133	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:32:04.390451
134	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.113	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	c09cec32fbe5928f	c09cec32fbe5928f			en-US		\N	\N	\N	\N	2025-06-27 11:35:53.42309
135	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:40:38.525398
136	0x69A16BAd76dc6020ac3f215edd9a8FC42B6e149D	\N	172.31.128.113	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	68e81c6251228f9c	68e81c6251228f9c			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 11:43:35.312921
137	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.69	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	4b135d4b85ba9c04	4b135d4b85ba9c04			en-US		\N	\N	\N	\N	2025-06-27 17:29:44.171046
138	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.69	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	4b135d4b85ba9c04	4b135d4b85ba9c04			en-US		\N	\N	\N	\N	2025-06-27 17:33:45.825806
139	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.69	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	4b135d4b85ba9c04	4b135d4b85ba9c04			en-US		\N	\N	\N	\N	2025-06-27 17:36:37.368786
140	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.69	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	4b135d4b85ba9c04	4b135d4b85ba9c04			en-US		\N	\N	\N	\N	2025-06-27 17:40:05.52571
141	0x4C6165286739696849Fb3e77A16b0639D762c5B6	\N	172.31.128.69	Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36	31fa2939280139df	31fa2939280139df			en-US	"Linux"	\N	\N	\N	\N	2025-06-27 17:41:40.193794
142	0xA127700ab9718Bb480137FE5F8422d6dd48A162F	\N	172.31.128.69	Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:139.0) Gecko/20100101 Firefox/139.0	4b135d4b85ba9c04	4b135d4b85ba9c04			en-US		\N	\N	\N	\N	2025-06-27 17:46:40.655418
\.


--
-- Data for Name: withdrawals; Type: TABLE DATA; Schema: public; Owner: neondb_owner
--

COPY public.withdrawals (id, user_id, pts_amount, token_amount, token, wallet_address, status, created_at) FROM stdin;
10	37	1000	10.00	USDC	0x4C6165286739696849Fb3e77A16b0639D762c5B6	completed	2025-06-25 23:20:22.135333
11	37	1000	10.00	USDC	0x4C6165286739696849Fb3e77A16b0639D762c5B6	completed	2025-06-25 23:51:24.624994
\.


--
-- Name: abuse_detections_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.abuse_detections_id_seq', 80, true);


--
-- Name: achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.achievements_id_seq', 7, true);


--
-- Name: admin_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.admin_logs_id_seq', 7, true);


--
-- Name: banners_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.banners_id_seq', 3, true);


--
-- Name: battle_comments_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.battle_comments_id_seq', 1, false);


--
-- Name: daily_challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.daily_challenges_id_seq', 16, true);


--
-- Name: events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.events_id_seq', 8, true);


--
-- Name: prediction_battles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.prediction_battles_id_seq', 12, true);


--
-- Name: predictions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.predictions_id_seq', 55, true);


--
-- Name: purchases_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.purchases_id_seq', 12, true);


--
-- Name: referrals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.referrals_id_seq', 1, false);


--
-- Name: rewards_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.rewards_id_seq', 42, true);


--
-- Name: security_events_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.security_events_id_seq', 4190, true);


--
-- Name: system_settings_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.system_settings_id_seq', 11, true);


--
-- Name: transaction_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.transaction_logs_id_seq', 16, true);


--
-- Name: user_achievements_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_achievements_id_seq', 56, true);


--
-- Name: user_analytics_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_analytics_id_seq', 1, false);


--
-- Name: user_daily_challenges_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.user_daily_challenges_id_seq', 41, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.users_id_seq', 43, true);


--
-- Name: wallet_fingerprints_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.wallet_fingerprints_id_seq', 142, true);


--
-- Name: withdrawals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: neondb_owner
--

SELECT pg_catalog.setval('public.withdrawals_id_seq', 11, true);


--
-- Name: abuse_detections abuse_detections_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.abuse_detections
    ADD CONSTRAINT abuse_detections_pkey PRIMARY KEY (id);


--
-- Name: achievements achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.achievements
    ADD CONSTRAINT achievements_pkey PRIMARY KEY (id);


--
-- Name: admin_logs admin_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_pkey PRIMARY KEY (id);


--
-- Name: banners banners_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_pkey PRIMARY KEY (id);


--
-- Name: battle_comments battle_comments_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.battle_comments
    ADD CONSTRAINT battle_comments_pkey PRIMARY KEY (id);


--
-- Name: cryptocurrencies cryptocurrencies_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.cryptocurrencies
    ADD CONSTRAINT cryptocurrencies_pkey PRIMARY KEY (id);


--
-- Name: daily_challenges daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.daily_challenges
    ADD CONSTRAINT daily_challenges_pkey PRIMARY KEY (id);


--
-- Name: events events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_pkey PRIMARY KEY (id);


--
-- Name: prediction_battles prediction_battles_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prediction_battles
    ADD CONSTRAINT prediction_battles_pkey PRIMARY KEY (id);


--
-- Name: predictions predictions_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_pkey PRIMARY KEY (id);


--
-- Name: purchases purchases_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_pkey PRIMARY KEY (id);


--
-- Name: referrals referrals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_pkey PRIMARY KEY (id);


--
-- Name: rewards rewards_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_pkey PRIMARY KEY (id);


--
-- Name: security_events security_events_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_pkey PRIMARY KEY (id);


--
-- Name: system_settings system_settings_category_key_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_category_key_key UNIQUE (category, key);


--
-- Name: system_settings system_settings_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_pkey PRIMARY KEY (id);


--
-- Name: transaction_logs transaction_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_logs
    ADD CONSTRAINT transaction_logs_pkey PRIMARY KEY (id);


--
-- Name: user_achievements user_achievements_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_pkey PRIMARY KEY (id);


--
-- Name: user_analytics user_analytics_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_pkey PRIMARY KEY (id);


--
-- Name: user_daily_challenges user_daily_challenges_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_daily_challenges
    ADD CONSTRAINT user_daily_challenges_pkey PRIMARY KEY (id);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_uid_key; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_uid_key UNIQUE (uid);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: wallet_fingerprints wallet_fingerprints_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wallet_fingerprints
    ADD CONSTRAINT wallet_fingerprints_pkey PRIMARY KEY (id);


--
-- Name: withdrawals withdrawals_pkey; Type: CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_pkey PRIMARY KEY (id);


--
-- Name: abuse_detections abuse_detections_reviewed_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.abuse_detections
    ADD CONSTRAINT abuse_detections_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users(id);


--
-- Name: admin_logs admin_logs_admin_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.admin_logs
    ADD CONSTRAINT admin_logs_admin_id_fkey FOREIGN KEY (admin_id) REFERENCES public.users(id);


--
-- Name: banners banners_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.banners
    ADD CONSTRAINT banners_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: battle_comments battle_comments_battle_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.battle_comments
    ADD CONSTRAINT battle_comments_battle_id_fkey FOREIGN KEY (battle_id) REFERENCES public.prediction_battles(id);


--
-- Name: battle_comments battle_comments_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.battle_comments
    ADD CONSTRAINT battle_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: events events_created_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.events
    ADD CONSTRAINT events_created_by_fkey FOREIGN KEY (created_by) REFERENCES public.users(id);


--
-- Name: prediction_battles prediction_battles_challenged_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prediction_battles
    ADD CONSTRAINT prediction_battles_challenged_id_fkey FOREIGN KEY (challenged_id) REFERENCES public.users(id);


--
-- Name: prediction_battles prediction_battles_challenger_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prediction_battles
    ADD CONSTRAINT prediction_battles_challenger_id_fkey FOREIGN KEY (challenger_id) REFERENCES public.users(id);


--
-- Name: prediction_battles prediction_battles_winner_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.prediction_battles
    ADD CONSTRAINT prediction_battles_winner_id_fkey FOREIGN KEY (winner_id) REFERENCES public.users(id);


--
-- Name: predictions predictions_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.predictions
    ADD CONSTRAINT predictions_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: purchases purchases_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.purchases
    ADD CONSTRAINT purchases_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referred_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referred_id_fkey FOREIGN KEY (referred_id) REFERENCES public.users(id);


--
-- Name: referrals referrals_referrer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.referrals
    ADD CONSTRAINT referrals_referrer_id_fkey FOREIGN KEY (referrer_id) REFERENCES public.users(id);


--
-- Name: rewards rewards_prediction_id_predictions_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_prediction_id_predictions_id_fk FOREIGN KEY (prediction_id) REFERENCES public.predictions(id);


--
-- Name: rewards rewards_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.rewards
    ADD CONSTRAINT rewards_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: security_events security_events_resolved_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_resolved_by_fkey FOREIGN KEY (resolved_by) REFERENCES public.users(id);


--
-- Name: security_events security_events_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.security_events
    ADD CONSTRAINT security_events_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: system_settings system_settings_updated_by_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.system_settings
    ADD CONSTRAINT system_settings_updated_by_fkey FOREIGN KEY (updated_by) REFERENCES public.users(id);


--
-- Name: transaction_logs transaction_logs_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.transaction_logs
    ADD CONSTRAINT transaction_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_achievements user_achievements_achievement_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_achievement_id_fkey FOREIGN KEY (achievement_id) REFERENCES public.achievements(id);


--
-- Name: user_achievements user_achievements_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_achievements
    ADD CONSTRAINT user_achievements_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_analytics user_analytics_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_analytics
    ADD CONSTRAINT user_analytics_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: user_daily_challenges user_daily_challenges_challenge_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_daily_challenges
    ADD CONSTRAINT user_daily_challenges_challenge_id_fkey FOREIGN KEY (challenge_id) REFERENCES public.daily_challenges(id);


--
-- Name: user_daily_challenges user_daily_challenges_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.user_daily_challenges
    ADD CONSTRAINT user_daily_challenges_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: wallet_fingerprints wallet_fingerprints_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.wallet_fingerprints
    ADD CONSTRAINT wallet_fingerprints_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: withdrawals withdrawals_user_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: neondb_owner
--

ALTER TABLE ONLY public.withdrawals
    ADD CONSTRAINT withdrawals_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: DEFAULT PRIVILEGES FOR SEQUENCES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON SEQUENCES TO neon_superuser WITH GRANT OPTION;


--
-- Name: DEFAULT PRIVILEGES FOR TABLES; Type: DEFAULT ACL; Schema: public; Owner: cloud_admin
--

ALTER DEFAULT PRIVILEGES FOR ROLE cloud_admin IN SCHEMA public GRANT ALL ON TABLES TO neon_superuser WITH GRANT OPTION;


--
-- PostgreSQL database dump complete
--

