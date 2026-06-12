export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      body_styles: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      conditions: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      corvette_models: {
        Row: {
          created_at: string
          display_order: number
          generation: string
          id: string
          model_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number
          generation: string
          id?: string
          model_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number
          generation?: string
          id?: string
          model_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      corvette_sales: {
        Row: {
          created_at: string
          exterior_color: string | null
          generation: string
          id: string
          image_url: string | null
          mileage: number | null
          sale_date: string
          sale_price: number
          source_name: string
          source_url: string
          title: string | null
          transmission: string | null
          updated_at: string
          year: number
        }
        Insert: {
          created_at?: string
          exterior_color?: string | null
          generation: string
          id?: string
          image_url?: string | null
          mileage?: number | null
          sale_date: string
          sale_price: number
          source_name: string
          source_url: string
          title?: string | null
          transmission?: string | null
          updated_at?: string
          year: number
        }
        Update: {
          created_at?: string
          exterior_color?: string | null
          generation?: string
          id?: string
          image_url?: string | null
          mileage?: number | null
          sale_date?: string
          sale_price?: number
          source_name?: string
          source_url?: string
          title?: string | null
          transmission?: string | null
          updated_at?: string
          year?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          created_at: string
          html_template: string
          id: string
          subject: string
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          html_template: string
          id?: string
          subject: string
          type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          html_template?: string
          id?: string
          subject?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      external_link_clicks: {
        Row: {
          action_taken: string | null
          completed_at: string | null
          created_at: string
          dealer_name: string
          external_url: string
          id: string
          listing_id: string | null
          listing_title: string
          session_id: string | null
          signup_completed: boolean | null
          signup_user_id: string | null
          signup_username: string | null
          user_id: string | null
          username: string | null
          was_authenticated: boolean
        }
        Insert: {
          action_taken?: string | null
          completed_at?: string | null
          created_at?: string
          dealer_name: string
          external_url: string
          id?: string
          listing_id?: string | null
          listing_title: string
          session_id?: string | null
          signup_completed?: boolean | null
          signup_user_id?: string | null
          signup_username?: string | null
          user_id?: string | null
          username?: string | null
          was_authenticated?: boolean
        }
        Update: {
          action_taken?: string | null
          completed_at?: string | null
          created_at?: string
          dealer_name?: string
          external_url?: string
          id?: string
          listing_id?: string | null
          listing_title?: string
          session_id?: string | null
          signup_completed?: boolean | null
          signup_user_id?: string | null
          signup_username?: string | null
          user_id?: string | null
          username?: string | null
          was_authenticated?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "external_link_clicks_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_link_clicks_signup_user_id_fkey"
            columns: ["signup_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_link_clicks_signup_user_id_fkey"
            columns: ["signup_user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_link_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_link_clicks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      favorites: {
        Row: {
          created_at: string | null
          id: string
          listing_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          listing_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          listing_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "favorites_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      fetched_external_urls: {
        Row: {
          created_at: string
          exists_in_system: boolean
          fetched_at: string
          id: string
          listing_id: string | null
          managed_profile_id: string
          process_error: string | null
          process_status: string | null
          processed_at: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          exists_in_system?: boolean
          fetched_at?: string
          id?: string
          listing_id?: string | null
          managed_profile_id: string
          process_error?: string | null
          process_status?: string | null
          processed_at?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          exists_in_system?: boolean
          fetched_at?: string
          id?: string
          listing_id?: string | null
          managed_profile_id?: string
          process_error?: string | null
          process_status?: string | null
          processed_at?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "fetched_external_urls_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fetched_external_urls_managed_profile_id_fkey"
            columns: ["managed_profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_bookmarks: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          is_hidden: boolean
          parent_comment_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_comment_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          is_hidden?: boolean
          parent_comment_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_parent_comment_id_fkey"
            columns: ["parent_comment_id"]
            isOneToOne: false
            referencedRelation: "forum_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_posts: {
        Row: {
          author_id: string
          comment_count: number
          content: string
          created_at: string
          generation: string | null
          id: string
          image_urls: string[] | null
          is_hidden: boolean
          is_pinned: boolean
          slug: string
          title: string
          updated_at: string
          views_count: number
          vote_count: number
        }
        Insert: {
          author_id: string
          comment_count?: number
          content: string
          created_at?: string
          generation?: string | null
          id?: string
          image_urls?: string[] | null
          is_hidden?: boolean
          is_pinned?: boolean
          slug: string
          title: string
          updated_at?: string
          views_count?: number
          vote_count?: number
        }
        Update: {
          author_id?: string
          comment_count?: number
          content?: string
          created_at?: string
          generation?: string | null
          id?: string
          image_urls?: string[] | null
          is_hidden?: boolean
          is_pinned?: boolean
          slug?: string
          title?: string
          updated_at?: string
          views_count?: number
          vote_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      forum_votes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "forum_votes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "forum_posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forum_votes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_images: {
        Row: {
          created_at: string
          display_order: number | null
          generation_id: string
          id: string
          image_type: string | null
          image_url: string
          is_hero: boolean | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          generation_id: string
          id?: string
          image_type?: string | null
          image_url: string
          is_hero?: boolean | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          generation_id?: string
          id?: string
          image_type?: string | null
          image_url?: string
          is_hero?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      generations: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      launch_emails: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      listing_history: {
        Row: {
          changed_at: string
          changed_by: string | null
          id: string
          listing_id: string
          rejection_reason: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
        }
        Insert: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          listing_id: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
        }
        Update: {
          changed_at?: string
          changed_by?: string | null
          id?: string
          listing_id?: string
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_history_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_images: {
        Row: {
          created_at: string | null
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          listing_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          listing_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          listing_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "listing_images_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_snapshots: {
        Row: {
          body_style: string | null
          condition: string | null
          created_at: string
          description: string | null
          engine: string | null
          exterior_color: string | null
          external_image_url: string | null
          external_url: string | null
          generation: string
          id: string
          image_urls: string[] | null
          interior_color: string | null
          is_external_listing: boolean | null
          listing_id: string
          listing_type: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          mileage: number | null
          model: string | null
          negotiable: boolean | null
          price: number
          title: string
          transmission: string | null
          used_type: string | null
          vehicle_condition: string | null
          video_url: string | null
          vin: string | null
          year: number
        }
        Insert: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          engine?: string | null
          exterior_color?: string | null
          external_image_url?: string | null
          external_url?: string | null
          generation: string
          id?: string
          image_urls?: string[] | null
          interior_color?: string | null
          is_external_listing?: boolean | null
          listing_id: string
          listing_type?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          mileage?: number | null
          model?: string | null
          negotiable?: boolean | null
          price: number
          title: string
          transmission?: string | null
          used_type?: string | null
          vehicle_condition?: string | null
          video_url?: string | null
          vin?: string | null
          year: number
        }
        Update: {
          body_style?: string | null
          condition?: string | null
          created_at?: string
          description?: string | null
          engine?: string | null
          exterior_color?: string | null
          external_image_url?: string | null
          external_url?: string | null
          generation?: string
          id?: string
          image_urls?: string[] | null
          interior_color?: string | null
          is_external_listing?: boolean | null
          listing_id?: string
          listing_type?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          mileage?: number | null
          model?: string | null
          negotiable?: boolean | null
          price?: number
          title?: string
          transmission?: string | null
          used_type?: string | null
          vehicle_condition?: string | null
          video_url?: string | null
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "listing_snapshots_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: true
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      listing_types: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      listing_views: {
        Row: {
          id: string
          listing_id: string
          session_id: string | null
          viewed_at: string
          viewer_id: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          id?: string
          listing_id: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          id?: string
          listing_id?: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "listing_views_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listing_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      listings: {
        Row: {
          body_style: string | null
          condition: string | null
          created_at: string | null
          dealer_name: string | null
          description: string | null
          engine: string | null
          expiration_date: string | null
          exterior_color: string | null
          external_image_url: string | null
          external_url: string | null
          featured: boolean | null
          generation: string
          id: string
          interior_color: string | null
          is_bid_to: boolean | null
          is_dealer: boolean | null
          is_external_listing: boolean | null
          is_sold: boolean | null
          listing_type: string | null
          location_city: string | null
          location_state: string | null
          location_zip: string | null
          managed_profile_id: string | null
          mileage: number | null
          model: string | null
          negotiable: boolean | null
          price: number
          rejection_reason: string | null
          seller_id: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["listing_status"] | null
          stock_number: number | null
          title: string
          transmission: string | null
          updated_at: string | null
          used_type: string | null
          vehicle_condition: string
          video_url: string | null
          views_count: number | null
          vin: string | null
          year: number
        }
        Insert: {
          body_style?: string | null
          condition?: string | null
          created_at?: string | null
          dealer_name?: string | null
          description?: string | null
          engine?: string | null
          expiration_date?: string | null
          exterior_color?: string | null
          external_image_url?: string | null
          external_url?: string | null
          featured?: boolean | null
          generation: string
          id?: string
          interior_color?: string | null
          is_bid_to?: boolean | null
          is_dealer?: boolean | null
          is_external_listing?: boolean | null
          is_sold?: boolean | null
          listing_type?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          managed_profile_id?: string | null
          mileage?: number | null
          model?: string | null
          negotiable?: boolean | null
          price: number
          rejection_reason?: string | null
          seller_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_number?: number | null
          title: string
          transmission?: string | null
          updated_at?: string | null
          used_type?: string | null
          vehicle_condition: string
          video_url?: string | null
          views_count?: number | null
          vin?: string | null
          year: number
        }
        Update: {
          body_style?: string | null
          condition?: string | null
          created_at?: string | null
          dealer_name?: string | null
          description?: string | null
          engine?: string | null
          expiration_date?: string | null
          exterior_color?: string | null
          external_image_url?: string | null
          external_url?: string | null
          featured?: boolean | null
          generation?: string
          id?: string
          interior_color?: string | null
          is_bid_to?: boolean | null
          is_dealer?: boolean | null
          is_external_listing?: boolean | null
          is_sold?: boolean | null
          listing_type?: string | null
          location_city?: string | null
          location_state?: string | null
          location_zip?: string | null
          managed_profile_id?: string | null
          mileage?: number | null
          model?: string | null
          negotiable?: boolean | null
          price?: number
          rejection_reason?: string | null
          seller_id?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["listing_status"] | null
          stock_number?: number | null
          title?: string
          transmission?: string | null
          updated_at?: string | null
          used_type?: string | null
          vehicle_condition?: string
          video_url?: string | null
          views_count?: number | null
          vin?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "listings_managed_profile_id_fkey"
            columns: ["managed_profile_id"]
            isOneToOne: false
            referencedRelation: "managed_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "listings_seller_id_fkey"
            columns: ["seller_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      managed_profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          claimed_at: string | null
          claimed_by: string | null
          contact_email: string | null
          created_at: string | null
          created_by: string
          dealer_name: string | null
          email: string
          fetch_all_images: boolean | null
          fetch_url: string | null
          first_name: string | null
          id: string
          is_auction: boolean | null
          is_dealer: boolean | null
          last_name: string | null
          location_city: string | null
          location_state: string | null
          phone: string | null
          updated_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by: string
          dealer_name?: string | null
          email: string
          fetch_all_images?: boolean | null
          fetch_url?: string | null
          first_name?: string | null
          id?: string
          is_auction?: boolean | null
          is_dealer?: boolean | null
          last_name?: string | null
          location_city?: string | null
          location_state?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          claimed_at?: string | null
          claimed_by?: string | null
          contact_email?: string | null
          created_at?: string | null
          created_by?: string
          dealer_name?: string | null
          email?: string
          fetch_all_images?: boolean | null
          fetch_url?: string | null
          first_name?: string | null
          id?: string
          is_auction?: boolean | null
          is_dealer?: boolean | null
          last_name?: string | null
          location_city?: string | null
          location_state?: string | null
          phone?: string | null
          updated_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "managed_profiles_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "managed_profiles_claimed_by_fkey"
            columns: ["claimed_by"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          listing_id: string | null
          read_at: string | null
          recipient_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          read_at?: string | null
          recipient_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          listing_id?: string | null
          read_at?: string | null
          recipient_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_article_views: {
        Row: {
          article_id: string
          id: string
          session_id: string | null
          viewed_at: string
          viewer_id: string | null
          visitor_fingerprint: string | null
        }
        Insert: {
          article_id: string
          id?: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
          visitor_fingerprint?: string | null
        }
        Update: {
          article_id?: string
          id?: string
          session_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
          visitor_fingerprint?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "news_article_views_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "news_articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "news_article_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      news_articles: {
        Row: {
          created_at: string | null
          generation: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean | null
          published_at: string | null
          scraped_at: string | null
          source_name: string
          source_url: string
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          generation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          published_at?: string | null
          scraped_at?: string | null
          source_name: string
          source_url: string
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          generation?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean | null
          published_at?: string | null
          scraped_at?: string | null
          source_name?: string
          source_url?: string
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      news_sources: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          last_scraped_at: string | null
          name: string
          scrape_frequency_hours: number | null
          scrape_pattern: string | null
          updated_at: string | null
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          name: string
          scrape_frequency_hours?: number | null
          scrape_pattern?: string | null
          updated_at?: string | null
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_scraped_at?: string | null
          name?: string
          scrape_frequency_hours?: number | null
          scrape_pattern?: string | null
          updated_at?: string | null
          url?: string
        }
        Relationships: []
      }
      offers: {
        Row: {
          amount: number
          approval_message: string | null
          buyer_id: string
          created_at: string | null
          id: string
          listing_id: string
          message: string | null
          rejection_reason: string | null
          status: Database["public"]["Enums"]["offer_status"] | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approval_message?: string | null
          buyer_id: string
          created_at?: string | null
          id?: string
          listing_id: string
          message?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approval_message?: string | null
          buyer_id?: string
          created_at?: string | null
          id?: string
          listing_id?: string
          message?: string | null
          rejection_reason?: string | null
          status?: Database["public"]["Enums"]["offer_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_buyer_id_fkey"
            columns: ["buyer_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_listing_id_fkey"
            columns: ["listing_id"]
            isOneToOne: false
            referencedRelation: "listings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bio: string | null
          contact_email: string | null
          created_at: string | null
          dealer_name: string | null
          first_name: string | null
          id: string
          is_active: boolean | null
          is_dealer: boolean | null
          last_login_at: string | null
          last_name: string | null
          location: string | null
          location_city: string | null
          location_state: string | null
          phone: string | null
          total_logins: number | null
          total_session_minutes: number | null
          updated_at: string | null
          verification_attempts: number | null
          verification_code: string | null
          verification_code_expires_at: string | null
          website: string | null
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          dealer_name?: string | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          is_dealer?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          location?: string | null
          location_city?: string | null
          location_state?: string | null
          phone?: string | null
          total_logins?: number | null
          total_session_minutes?: number | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bio?: string | null
          contact_email?: string | null
          created_at?: string | null
          dealer_name?: string | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          is_dealer?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          location?: string | null
          location_city?: string | null
          location_state?: string | null
          phone?: string | null
          total_logins?: number | null
          total_session_minutes?: number | null
          updated_at?: string | null
          verification_attempts?: number | null
          verification_code?: string | null
          verification_code_expires_at?: string | null
          website?: string | null
          zip_code?: string | null
        }
        Relationships: []
      }
      saved_prompts: {
        Row: {
          created_at: string
          id: string
          name: string
          prompt: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          prompt: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          prompt?: string
          user_id?: string
        }
        Relationships: []
      }
      system_config: {
        Row: {
          category: string
          created_at: string
          data_type: string
          description: string | null
          id: string
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          category?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          category?: string
          created_at?: string
          data_type?: string
          description?: string | null
          id?: string
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      transmissions: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      used_types: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_sessions: {
        Row: {
          created_at: string
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          last_active_at: string
          login_at: string
          logout_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          last_active_at?: string
          login_at?: string
          logout_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "public_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      vehicle_conditions: {
        Row: {
          created_at: string
          display_name: string
          display_order: number | null
          id: string
          updated_at: string
          value: string
        }
        Insert: {
          created_at?: string
          display_name: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value: string
        }
        Update: {
          created_at?: string
          display_name?: string
          display_order?: number | null
          id?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      view_tracking_daily_stats: {
        Row: {
          created_at: string | null
          date: string
          fingerprint_blocked: number | null
          fingerprint_tracked: number | null
          id: string
          member_blocked: number | null
          member_tracked: number | null
          session_blocked: number | null
          session_tracked: number | null
          updated_at: string | null
          view_type: string
        }
        Insert: {
          created_at?: string | null
          date: string
          fingerprint_blocked?: number | null
          fingerprint_tracked?: number | null
          id?: string
          member_blocked?: number | null
          member_tracked?: number | null
          session_blocked?: number | null
          session_tracked?: number | null
          updated_at?: string | null
          view_type: string
        }
        Update: {
          created_at?: string | null
          date?: string
          fingerprint_blocked?: number | null
          fingerprint_tracked?: number | null
          id?: string
          member_blocked?: number | null
          member_tracked?: number | null
          session_blocked?: number | null
          session_tracked?: number | null
          updated_at?: string | null
          view_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      public_profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          dealer_name: string | null
          first_name: string | null
          id: string | null
          is_active: boolean | null
          is_dealer: boolean | null
          last_name: string | null
          location: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dealer_name?: string | null
          first_name?: string | null
          id?: string | null
          is_active?: boolean | null
          is_dealer?: boolean | null
          last_name?: string | null
          location?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          dealer_name?: string | null
          first_name?: string | null
          id?: string | null
          is_active?: boolean | null
          is_dealer?: boolean | null
          last_name?: string | null
          location?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      can_access_message_thread: {
        Args: { check_thread_id: string }
        Returns: boolean
      }
      claim_managed_profile: {
        Args: { profile_email: string }
        Returns: boolean
      }
      cleanup_abandoned_sessions: { Args: never; Returns: undefined }
      create_listing_snapshot: {
        Args: {
          p_body_style: string
          p_condition: string
          p_description: string
          p_engine: string
          p_exterior_color: string
          p_generation: string
          p_image_urls: string[]
          p_interior_color: string
          p_listing_id: string
          p_listing_type: string
          p_location_city: string
          p_location_state: string
          p_location_zip: string
          p_mileage: number
          p_model: string
          p_negotiable: boolean
          p_price: number
          p_title: string
          p_transmission: string
          p_used_type: string
          p_vehicle_condition: string
          p_video_url: string
          p_vin: string
          p_year: number
        }
        Returns: string
      }
      get_public_profile: {
        Args: { profile_id: string }
        Returns: {
          avatar_url: string
          bio: string
          created_at: string
          dealer_name: string
          first_name: string
          id: string
          is_active: boolean
          is_dealer: boolean
          last_name: string
          location: string
          updated_at: string
          website: string
        }[]
      }
      get_safe_profile: {
        Args: { profile_id: string }
        Returns: {
          address: string
          avatar_url: string
          bio: string
          contact_email: string
          created_at: string
          dealer_name: string
          first_name: string
          id: string
          is_active: boolean
          is_dealer: boolean
          last_login_at: string
          last_name: string
          location: string
          location_city: string
          location_state: string
          phone: string
          total_logins: number
          total_session_minutes: number
          updated_at: string
          website: string
          zip_code: string
        }[]
      }
      get_user_auth_emails: {
        Args: never
        Returns: {
          email: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_seller_active: { Args: { _seller_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "seller" | "buyer"
      listing_status:
        | "pending_new"
        | "pending_edited"
        | "approved"
        | "rejected"
        | "expired"
      offer_status: "pending" | "accepted" | "rejected" | "countered"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "seller", "buyer"],
      listing_status: [
        "pending_new",
        "pending_edited",
        "approved",
        "rejected",
        "expired",
      ],
      offer_status: ["pending", "accepted", "rejected", "countered"],
    },
  },
} as const
