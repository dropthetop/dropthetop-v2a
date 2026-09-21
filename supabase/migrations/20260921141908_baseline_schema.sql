


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


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."app_role" AS ENUM (
    'admin',
    'seller',
    'buyer'
);


ALTER TYPE "public"."app_role" OWNER TO "postgres";


CREATE TYPE "public"."listing_status" AS ENUM (
    'pending_new',
    'pending_edited',
    'approved',
    'rejected',
    'expired'
);


ALTER TYPE "public"."listing_status" OWNER TO "postgres";


CREATE TYPE "public"."offer_status" AS ENUM (
    'pending',
    'accepted',
    'rejected',
    'countered'
);


ALTER TYPE "public"."offer_status" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."can_access_message_thread"("check_thread_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.messages
    WHERE id = check_thread_id
    AND (sender_id = auth.uid() OR recipient_id = auth.uid())
  );
$$;


ALTER FUNCTION "public"."can_access_message_thread"("check_thread_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."claim_managed_profile"("profile_email" "text") RETURNS boolean
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_managed_profile managed_profiles%ROWTYPE;
  v_user_email TEXT;
BEGIN
  -- Get the authenticated user's email
  SELECT email INTO v_user_email
  FROM auth.users
  WHERE id = auth.uid();

  -- Verify email matches
  IF LOWER(v_user_email) != LOWER(profile_email) THEN
    RAISE EXCEPTION 'Email does not match your account';
  END IF;

  -- Find unclaimed managed profile
  SELECT * INTO v_managed_profile
  FROM managed_profiles
  WHERE LOWER(email) = LOWER(profile_email)
    AND claimed_by IS NULL;

  IF v_managed_profile.id IS NULL THEN
    RAISE EXCEPTION 'No unclaimed profile found for this email';
  END IF;

  -- Update user's profile with managed profile data
  UPDATE profiles SET
    first_name = COALESCE(v_managed_profile.first_name, first_name),
    last_name = COALESCE(v_managed_profile.last_name, last_name),
    phone = COALESCE(v_managed_profile.phone, phone),
    contact_email = COALESCE(v_managed_profile.contact_email, contact_email),
    avatar_url = COALESCE(v_managed_profile.avatar_url, avatar_url),
    bio = COALESCE(v_managed_profile.bio, bio),
    location_city = COALESCE(v_managed_profile.location_city, location_city),
    location_state = COALESCE(v_managed_profile.location_state, location_state),
    address = COALESCE(v_managed_profile.address, address),
    zip_code = COALESCE(v_managed_profile.zip_code, zip_code),
    website = COALESCE(v_managed_profile.website, website),
    is_dealer = v_managed_profile.is_dealer,
    dealer_name = COALESCE(v_managed_profile.dealer_name, dealer_name),
    updated_at = now()
  WHERE id = auth.uid();

  -- Transfer all listings from managed_profile to user
  UPDATE listings SET
    seller_id = auth.uid(),
    managed_profile_id = NULL,
    updated_at = now()
  WHERE managed_profile_id = v_managed_profile.id;

  -- Mark managed profile as claimed
  UPDATE managed_profiles SET
    claimed_by = auth.uid(),
    claimed_at = now(),
    updated_at = now()
  WHERE id = v_managed_profile.id;

  RETURN true;
END;
$$;


ALTER FUNCTION "public"."claim_managed_profile"("profile_email" "text") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."cleanup_abandoned_sessions"() RETURNS "void"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  timeout_minutes integer;
BEGIN
  -- Get timeout from system_config, default to 30 minutes if not found
  SELECT COALESCE(value::integer, 30) INTO timeout_minutes
  FROM public.system_config
  WHERE key = 'session_inactive_timeout_minutes';
  
  -- Fallback to 30 if not found
  IF timeout_minutes IS NULL THEN
    timeout_minutes := 30;
  END IF;

  UPDATE public.user_sessions
  SET 
    is_active = false,
    logout_at = last_active_at,
    duration_minutes = EXTRACT(EPOCH FROM (last_active_at - login_at)) / 60
  WHERE is_active = true 
    AND last_active_at < now() - (timeout_minutes || ' minutes')::interval;
END;
$$;


ALTER FUNCTION "public"."cleanup_abandoned_sessions"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."create_listing_snapshot"("p_listing_id" "uuid", "p_title" "text", "p_description" "text", "p_price" numeric, "p_year" integer, "p_generation" "text", "p_mileage" integer, "p_transmission" "text", "p_condition" "text", "p_engine" "text", "p_exterior_color" "text", "p_interior_color" "text", "p_location_city" "text", "p_location_state" "text", "p_location_zip" "text", "p_vin" "text", "p_video_url" "text", "p_listing_type" "text", "p_negotiable" boolean, "p_model" "text", "p_body_style" "text", "p_used_type" "text", "p_vehicle_condition" "text", "p_image_urls" "text"[]) RETURNS "uuid"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
DECLARE
  v_snapshot_id UUID;
  v_seller_id UUID;
BEGIN
  -- Verify the caller owns this listing
  SELECT seller_id INTO v_seller_id
  FROM listings
  WHERE id = p_listing_id;
  
  IF v_seller_id IS NULL THEN
    RAISE EXCEPTION 'Listing not found';
  END IF;
  
  IF v_seller_id != auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to create snapshot for this listing';
  END IF;
  
  -- Check if snapshot already exists
  SELECT id INTO v_snapshot_id
  FROM listing_snapshots
  WHERE listing_id = p_listing_id;
  
  IF v_snapshot_id IS NOT NULL THEN
    -- Snapshot already exists, return existing ID
    RETURN v_snapshot_id;
  END IF;
  
  -- Insert the snapshot
  INSERT INTO listing_snapshots (
    listing_id, title, description, price, year, generation,
    mileage, transmission, condition, engine, exterior_color,
    interior_color, location_city, location_state, location_zip,
    vin, video_url, listing_type, negotiable,
    model, body_style, used_type, vehicle_condition, image_urls
  ) VALUES (
    p_listing_id, p_title, p_description, p_price, p_year, p_generation,
    p_mileage, p_transmission, p_condition, p_engine, p_exterior_color,
    p_interior_color, p_location_city, p_location_state, p_location_zip,
    p_vin, p_video_url, p_listing_type, p_negotiable,
    p_model, p_body_style, p_used_type, p_vehicle_condition, p_image_urls
  )
  RETURNING id INTO v_snapshot_id;
  
  RETURN v_snapshot_id;
END;
$$;


ALTER FUNCTION "public"."create_listing_snapshot"("p_listing_id" "uuid", "p_title" "text", "p_description" "text", "p_price" numeric, "p_year" integer, "p_generation" "text", "p_mileage" integer, "p_transmission" "text", "p_condition" "text", "p_engine" "text", "p_exterior_color" "text", "p_interior_color" "text", "p_location_city" "text", "p_location_state" "text", "p_location_zip" "text", "p_vin" "text", "p_video_url" "text", "p_listing_type" "text", "p_negotiable" boolean, "p_model" "text", "p_body_style" "text", "p_used_type" "text", "p_vehicle_condition" "text", "p_image_urls" "text"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."generate_stock_number"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF NEW.stock_number IS NULL THEN
    NEW.stock_number := nextval('listing_stock_number_seq');
  END IF;
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."generate_stock_number"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_public_profile"("profile_id" "uuid") RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "avatar_url" "text", "bio" "text", "location" "text", "is_dealer" boolean, "is_active" boolean, "dealer_name" "text", "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "website" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.bio,
    p.location,
    p.is_dealer,
    p.is_active,
    p.dealer_name,
    p.created_at,
    p.updated_at,
    p.website
  FROM public.profiles p
  WHERE p.id = profile_id;
$$;


ALTER FUNCTION "public"."get_public_profile"("profile_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_safe_profile"("profile_id" "uuid") RETURNS TABLE("id" "uuid", "first_name" "text", "last_name" "text", "phone" "text", "contact_email" "text", "avatar_url" "text", "bio" "text", "location" "text", "location_city" "text", "location_state" "text", "address" "text", "zip_code" "text", "website" "text", "is_dealer" boolean, "dealer_name" "text", "is_active" boolean, "created_at" timestamp with time zone, "updated_at" timestamp with time zone, "total_logins" integer, "last_login_at" timestamp with time zone, "total_session_minutes" integer)
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT 
    p.id,
    p.first_name,
    p.last_name,
    p.phone,
    p.contact_email,
    p.avatar_url,
    p.bio,
    p.location,
    p.location_city,
    p.location_state,
    p.address,
    p.zip_code,
    p.website,
    p.is_dealer,
    p.dealer_name,
    p.is_active,
    p.created_at,
    p.updated_at,
    p.total_logins,
    p.last_login_at,
    p.total_session_minutes
  FROM public.profiles p
  WHERE p.id = profile_id
    AND (p.id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));
$$;


ALTER FUNCTION "public"."get_safe_profile"("profile_id" "uuid") OWNER TO "postgres";


COMMENT ON FUNCTION "public"."get_safe_profile"("profile_id" "uuid") IS 'Returns profile data excluding sensitive verification fields. Use this instead of direct SELECT on profiles table.';



CREATE OR REPLACE FUNCTION "public"."get_user_auth_emails"() RETURNS TABLE("user_id" "uuid", "email" "text")
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT au.id as user_id, au.email
  FROM auth.users au
  WHERE public.has_role(auth.uid(), 'admin'::app_role)
$$;


ALTER FUNCTION "public"."get_user_auth_emails"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.profiles (id, contact_email)
  VALUES (
    NEW.id,
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;

  -- Assign default buyer role to all new users
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'buyer');

  -- Auto-grant admin role to the designated admin email
  IF NEW.email = 'theemsoth@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin')
    ON CONFLICT DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;


ALTER FUNCTION "public"."has_role"("_user_id" "uuid", "_role" "public"."app_role") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."is_seller_active"("_seller_id" "uuid") RETURNS boolean
    LANGUAGE "sql" STABLE SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
  SELECT COALESCE(
    (SELECT is_active FROM public.profiles WHERE id = _seller_id),
    true
  )
$$;


ALTER FUNCTION "public"."is_seller_active"("_seller_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."log_listing_changes"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  INSERT INTO public.listing_history (listing_id, status, rejection_reason, changed_by)
  VALUES (NEW.id, NEW.status, NEW.rejection_reason, auth.uid());
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."log_listing_changes"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_dealer_info_on_listing"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- For regular listings, get dealer info from profiles
  IF (NEW.is_external_listing IS NOT TRUE OR NEW.is_external_listing IS NULL) AND NEW.seller_id IS NOT NULL THEN
    SELECT p.is_dealer, p.dealer_name INTO NEW.is_dealer, NEW.dealer_name
    FROM profiles p WHERE p.id = NEW.seller_id;
  END IF;
  
  -- For external listings, get dealer name from managed_profiles
  IF NEW.is_external_listing = TRUE AND NEW.managed_profile_id IS NOT NULL THEN
    SELECT mp.dealer_name INTO NEW.dealer_name
    FROM managed_profiles mp WHERE mp.id = NEW.managed_profile_id;
    NEW.is_dealer := true;
  END IF;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_dealer_info_on_listing"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_dealer_info_on_managed_profile_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Update all external listings for this managed profile
  UPDATE listings
  SET dealer_name = NEW.dealer_name
  WHERE managed_profile_id = NEW.id 
  AND is_external_listing = TRUE;
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_dealer_info_on_managed_profile_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."sync_dealer_info_on_profile_update"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  -- Update all listings for this seller
  UPDATE listings
  SET is_dealer = NEW.is_dealer, dealer_name = NEW.dealer_name
  WHERE seller_id = NEW.id 
  AND (is_external_listing IS NOT TRUE OR is_external_listing IS NULL);
  
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."sync_dealer_info_on_profile_update"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_forum_post_comment_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET comment_count = comment_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET comment_count = comment_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_forum_post_comment_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_forum_post_vote_count"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    SET "search_path" TO 'public'
    AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE forum_posts SET vote_count = vote_count + NEW.value WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE forum_posts SET vote_count = vote_count - OLD.value WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$;


ALTER FUNCTION "public"."update_forum_post_vote_count"() OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    SET "search_path" TO 'public'
    AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."body_styles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."body_styles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."conditions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."conditions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."corvette_models" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "generation" "text" NOT NULL,
    "model_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."corvette_models" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."corvette_sales" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "year" integer NOT NULL,
    "generation" "text" NOT NULL,
    "sale_price" numeric NOT NULL,
    "sale_date" "date" NOT NULL,
    "source_url" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "title" "text",
    "mileage" integer,
    "transmission" "text",
    "exterior_color" "text",
    "image_url" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."corvette_sales" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."email_templates" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "type" "text" NOT NULL,
    "subject" "text" NOT NULL,
    "html_template" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."email_templates" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."external_link_clicks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "listing_id" "uuid",
    "listing_title" "text" NOT NULL,
    "dealer_name" "text" NOT NULL,
    "external_url" "text" NOT NULL,
    "was_authenticated" boolean DEFAULT false NOT NULL,
    "user_id" "uuid",
    "username" "text",
    "session_id" "text",
    "action_taken" "text",
    "signup_completed" boolean DEFAULT false,
    "signup_user_id" "uuid",
    "signup_username" "text",
    "completed_at" timestamp with time zone,
    CONSTRAINT "external_link_clicks_action_taken_check" CHECK (("action_taken" = ANY (ARRAY['direct'::"text", 'skip'::"text", 'signup'::"text"])))
);

ALTER TABLE ONLY "public"."external_link_clicks" REPLICA IDENTITY FULL;


ALTER TABLE "public"."external_link_clicks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."favorites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."favorites" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."fetched_external_urls" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "url" "text" NOT NULL,
    "managed_profile_id" "uuid" NOT NULL,
    "fetched_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "exists_in_system" boolean DEFAULT false NOT NULL,
    "listing_id" "uuid",
    "processed_at" timestamp with time zone,
    "process_status" "text",
    "process_error" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."fetched_external_urls" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_bookmarks" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "post_id" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."forum_bookmarks" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_comments" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "author_id" "uuid" NOT NULL,
    "parent_comment_id" "uuid",
    "content" "text" NOT NULL,
    "is_hidden" boolean DEFAULT false NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."forum_comments" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."forum_posts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "author_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "content" "text" NOT NULL,
    "generation" "text",
    "slug" "text" NOT NULL,
    "is_pinned" boolean DEFAULT false NOT NULL,
    "is_hidden" boolean DEFAULT false NOT NULL,
    "comment_count" integer DEFAULT 0 NOT NULL,
    "vote_count" integer DEFAULT 0 NOT NULL,
    "views_count" integer DEFAULT 0 NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_urls" "text"[]
);


ALTER TABLE "public"."forum_posts" OWNER TO "postgres";


COMMENT ON COLUMN "public"."forum_posts"."image_urls" IS 'Array of image URLs attached to the post';



CREATE TABLE IF NOT EXISTS "public"."forum_votes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "post_id" "uuid" NOT NULL,
    "user_id" "uuid" NOT NULL,
    "value" integer NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "forum_votes_value_check" CHECK (("value" = ANY (ARRAY[1, '-1'::integer])))
);


ALTER TABLE "public"."forum_votes" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generation_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "generation_id" "text" NOT NULL,
    "image_url" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "is_hero" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_type" "text" DEFAULT 'detail'::"text",
    CONSTRAINT "generation_images_image_type_check" CHECK (("image_type" = ANY (ARRAY['detail'::"text", 'thumbnail'::"text", 'history-card'::"text"])))
);


ALTER TABLE "public"."generation_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."generations" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."generations" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."launch_emails" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."launch_emails" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_history" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "changed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "status" "public"."listing_status",
    "rejection_reason" "text",
    "changed_by" "uuid"
);


ALTER TABLE "public"."listing_history" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_images" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "image_url" "text" NOT NULL,
    "is_primary" boolean DEFAULT false,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."listing_images" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_snapshots" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "title" "text" NOT NULL,
    "description" "text",
    "price" numeric NOT NULL,
    "year" integer NOT NULL,
    "generation" "text" NOT NULL,
    "mileage" integer,
    "transmission" "text",
    "condition" "text",
    "engine" "text",
    "exterior_color" "text",
    "interior_color" "text",
    "location_city" "text",
    "location_state" "text",
    "location_zip" "text",
    "vin" "text",
    "video_url" "text",
    "listing_type" "text",
    "negotiable" boolean,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "image_urls" "text"[] DEFAULT '{}'::"text"[],
    "used_type" "text",
    "model" "text",
    "body_style" "text",
    "vehicle_condition" "text",
    "is_external_listing" boolean DEFAULT false,
    "external_url" "text",
    "external_image_url" "text"
);


ALTER TABLE "public"."listing_snapshots" OWNER TO "postgres";


CREATE SEQUENCE IF NOT EXISTS "public"."listing_stock_number_seq"
    START WITH 10000
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."listing_stock_number_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."listing_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listing_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "viewer_id" "uuid",
    "session_id" "text",
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visitor_fingerprint" "text"
);


ALTER TABLE "public"."listing_views" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."listings" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "seller_id" "uuid",
    "title" "text" NOT NULL,
    "description" "text",
    "year" integer NOT NULL,
    "generation" "text" NOT NULL,
    "vin" "text",
    "mileage" integer,
    "exterior_color" "text",
    "interior_color" "text",
    "transmission" "text",
    "engine" "text",
    "price" numeric(12,2) NOT NULL,
    "negotiable" boolean DEFAULT true,
    "condition" "text",
    "status" "public"."listing_status" DEFAULT 'pending_new'::"public"."listing_status",
    "location_city" "text",
    "location_state" "text",
    "location_zip" "text",
    "featured" boolean DEFAULT false,
    "views_count" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "listing_type" "text",
    "is_sold" boolean DEFAULT false,
    "rejection_reason" "text",
    "video_url" "text",
    "expiration_date" timestamp with time zone,
    "stock_number" integer,
    "vehicle_condition" "text" NOT NULL,
    "used_type" "text",
    "model" "text",
    "body_style" "text",
    "start_date" timestamp with time zone,
    "managed_profile_id" "uuid",
    "is_external_listing" boolean DEFAULT false,
    "external_url" "text",
    "external_image_url" "text",
    "is_dealer" boolean DEFAULT false,
    "dealer_name" "text",
    "is_bid_to" boolean DEFAULT false,
    CONSTRAINT "listing_seller_check" CHECK ((("seller_id" IS NOT NULL) OR ("managed_profile_id" IS NOT NULL))),
    CONSTRAINT "listings_mileage_check" CHECK (("mileage" >= 0)),
    CONSTRAINT "listings_price_check" CHECK (("price" > (0)::numeric)),
    CONSTRAINT "listings_year_check" CHECK ((("year" >= 1953) AND ("year" <= 2030)))
);


ALTER TABLE "public"."listings" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."managed_profiles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "first_name" "text",
    "last_name" "text",
    "email" "text" NOT NULL,
    "phone" "text",
    "contact_email" "text",
    "avatar_url" "text",
    "bio" "text",
    "is_dealer" boolean DEFAULT false,
    "dealer_name" "text",
    "claimed_by" "uuid",
    "claimed_at" timestamp with time zone,
    "created_by" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "location_city" "text",
    "location_state" "text",
    "address" "text",
    "zip_code" "text",
    "website" "text",
    "fetch_all_images" boolean DEFAULT true,
    "fetch_url" "text",
    "is_auction" boolean DEFAULT false
);


ALTER TABLE "public"."managed_profiles" OWNER TO "postgres";


COMMENT ON COLUMN "public"."managed_profiles"."fetch_all_images" IS 'When true, fetch up to 10 images from external listings. When false, only use the primary image.';



CREATE TABLE IF NOT EXISTS "public"."messages" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid",
    "sender_id" "uuid" NOT NULL,
    "recipient_id" "uuid" NOT NULL,
    "content" "text" NOT NULL,
    "read_at" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."messages" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_article_views" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "article_id" "uuid" NOT NULL,
    "viewer_id" "uuid",
    "session_id" "text",
    "viewed_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "visitor_fingerprint" "text"
);


ALTER TABLE "public"."news_article_views" OWNER TO "postgres";


COMMENT ON TABLE "public"."news_article_views" IS 'Stores view tracking for news articles. Inserts are done via edge function using service role key.';



CREATE TABLE IF NOT EXISTS "public"."news_articles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "source_url" "text" NOT NULL,
    "source_name" "text" NOT NULL,
    "title" "text" NOT NULL,
    "summary" "text",
    "image_url" "text",
    "published_at" timestamp with time zone,
    "scraped_at" timestamp with time zone DEFAULT "now"(),
    "generation" "text",
    "tags" "text"[],
    "is_featured" boolean DEFAULT false,
    "is_active" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."news_articles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."news_sources" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "name" "text" NOT NULL,
    "url" "text" NOT NULL,
    "scrape_pattern" "text",
    "is_active" boolean DEFAULT true,
    "last_scraped_at" timestamp with time zone,
    "scrape_frequency_hours" integer DEFAULT 6,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."news_sources" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."offers" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "listing_id" "uuid" NOT NULL,
    "buyer_id" "uuid" NOT NULL,
    "amount" numeric(12,2) NOT NULL,
    "message" "text",
    "status" "public"."offer_status" DEFAULT 'pending'::"public"."offer_status",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "rejection_reason" "text",
    "approval_message" "text",
    CONSTRAINT "offers_amount_check" CHECK (("amount" > (0)::numeric))
);


ALTER TABLE "public"."offers" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "phone" "text",
    "avatar_url" "text",
    "bio" "text",
    "location" "text",
    "is_dealer" boolean DEFAULT false,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "first_name" "text",
    "last_name" "text",
    "is_active" boolean DEFAULT true,
    "contact_email" "text",
    "total_logins" integer DEFAULT 0,
    "last_login_at" timestamp with time zone,
    "total_session_minutes" integer DEFAULT 0,
    "dealer_name" "text",
    "verification_code" "text",
    "verification_code_expires_at" timestamp with time zone,
    "verification_attempts" integer DEFAULT 0,
    "address" "text",
    "zip_code" "text",
    "location_city" "text",
    "location_state" "text",
    "website" "text"
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


CREATE OR REPLACE VIEW "public"."public_profiles" WITH ("security_invoker"='true') AS
 SELECT "id",
    "first_name",
    "last_name",
    "avatar_url",
    "bio",
    "location",
    "is_dealer",
    "is_active",
    "dealer_name",
    "created_at",
    "updated_at"
   FROM "public"."profiles" "p";


ALTER VIEW "public"."public_profiles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."saved_prompts" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "prompt" "text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."saved_prompts" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."system_config" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "key" "text" NOT NULL,
    "value" "text" NOT NULL,
    "description" "text",
    "data_type" "text" DEFAULT 'string'::"text" NOT NULL,
    "category" "text" DEFAULT 'general'::"text" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."system_config" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."transmissions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."transmissions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."used_types" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."used_types" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_roles" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "role" "public"."app_role" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."user_roles" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."user_sessions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "login_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "logout_at" timestamp with time zone,
    "last_active_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "user_agent" "text",
    "is_active" boolean DEFAULT true,
    "duration_minutes" integer,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."user_sessions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."vehicle_conditions" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "value" "text" NOT NULL,
    "display_name" "text" NOT NULL,
    "display_order" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."vehicle_conditions" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."view_tracking_daily_stats" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "date" "date" NOT NULL,
    "view_type" "text" NOT NULL,
    "fingerprint_tracked" integer DEFAULT 0,
    "fingerprint_blocked" integer DEFAULT 0,
    "session_tracked" integer DEFAULT 0,
    "session_blocked" integer DEFAULT 0,
    "member_tracked" integer DEFAULT 0,
    "member_blocked" integer DEFAULT 0,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "view_tracking_daily_stats_view_type_check" CHECK (("view_type" = ANY (ARRAY['listing'::"text", 'news'::"text"])))
);


ALTER TABLE "public"."view_tracking_daily_stats" OWNER TO "postgres";


ALTER TABLE ONLY "public"."body_styles"
    ADD CONSTRAINT "body_styles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."body_styles"
    ADD CONSTRAINT "body_styles_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."conditions"
    ADD CONSTRAINT "conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."conditions"
    ADD CONSTRAINT "conditions_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."corvette_models"
    ADD CONSTRAINT "corvette_models_generation_model_name_key" UNIQUE ("generation", "model_name");



ALTER TABLE ONLY "public"."corvette_models"
    ADD CONSTRAINT "corvette_models_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."corvette_sales"
    ADD CONSTRAINT "corvette_sales_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."corvette_sales"
    ADD CONSTRAINT "corvette_sales_source_url_key" UNIQUE ("source_url");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."email_templates"
    ADD CONSTRAINT "email_templates_type_key" UNIQUE ("type");



ALTER TABLE ONLY "public"."external_link_clicks"
    ADD CONSTRAINT "external_link_clicks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_listing_id_key" UNIQUE ("user_id", "listing_id");



ALTER TABLE ONLY "public"."fetched_external_urls"
    ADD CONSTRAINT "fetched_external_urls_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."fetched_external_urls"
    ADD CONSTRAINT "fetched_external_urls_url_managed_profile_id_key" UNIQUE ("url", "managed_profile_id");



ALTER TABLE ONLY "public"."forum_bookmarks"
    ADD CONSTRAINT "forum_bookmarks_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_bookmarks"
    ADD CONSTRAINT "forum_bookmarks_user_id_post_id_key" UNIQUE ("user_id", "post_id");



ALTER TABLE ONLY "public"."forum_comments"
    ADD CONSTRAINT "forum_comments_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_votes"
    ADD CONSTRAINT "forum_votes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."forum_votes"
    ADD CONSTRAINT "forum_votes_post_id_user_id_key" UNIQUE ("post_id", "user_id");



ALTER TABLE ONLY "public"."generation_images"
    ADD CONSTRAINT "generation_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generations"
    ADD CONSTRAINT "generations_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."generations"
    ADD CONSTRAINT "generations_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."launch_emails"
    ADD CONSTRAINT "launch_emails_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."launch_emails"
    ADD CONSTRAINT "launch_emails_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_history"
    ADD CONSTRAINT "listing_history_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_snapshots"
    ADD CONSTRAINT "listing_snapshots_listing_id_key" UNIQUE ("listing_id");



ALTER TABLE ONLY "public"."listing_snapshots"
    ADD CONSTRAINT "listing_snapshots_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_types"
    ADD CONSTRAINT "listing_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listing_types"
    ADD CONSTRAINT "listing_types_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."listing_views"
    ADD CONSTRAINT "listing_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."managed_profiles"
    ADD CONSTRAINT "managed_profiles_email_key" UNIQUE ("email");



ALTER TABLE ONLY "public"."managed_profiles"
    ADD CONSTRAINT "managed_profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_article_views"
    ADD CONSTRAINT "news_article_views_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_articles"
    ADD CONSTRAINT "news_articles_source_url_key" UNIQUE ("source_url");



ALTER TABLE ONLY "public"."news_sources"
    ADD CONSTRAINT "news_sources_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."news_sources"
    ADD CONSTRAINT "news_sources_url_key" UNIQUE ("url");



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."saved_prompts"
    ADD CONSTRAINT "saved_prompts_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_key_key" UNIQUE ("key");



ALTER TABLE ONLY "public"."system_config"
    ADD CONSTRAINT "system_config_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transmissions"
    ADD CONSTRAINT "transmissions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."transmissions"
    ADD CONSTRAINT "transmissions_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."used_types"
    ADD CONSTRAINT "used_types_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."used_types"
    ADD CONSTRAINT "used_types_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_role_key" UNIQUE ("user_id", "role");



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_conditions"
    ADD CONSTRAINT "vehicle_conditions_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."vehicle_conditions"
    ADD CONSTRAINT "vehicle_conditions_value_key" UNIQUE ("value");



ALTER TABLE ONLY "public"."view_tracking_daily_stats"
    ADD CONSTRAINT "view_tracking_daily_stats_date_view_type_key" UNIQUE ("date", "view_type");



ALTER TABLE ONLY "public"."view_tracking_daily_stats"
    ADD CONSTRAINT "view_tracking_daily_stats_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_corvette_sales_generation" ON "public"."corvette_sales" USING "btree" ("generation");



CREATE INDEX "idx_corvette_sales_sale_date" ON "public"."corvette_sales" USING "btree" ("sale_date");



CREATE INDEX "idx_corvette_sales_year" ON "public"."corvette_sales" USING "btree" ("year");



CREATE INDEX "idx_external_link_clicks_action" ON "public"."external_link_clicks" USING "btree" ("action_taken");



CREATE INDEX "idx_external_link_clicks_created_at" ON "public"."external_link_clicks" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_external_link_clicks_dealer" ON "public"."external_link_clicks" USING "btree" ("dealer_name");



CREATE INDEX "idx_favorites_listing" ON "public"."favorites" USING "btree" ("listing_id");



CREATE INDEX "idx_favorites_user" ON "public"."favorites" USING "btree" ("user_id");



CREATE INDEX "idx_fetched_urls_fetched_at" ON "public"."fetched_external_urls" USING "btree" ("fetched_at" DESC);



CREATE INDEX "idx_fetched_urls_profile" ON "public"."fetched_external_urls" USING "btree" ("managed_profile_id");



CREATE INDEX "idx_fetched_urls_status" ON "public"."fetched_external_urls" USING "btree" ("process_status");



CREATE INDEX "idx_forum_bookmarks_post_id" ON "public"."forum_bookmarks" USING "btree" ("post_id");



CREATE INDEX "idx_forum_bookmarks_user_id" ON "public"."forum_bookmarks" USING "btree" ("user_id");



CREATE INDEX "idx_forum_comments_author" ON "public"."forum_comments" USING "btree" ("author_id");



CREATE INDEX "idx_forum_comments_post" ON "public"."forum_comments" USING "btree" ("post_id");



CREATE INDEX "idx_forum_posts_author" ON "public"."forum_posts" USING "btree" ("author_id");



CREATE INDEX "idx_forum_posts_created_at" ON "public"."forum_posts" USING "btree" ("created_at" DESC);



CREATE INDEX "idx_forum_posts_generation" ON "public"."forum_posts" USING "btree" ("generation");



CREATE INDEX "idx_forum_posts_slug" ON "public"."forum_posts" USING "btree" ("slug");



CREATE INDEX "idx_forum_votes_post" ON "public"."forum_votes" USING "btree" ("post_id");



CREATE INDEX "idx_forum_votes_user" ON "public"."forum_votes" USING "btree" ("user_id");



CREATE INDEX "idx_generation_images_generation_id" ON "public"."generation_images" USING "btree" ("generation_id");



CREATE INDEX "idx_generation_images_type" ON "public"."generation_images" USING "btree" ("generation_id", "image_type");



CREATE INDEX "idx_listing_images_listing" ON "public"."listing_images" USING "btree" ("listing_id");



CREATE INDEX "idx_listing_snapshots_listing_id" ON "public"."listing_snapshots" USING "btree" ("listing_id");



CREATE INDEX "idx_listing_views_dedup" ON "public"."listing_views" USING "btree" ("listing_id", "viewer_id", "session_id", "viewed_at");



CREATE INDEX "idx_listing_views_fingerprint" ON "public"."listing_views" USING "btree" ("visitor_fingerprint");



CREATE INDEX "idx_listing_views_listing_id" ON "public"."listing_views" USING "btree" ("listing_id");



CREATE INDEX "idx_listing_views_viewed_at" ON "public"."listing_views" USING "btree" ("viewed_at");



CREATE INDEX "idx_listing_views_viewer_id" ON "public"."listing_views" USING "btree" ("viewer_id");



CREATE INDEX "idx_listings_generation" ON "public"."listings" USING "btree" ("generation");



CREATE INDEX "idx_listings_price" ON "public"."listings" USING "btree" ("price");



CREATE INDEX "idx_listings_seller" ON "public"."listings" USING "btree" ("seller_id");



CREATE INDEX "idx_listings_status" ON "public"."listings" USING "btree" ("status");



CREATE INDEX "idx_listings_year" ON "public"."listings" USING "btree" ("year");



CREATE INDEX "idx_messages_listing" ON "public"."messages" USING "btree" ("listing_id");



CREATE INDEX "idx_messages_recipient" ON "public"."messages" USING "btree" ("recipient_id");



CREATE INDEX "idx_messages_sender" ON "public"."messages" USING "btree" ("sender_id");



CREATE INDEX "idx_news_article_views_article_id" ON "public"."news_article_views" USING "btree" ("article_id");



CREATE INDEX "idx_news_article_views_fingerprint" ON "public"."news_article_views" USING "btree" ("visitor_fingerprint");



CREATE INDEX "idx_news_article_views_viewed_at" ON "public"."news_article_views" USING "btree" ("viewed_at");



CREATE INDEX "idx_news_article_views_viewer_id" ON "public"."news_article_views" USING "btree" ("viewer_id");



CREATE INDEX "idx_news_articles_generation" ON "public"."news_articles" USING "btree" ("generation");



CREATE INDEX "idx_news_articles_is_featured" ON "public"."news_articles" USING "btree" ("is_featured") WHERE ("is_featured" = true);



CREATE INDEX "idx_news_articles_published_at" ON "public"."news_articles" USING "btree" ("published_at" DESC);



CREATE INDEX "idx_offers_buyer" ON "public"."offers" USING "btree" ("buyer_id");



CREATE INDEX "idx_offers_listing" ON "public"."offers" USING "btree" ("listing_id");



CREATE INDEX "idx_user_sessions_is_active" ON "public"."user_sessions" USING "btree" ("is_active");



CREATE INDEX "idx_user_sessions_login_at" ON "public"."user_sessions" USING "btree" ("login_at" DESC);



CREATE INDEX "idx_user_sessions_user_id" ON "public"."user_sessions" USING "btree" ("user_id");



CREATE INDEX "idx_view_tracking_stats_date" ON "public"."view_tracking_daily_stats" USING "btree" ("date" DESC);



CREATE OR REPLACE TRIGGER "on_listing_update" AFTER INSERT OR UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."log_listing_changes"();



CREATE OR REPLACE TRIGGER "set_listing_stock_number" BEFORE INSERT ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."generate_stock_number"();



CREATE OR REPLACE TRIGGER "sync_dealer_info_before_insert" BEFORE INSERT ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."sync_dealer_info_on_listing"();



CREATE OR REPLACE TRIGGER "sync_listings_on_managed_profile_update" AFTER UPDATE OF "dealer_name" ON "public"."managed_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_dealer_info_on_managed_profile_update"();



CREATE OR REPLACE TRIGGER "sync_listings_on_profile_update" AFTER UPDATE OF "is_dealer", "dealer_name" ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."sync_dealer_info_on_profile_update"();



CREATE OR REPLACE TRIGGER "update_comment_count" AFTER INSERT OR DELETE ON "public"."forum_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_forum_post_comment_count"();



CREATE OR REPLACE TRIGGER "update_corvette_models_updated_at" BEFORE UPDATE ON "public"."corvette_models" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_corvette_sales_updated_at" BEFORE UPDATE ON "public"."corvette_sales" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_email_templates_updated_at" BEFORE UPDATE ON "public"."email_templates" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_fetched_external_urls_updated_at" BEFORE UPDATE ON "public"."fetched_external_urls" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_forum_comments_updated_at" BEFORE UPDATE ON "public"."forum_comments" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_forum_posts_updated_at" BEFORE UPDATE ON "public"."forum_posts" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_listings_updated_at" BEFORE UPDATE ON "public"."listings" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_managed_profiles_updated_at" BEFORE UPDATE ON "public"."managed_profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_news_articles_updated_at" BEFORE UPDATE ON "public"."news_articles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_news_sources_updated_at" BEFORE UPDATE ON "public"."news_sources" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_offers_updated_at" BEFORE UPDATE ON "public"."offers" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_profiles_updated_at" BEFORE UPDATE ON "public"."profiles" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_system_config_updated_at" BEFORE UPDATE ON "public"."system_config" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_vote_count" AFTER INSERT OR DELETE ON "public"."forum_votes" FOR EACH ROW EXECUTE FUNCTION "public"."update_forum_post_vote_count"();



ALTER TABLE ONLY "public"."external_link_clicks"
    ADD CONSTRAINT "external_link_clicks_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."external_link_clicks"
    ADD CONSTRAINT "external_link_clicks_signup_user_id_fkey" FOREIGN KEY ("signup_user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."external_link_clicks"
    ADD CONSTRAINT "external_link_clicks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."favorites"
    ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."fetched_external_urls"
    ADD CONSTRAINT "fetched_external_urls_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."fetched_external_urls"
    ADD CONSTRAINT "fetched_external_urls_managed_profile_id_fkey" FOREIGN KEY ("managed_profile_id") REFERENCES "public"."managed_profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_bookmarks"
    ADD CONSTRAINT "forum_bookmarks_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_bookmarks"
    ADD CONSTRAINT "forum_bookmarks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_comments"
    ADD CONSTRAINT "forum_comments_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_comments"
    ADD CONSTRAINT "forum_comments_parent_comment_id_fkey" FOREIGN KEY ("parent_comment_id") REFERENCES "public"."forum_comments"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_comments"
    ADD CONSTRAINT "forum_comments_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_posts"
    ADD CONSTRAINT "forum_posts_author_id_fkey" FOREIGN KEY ("author_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_votes"
    ADD CONSTRAINT "forum_votes_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "public"."forum_posts"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."forum_votes"
    ADD CONSTRAINT "forum_votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_history"
    ADD CONSTRAINT "listing_history_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_images"
    ADD CONSTRAINT "listing_images_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_snapshots"
    ADD CONSTRAINT "listing_snapshots_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_views"
    ADD CONSTRAINT "listing_views_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."listing_views"
    ADD CONSTRAINT "listing_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_managed_profile_id_fkey" FOREIGN KEY ("managed_profile_id") REFERENCES "public"."managed_profiles"("id");



ALTER TABLE ONLY "public"."listings"
    ADD CONSTRAINT "listings_seller_id_fkey" FOREIGN KEY ("seller_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."managed_profiles"
    ADD CONSTRAINT "managed_profiles_claimed_by_fkey" FOREIGN KEY ("claimed_by") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_recipient_id_fkey" FOREIGN KEY ("recipient_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."messages"
    ADD CONSTRAINT "messages_sender_id_fkey" FOREIGN KEY ("sender_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_article_views"
    ADD CONSTRAINT "news_article_views_article_id_fkey" FOREIGN KEY ("article_id") REFERENCES "public"."news_articles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."news_article_views"
    ADD CONSTRAINT "news_article_views_viewer_id_fkey" FOREIGN KEY ("viewer_id") REFERENCES "public"."profiles"("id") ON DELETE SET NULL;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_buyer_id_fkey" FOREIGN KEY ("buyer_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."offers"
    ADD CONSTRAINT "offers_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "public"."listings"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."saved_prompts"
    ADD CONSTRAINT "saved_prompts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_roles"
    ADD CONSTRAINT "user_roles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."user_sessions"
    ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE CASCADE;



CREATE POLICY "Admins can delete body styles" ON "public"."body_styles" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete conditions" ON "public"."conditions" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete corvette models" ON "public"."corvette_models" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete corvette sales" ON "public"."corvette_sales" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete email templates" ON "public"."email_templates" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete generation images" ON "public"."generation_images" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete generations" ON "public"."generations" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete listing snapshots" ON "public"."listing_snapshots" FOR DELETE TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete listing types" ON "public"."listing_types" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete news articles" ON "public"."news_articles" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete news sources" ON "public"."news_sources" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete transmissions" ON "public"."transmissions" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete used types" ON "public"."used_types" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can delete vehicle conditions" ON "public"."vehicle_conditions" FOR DELETE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert body styles" ON "public"."body_styles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert conditions" ON "public"."conditions" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert corvette models" ON "public"."corvette_models" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert corvette sales" ON "public"."corvette_sales" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert email templates" ON "public"."email_templates" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert generation images" ON "public"."generation_images" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert generations" ON "public"."generations" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert listing types" ON "public"."listing_types" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert news articles" ON "public"."news_articles" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert news sources" ON "public"."news_sources" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert transmissions" ON "public"."transmissions" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert used types" ON "public"."used_types" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can insert vehicle conditions" ON "public"."vehicle_conditions" FOR INSERT WITH CHECK ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all fetched URLs" ON "public"."fetched_external_urls" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage all managed_profiles" ON "public"."managed_profiles" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage roles" ON "public"."user_roles" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can manage system config" ON "public"."system_config" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update any profile" ON "public"."profiles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update body styles" ON "public"."body_styles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update conditions" ON "public"."conditions" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update corvette models" ON "public"."corvette_models" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update corvette sales" ON "public"."corvette_sales" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update email templates" ON "public"."email_templates" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update generation images" ON "public"."generation_images" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update generations" ON "public"."generations" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update listing types" ON "public"."listing_types" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update news articles" ON "public"."news_articles" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update news sources" ON "public"."news_sources" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update transmissions" ON "public"."transmissions" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update used types" ON "public"."used_types" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can update vehicle conditions" ON "public"."vehicle_conditions" FOR UPDATE USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all article views" ON "public"."news_article_views" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all listing views" ON "public"."listing_views" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all roles" ON "public"."user_roles" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all sessions" ON "public"."user_sessions" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view all tracking records" ON "public"."external_link_clicks" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view email templates" ON "public"."email_templates" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view launch emails" ON "public"."launch_emails" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view listing history" ON "public"."listing_history" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view listing snapshots" ON "public"."listing_snapshots" FOR SELECT TO "authenticated" USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Admins can view tracking stats" ON "public"."view_tracking_daily_stats" FOR SELECT USING ("public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"));



CREATE POLICY "Anyone can insert launch emails" ON "public"."launch_emails" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can insert tracking records" ON "public"."external_link_clicks" FOR INSERT WITH CHECK (true);



CREATE POLICY "Anyone can read managed_profiles" ON "public"."managed_profiles" FOR SELECT USING (true);



CREATE POLICY "Anyone can view active articles, admins can view all" ON "public"."news_articles" FOR SELECT USING ((("is_active" = true) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Anyone can view active news sources" ON "public"."news_sources" FOR SELECT USING (("is_active" = true));



CREATE POLICY "Anyone can view article view counts" ON "public"."news_article_views" FOR SELECT USING (true);



CREATE POLICY "Anyone can view non-hidden comments" ON "public"."forum_comments" FOR SELECT USING ((("is_hidden" = false) OR ("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Anyone can view non-hidden posts" ON "public"."forum_posts" FOR SELECT USING ((("is_hidden" = false) OR ("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Anyone can view public profile info" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "Approved and pending_edited listings are viewable by everyone" ON "public"."listings" FOR SELECT USING (((("status" = ANY (ARRAY['approved'::"public"."listing_status", 'pending_edited'::"public"."listing_status"])) AND "public"."is_seller_active"("seller_id")) OR ("seller_id" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Authenticated users can create comments" ON "public"."forum_comments" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can create listings" ON "public"."listings" FOR INSERT WITH CHECK (("auth"."uid"() = "seller_id"));



CREATE POLICY "Authenticated users can create posts" ON "public"."forum_posts" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "author_id"));



CREATE POLICY "Authenticated users can vote" ON "public"."forum_votes" FOR INSERT TO "authenticated" WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Authors and admins can delete comments" ON "public"."forum_comments" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Authors and admins can delete posts" ON "public"."forum_posts" FOR DELETE TO "authenticated" USING ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Authors can update own comments" ON "public"."forum_comments" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))) WITH CHECK ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Authors can update own posts" ON "public"."forum_posts" FOR UPDATE TO "authenticated" USING ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))) WITH CHECK ((("auth"."uid"() = "author_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Body styles are viewable by everyone" ON "public"."body_styles" FOR SELECT USING (true);



CREATE POLICY "Buyers can create offers" ON "public"."offers" FOR INSERT WITH CHECK (("auth"."uid"() = "buyer_id"));



CREATE POLICY "Buyers can view their sent offers" ON "public"."offers" FOR SELECT USING (("auth"."uid"() = "buyer_id"));



CREATE POLICY "Conditions are viewable by everyone" ON "public"."conditions" FOR SELECT USING (true);



CREATE POLICY "Corvette models are viewable by everyone" ON "public"."corvette_models" FOR SELECT USING (true);



CREATE POLICY "Corvette sales are viewable by everyone" ON "public"."corvette_sales" FOR SELECT USING (true);



CREATE POLICY "Generation images are viewable by everyone" ON "public"."generation_images" FOR SELECT USING (true);



CREATE POLICY "Generations are viewable by everyone" ON "public"."generations" FOR SELECT USING (true);



CREATE POLICY "Images are viewable with their listing" ON "public"."listing_images" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND (("listings"."status" = 'approved'::"public"."listing_status") OR ("listings"."seller_id" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Listing types are viewable by everyone" ON "public"."listing_types" FOR SELECT USING (true);



CREATE POLICY "Public can view snapshots for pending_edited listings" ON "public"."listing_snapshots" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_snapshots"."listing_id") AND ("listings"."status" = 'pending_edited'::"public"."listing_status")))));



CREATE POLICY "Recipients can update message read status" ON "public"."messages" FOR UPDATE USING (("auth"."uid"() = "recipient_id"));



CREATE POLICY "Sellers and admins can add images to listings" ON "public"."listing_images" FOR INSERT WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND (("listings"."seller_id" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Sellers and admins can delete listing images" ON "public"."listing_images" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND (("listings"."seller_id" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Sellers and admins can update listing images" ON "public"."listing_images" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_images"."listing_id") AND (("listings"."seller_id" = "auth"."uid"()) OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role"))))));



CREATE POLICY "Sellers can create snapshots for their listings" ON "public"."listing_snapshots" FOR INSERT TO "authenticated" WITH CHECK ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_snapshots"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can delete their own listings" ON "public"."listings" FOR DELETE USING ((("auth"."uid"() = "seller_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Sellers can update offer status" ON "public"."offers" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "offers"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can update their own listing snapshots" ON "public"."listing_snapshots" FOR UPDATE TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_snapshots"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can update their own listings" ON "public"."listings" FOR UPDATE USING ((("auth"."uid"() = "seller_id") OR "public"."has_role"("auth"."uid"(), 'admin'::"public"."app_role")));



CREATE POLICY "Sellers can view offers on their listings" ON "public"."offers" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "offers"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can view their listing views" ON "public"."listing_views" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_views"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Sellers can view their own listing snapshots" ON "public"."listing_snapshots" FOR SELECT TO "authenticated" USING ((EXISTS ( SELECT 1
   FROM "public"."listings"
  WHERE (("listings"."id" = "listing_snapshots"."listing_id") AND ("listings"."seller_id" = "auth"."uid"())))));



CREATE POLICY "Session can update own tracking record" ON "public"."external_link_clicks" FOR UPDATE USING (true) WITH CHECK (true);



CREATE POLICY "System config is readable by everyone" ON "public"."system_config" FOR SELECT USING (true);



CREATE POLICY "Transmissions are viewable by everyone" ON "public"."transmissions" FOR SELECT USING (true);



CREATE POLICY "Used types are viewable by everyone" ON "public"."used_types" FOR SELECT USING (true);



CREATE POLICY "Users can add favorites" ON "public"."favorites" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can create their own bookmarks" ON "public"."forum_bookmarks" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own bookmarks" ON "public"."forum_bookmarks" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can delete their own saved prompts" ON "public"."saved_prompts" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own saved prompts" ON "public"."saved_prompts" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can insert their own sessions" ON "public"."user_sessions" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove their favorites" ON "public"."favorites" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can remove their vote" ON "public"."forum_votes" FOR DELETE TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can send messages" ON "public"."messages" FOR INSERT WITH CHECK (("auth"."uid"() = "sender_id"));



CREATE POLICY "Users can update their own profile" ON "public"."profiles" FOR UPDATE USING (("auth"."uid"() = "id"));



CREATE POLICY "Users can update their own sessions" ON "public"."user_sessions" FOR UPDATE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own bookmarks" ON "public"."forum_bookmarks" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own favorites" ON "public"."favorites" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own messages" ON "public"."messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "Users can view their own messages and threads" ON "public"."messages" FOR SELECT USING ((("auth"."uid"() = "sender_id") OR ("auth"."uid"() = "recipient_id")));



CREATE POLICY "Users can view their own roles" ON "public"."user_roles" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own saved prompts" ON "public"."saved_prompts" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own sessions" ON "public"."user_sessions" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Users can view their own votes" ON "public"."forum_votes" FOR SELECT TO "authenticated" USING (("auth"."uid"() = "user_id"));



CREATE POLICY "Vehicle conditions are viewable by everyone" ON "public"."vehicle_conditions" FOR SELECT USING (true);



ALTER TABLE "public"."body_styles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."corvette_models" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."corvette_sales" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."email_templates" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."external_link_clicks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."favorites" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."fetched_external_urls" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_bookmarks" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_comments" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_posts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."forum_votes" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generation_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."generations" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."launch_emails" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_history" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_images" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_snapshots" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listing_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."listings" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."managed_profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."messages" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_article_views" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_articles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."news_sources" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."offers" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."saved_prompts" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."system_config" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."transmissions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."used_types" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_roles" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."user_sessions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."vehicle_conditions" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."view_tracking_daily_stats" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."external_link_clicks";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."listing_views";



ALTER PUBLICATION "supabase_realtime" ADD TABLE ONLY "public"."news_article_views";



GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";






















































































































































GRANT ALL ON FUNCTION "public"."get_public_profile"("profile_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_public_profile"("profile_id" "uuid") TO "authenticated";


















GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."body_styles" TO "anon";
GRANT ALL ON TABLE "public"."body_styles" TO "authenticated";
GRANT ALL ON TABLE "public"."body_styles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."conditions" TO "anon";
GRANT ALL ON TABLE "public"."conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."conditions" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."corvette_models" TO "anon";
GRANT ALL ON TABLE "public"."corvette_models" TO "authenticated";
GRANT ALL ON TABLE "public"."corvette_models" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."corvette_sales" TO "anon";
GRANT ALL ON TABLE "public"."corvette_sales" TO "authenticated";
GRANT ALL ON TABLE "public"."corvette_sales" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."email_templates" TO "anon";
GRANT ALL ON TABLE "public"."email_templates" TO "authenticated";
GRANT ALL ON TABLE "public"."email_templates" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."external_link_clicks" TO "anon";
GRANT ALL ON TABLE "public"."external_link_clicks" TO "authenticated";
GRANT ALL ON TABLE "public"."external_link_clicks" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."favorites" TO "anon";
GRANT ALL ON TABLE "public"."favorites" TO "authenticated";
GRANT ALL ON TABLE "public"."favorites" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."fetched_external_urls" TO "anon";
GRANT ALL ON TABLE "public"."fetched_external_urls" TO "authenticated";
GRANT ALL ON TABLE "public"."fetched_external_urls" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."forum_bookmarks" TO "anon";
GRANT ALL ON TABLE "public"."forum_bookmarks" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_bookmarks" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."forum_comments" TO "anon";
GRANT ALL ON TABLE "public"."forum_comments" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_comments" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."forum_posts" TO "anon";
GRANT ALL ON TABLE "public"."forum_posts" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_posts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."forum_votes" TO "anon";
GRANT ALL ON TABLE "public"."forum_votes" TO "authenticated";
GRANT ALL ON TABLE "public"."forum_votes" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."generation_images" TO "anon";
GRANT ALL ON TABLE "public"."generation_images" TO "authenticated";
GRANT ALL ON TABLE "public"."generation_images" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."generations" TO "anon";
GRANT ALL ON TABLE "public"."generations" TO "authenticated";
GRANT ALL ON TABLE "public"."generations" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."launch_emails" TO "anon";
GRANT ALL ON TABLE "public"."launch_emails" TO "authenticated";
GRANT ALL ON TABLE "public"."launch_emails" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_history" TO "anon";
GRANT ALL ON TABLE "public"."listing_history" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_history" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_images" TO "anon";
GRANT ALL ON TABLE "public"."listing_images" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_images" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_snapshots" TO "anon";
GRANT ALL ON TABLE "public"."listing_snapshots" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_snapshots" TO "service_role";



GRANT ALL ON SEQUENCE "public"."listing_stock_number_seq" TO "service_role";
GRANT SELECT,USAGE ON SEQUENCE "public"."listing_stock_number_seq" TO "authenticated";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_types" TO "anon";
GRANT ALL ON TABLE "public"."listing_types" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_types" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listing_views" TO "anon";
GRANT ALL ON TABLE "public"."listing_views" TO "authenticated";
GRANT ALL ON TABLE "public"."listing_views" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."listings" TO "anon";
GRANT ALL ON TABLE "public"."listings" TO "authenticated";
GRANT ALL ON TABLE "public"."listings" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."managed_profiles" TO "anon";
GRANT ALL ON TABLE "public"."managed_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."managed_profiles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."messages" TO "anon";
GRANT ALL ON TABLE "public"."messages" TO "authenticated";
GRANT ALL ON TABLE "public"."messages" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."news_article_views" TO "anon";
GRANT ALL ON TABLE "public"."news_article_views" TO "authenticated";
GRANT ALL ON TABLE "public"."news_article_views" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."news_articles" TO "anon";
GRANT ALL ON TABLE "public"."news_articles" TO "authenticated";
GRANT ALL ON TABLE "public"."news_articles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."news_sources" TO "anon";
GRANT ALL ON TABLE "public"."news_sources" TO "authenticated";
GRANT ALL ON TABLE "public"."news_sources" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."offers" TO "anon";
GRANT ALL ON TABLE "public"."offers" TO "authenticated";
GRANT ALL ON TABLE "public"."offers" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."public_profiles" TO "anon";
GRANT ALL ON TABLE "public"."public_profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."public_profiles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."saved_prompts" TO "anon";
GRANT ALL ON TABLE "public"."saved_prompts" TO "authenticated";
GRANT ALL ON TABLE "public"."saved_prompts" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."system_config" TO "anon";
GRANT ALL ON TABLE "public"."system_config" TO "authenticated";
GRANT ALL ON TABLE "public"."system_config" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."transmissions" TO "anon";
GRANT ALL ON TABLE "public"."transmissions" TO "authenticated";
GRANT ALL ON TABLE "public"."transmissions" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."used_types" TO "anon";
GRANT ALL ON TABLE "public"."used_types" TO "authenticated";
GRANT ALL ON TABLE "public"."used_types" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."user_roles" TO "anon";
GRANT ALL ON TABLE "public"."user_roles" TO "authenticated";
GRANT ALL ON TABLE "public"."user_roles" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."user_sessions" TO "anon";
GRANT ALL ON TABLE "public"."user_sessions" TO "authenticated";
GRANT ALL ON TABLE "public"."user_sessions" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."vehicle_conditions" TO "anon";
GRANT ALL ON TABLE "public"."vehicle_conditions" TO "authenticated";
GRANT ALL ON TABLE "public"."vehicle_conditions" TO "service_role";



GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLE "public"."view_tracking_daily_stats" TO "anon";
GRANT ALL ON TABLE "public"."view_tracking_daily_stats" TO "authenticated";
GRANT ALL ON TABLE "public"."view_tracking_daily_stats" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT SELECT,REFERENCES,TRIGGER,TRUNCATE,MAINTAIN ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";































drop extension if exists "pg_net";

revoke delete on table "public"."body_styles" from "anon";

revoke insert on table "public"."body_styles" from "anon";

revoke update on table "public"."body_styles" from "anon";

revoke delete on table "public"."conditions" from "anon";

revoke insert on table "public"."conditions" from "anon";

revoke update on table "public"."conditions" from "anon";

revoke delete on table "public"."corvette_models" from "anon";

revoke insert on table "public"."corvette_models" from "anon";

revoke update on table "public"."corvette_models" from "anon";

revoke delete on table "public"."corvette_sales" from "anon";

revoke insert on table "public"."corvette_sales" from "anon";

revoke update on table "public"."corvette_sales" from "anon";

revoke delete on table "public"."email_templates" from "anon";

revoke insert on table "public"."email_templates" from "anon";

revoke update on table "public"."email_templates" from "anon";

revoke delete on table "public"."external_link_clicks" from "anon";

revoke insert on table "public"."external_link_clicks" from "anon";

revoke update on table "public"."external_link_clicks" from "anon";

revoke delete on table "public"."favorites" from "anon";

revoke insert on table "public"."favorites" from "anon";

revoke update on table "public"."favorites" from "anon";

revoke delete on table "public"."fetched_external_urls" from "anon";

revoke insert on table "public"."fetched_external_urls" from "anon";

revoke update on table "public"."fetched_external_urls" from "anon";

revoke delete on table "public"."forum_bookmarks" from "anon";

revoke insert on table "public"."forum_bookmarks" from "anon";

revoke update on table "public"."forum_bookmarks" from "anon";

revoke delete on table "public"."forum_comments" from "anon";

revoke insert on table "public"."forum_comments" from "anon";

revoke update on table "public"."forum_comments" from "anon";

revoke delete on table "public"."forum_posts" from "anon";

revoke insert on table "public"."forum_posts" from "anon";

revoke update on table "public"."forum_posts" from "anon";

revoke delete on table "public"."forum_votes" from "anon";

revoke insert on table "public"."forum_votes" from "anon";

revoke update on table "public"."forum_votes" from "anon";

revoke delete on table "public"."generation_images" from "anon";

revoke insert on table "public"."generation_images" from "anon";

revoke update on table "public"."generation_images" from "anon";

revoke delete on table "public"."generations" from "anon";

revoke insert on table "public"."generations" from "anon";

revoke update on table "public"."generations" from "anon";

revoke delete on table "public"."launch_emails" from "anon";

revoke insert on table "public"."launch_emails" from "anon";

revoke update on table "public"."launch_emails" from "anon";

revoke delete on table "public"."listing_history" from "anon";

revoke insert on table "public"."listing_history" from "anon";

revoke update on table "public"."listing_history" from "anon";

revoke delete on table "public"."listing_images" from "anon";

revoke insert on table "public"."listing_images" from "anon";

revoke update on table "public"."listing_images" from "anon";

revoke delete on table "public"."listing_snapshots" from "anon";

revoke insert on table "public"."listing_snapshots" from "anon";

revoke update on table "public"."listing_snapshots" from "anon";

revoke delete on table "public"."listing_types" from "anon";

revoke insert on table "public"."listing_types" from "anon";

revoke update on table "public"."listing_types" from "anon";

revoke delete on table "public"."listing_views" from "anon";

revoke insert on table "public"."listing_views" from "anon";

revoke update on table "public"."listing_views" from "anon";

revoke delete on table "public"."listings" from "anon";

revoke insert on table "public"."listings" from "anon";

revoke update on table "public"."listings" from "anon";

revoke delete on table "public"."managed_profiles" from "anon";

revoke insert on table "public"."managed_profiles" from "anon";

revoke update on table "public"."managed_profiles" from "anon";

revoke delete on table "public"."messages" from "anon";

revoke insert on table "public"."messages" from "anon";

revoke update on table "public"."messages" from "anon";

revoke delete on table "public"."news_article_views" from "anon";

revoke insert on table "public"."news_article_views" from "anon";

revoke update on table "public"."news_article_views" from "anon";

revoke delete on table "public"."news_articles" from "anon";

revoke insert on table "public"."news_articles" from "anon";

revoke update on table "public"."news_articles" from "anon";

revoke delete on table "public"."news_sources" from "anon";

revoke insert on table "public"."news_sources" from "anon";

revoke update on table "public"."news_sources" from "anon";

revoke delete on table "public"."offers" from "anon";

revoke insert on table "public"."offers" from "anon";

revoke update on table "public"."offers" from "anon";

revoke delete on table "public"."profiles" from "anon";

revoke insert on table "public"."profiles" from "anon";

revoke update on table "public"."profiles" from "anon";

revoke delete on table "public"."saved_prompts" from "anon";

revoke insert on table "public"."saved_prompts" from "anon";

revoke update on table "public"."saved_prompts" from "anon";

revoke delete on table "public"."system_config" from "anon";

revoke insert on table "public"."system_config" from "anon";

revoke update on table "public"."system_config" from "anon";

revoke delete on table "public"."transmissions" from "anon";

revoke insert on table "public"."transmissions" from "anon";

revoke update on table "public"."transmissions" from "anon";

revoke delete on table "public"."used_types" from "anon";

revoke insert on table "public"."used_types" from "anon";

revoke update on table "public"."used_types" from "anon";

revoke delete on table "public"."user_roles" from "anon";

revoke insert on table "public"."user_roles" from "anon";

revoke update on table "public"."user_roles" from "anon";

revoke delete on table "public"."user_sessions" from "anon";

revoke insert on table "public"."user_sessions" from "anon";

revoke update on table "public"."user_sessions" from "anon";

revoke delete on table "public"."vehicle_conditions" from "anon";

revoke insert on table "public"."vehicle_conditions" from "anon";

revoke update on table "public"."vehicle_conditions" from "anon";

revoke delete on table "public"."view_tracking_daily_stats" from "anon";

revoke insert on table "public"."view_tracking_daily_stats" from "anon";

revoke update on table "public"."view_tracking_daily_stats" from "anon";

CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


  create policy "Admins can delete generation images from storage"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'generation-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can update generation images in storage"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'generation-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Admins can upload generation images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'generation-images'::text) AND public.has_role(auth.uid(), 'admin'::public.app_role)));



  create policy "Anyone can view forum images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'forum-images'::text));



  create policy "Article images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'article-images'::text));



  create policy "Authenticated users can delete article images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'article-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can update article images"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'article-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can upload article images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'article-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can upload assets"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'assets'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "Authenticated users can upload listing images"
  on "storage"."objects"
  as permissive
  for insert
  to public
with check (((bucket_id = 'listing-images'::text) AND (auth.role() = 'authenticated'::text)));



  create policy "External listing images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'external-listing-images'::text));



  create policy "Generation images are publicly accessible"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'generation-images'::text));



  create policy "Listing images are publicly viewable"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'listing-images'::text));



  create policy "Public can view assets"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'assets'::text));



  create policy "Public can view og-images"
  on "storage"."objects"
  as permissive
  for select
  to public
using ((bucket_id = 'og-images'::text));



  create policy "Service role can manage external listing images"
  on "storage"."objects"
  as permissive
  for all
  to public
using ((bucket_id = 'external-listing-images'::text))
with check ((bucket_id = 'external-listing-images'::text));



  create policy "Service role can manage og-images"
  on "storage"."objects"
  as permissive
  for all
  to public
using ((bucket_id = 'og-images'::text))
with check ((bucket_id = 'og-images'::text));



  create policy "Users can delete their own forum images"
  on "storage"."objects"
  as permissive
  for delete
  to authenticated
using (((bucket_id = 'forum-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



  create policy "Users can delete their own listing images"
  on "storage"."objects"
  as permissive
  for delete
  to public
using (((bucket_id = 'listing-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can update their own listing images"
  on "storage"."objects"
  as permissive
  for update
  to public
using (((bucket_id = 'listing-images'::text) AND ((auth.uid())::text = (storage.foldername(name))[1])));



  create policy "Users can upload forum images"
  on "storage"."objects"
  as permissive
  for insert
  to authenticated
with check (((bucket_id = 'forum-images'::text) AND ((storage.foldername(name))[1] = (auth.uid())::text)));



