// =============================================================================
// Settlr – Supabase Database Types
// Copied from Phase 1 generated file. Regenerate with:
//   npx supabase gen types typescript --project-id <ref>
// =============================================================================

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      amenities: {
        Row: {
          id: string
          name: string
          icon: string | null
        }
        Insert: {
          id?: string
          name: string
          icon?: string | null
        }
        Update: {
          id?: string
          name?: string
          icon?: string | null
        }
        Relationships: []
      }
      cities: {
        Row: {
          id: string
          name: string
          state: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          state: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          state?: string
          created_at?: string
        }
        Relationships: []
      }
      coaching_details: {
        Row: {
          listing_id: string
          subjects: string[] | null
          batches: string[] | null
          medium: string | null
          fee_per_month: number | null
          established_year: number | null
          total_students: number | null
          faculty_count: number | null
          has_demo_class: boolean
          has_online_classes: boolean
        }
        Insert: {
          listing_id: string
          subjects?: string[] | null
          batches?: string[] | null
          medium?: string | null
          fee_per_month?: number | null
          established_year?: number | null
          total_students?: number | null
          faculty_count?: number | null
          has_demo_class?: boolean
          has_online_classes?: boolean
        }
        Update: {
          listing_id?: string
          subjects?: string[] | null
          batches?: string[] | null
          medium?: string | null
          fee_per_month?: number | null
          established_year?: number | null
          total_students?: number | null
          faculty_count?: number | null
          has_demo_class?: boolean
          has_online_classes?: boolean
        }
        Relationships: [
          {
            foreignKeyName: 'coaching_details_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      favorites: {
        Row: {
          id: string
          user_id: string
          listing_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          listing_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          listing_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'favorites_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'favorites_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      hostel_details: {
        Row: {
          listing_id: string
          gender: Database['public']['Enums']['hostel_gender']
          total_rooms: number | null
          rent_min: number | null
          rent_max: number | null
          food_included: boolean
          warden_name: string | null
          warden_phone: string | null
        }
        Insert: {
          listing_id: string
          gender: Database['public']['Enums']['hostel_gender']
          total_rooms?: number | null
          rent_min?: number | null
          rent_max?: number | null
          food_included?: boolean
          warden_name?: string | null
          warden_phone?: string | null
        }
        Update: {
          listing_id?: string
          gender?: Database['public']['Enums']['hostel_gender']
          total_rooms?: number | null
          rent_min?: number | null
          rent_max?: number | null
          food_included?: boolean
          warden_name?: string | null
          warden_phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'hostel_details_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      lead_events: {
        Row: {
          id: string
          listing_id: string
          user_id: string | null
          event_type: Database['public']['Enums']['lead_event_type']
          metadata: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id?: string | null
          event_type: Database['public']['Enums']['lead_event_type']
          metadata?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string | null
          event_type?: Database['public']['Enums']['lead_event_type']
          metadata?: Json | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'lead_events_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      listing_amenities: {
        Row: {
          listing_id: string
          amenity_id: string
        }
        Insert: {
          listing_id: string
          amenity_id: string
        }
        Update: {
          listing_id?: string
          amenity_id?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listing_amenities_amenity_id_fkey'
            columns: ['amenity_id']
            referencedRelation: 'amenities'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'listing_amenities_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      listing_images: {
        Row: {
          id: string
          listing_id: string
          url: string
          storage_path: string
          is_primary: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          url: string
          storage_path: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          url?: string
          storage_path?: string
          is_primary?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listing_images_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      listing_views: {
        Row: {
          id: string
          listing_id: string
          user_id: string | null
          anonymous_id: string | null
          device_type: string | null
          created_at: string
          last_viewed_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id?: string | null
          anonymous_id?: string | null
          device_type?: string | null
          created_at?: string
          last_viewed_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string | null
          anonymous_id?: string | null
          device_type?: string | null
          created_at?: string
          last_viewed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listing_views_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'listing_views_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      listings: {
        Row: {
          id: string
          type: Database['public']['Enums']['listing_type']
          city_id: string
          name: string
          slug: string
          area: string | null
          address: string | null
          phone: string | null
          whatsapp: string | null
          website_url: string | null
          description: string | null
          plan_tier: Database['public']['Enums']['plan_tier']
          is_active: boolean
          is_verified: boolean
          rating: number
          review_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          type: Database['public']['Enums']['listing_type']
          city_id: string
          name: string
          slug: string
          area?: string | null
          address?: string | null
          phone?: string | null
          whatsapp?: string | null
          website_url?: string | null
          description?: string | null
          plan_tier?: Database['public']['Enums']['plan_tier']
          is_active?: boolean
          is_verified?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          type?: Database['public']['Enums']['listing_type']
          city_id?: string
          name?: string
          slug?: string
          area?: string | null
          address?: string | null
          phone?: string | null
          whatsapp?: string | null
          website_url?: string | null
          description?: string | null
          plan_tier?: Database['public']['Enums']['plan_tier']
          is_active?: boolean
          is_verified?: boolean
          rating?: number
          review_count?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'listings_city_id_fkey'
            columns: ['city_id']
            referencedRelation: 'cities'
            referencedColumns: ['id']
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          role: Database['public']['Enums']['user_role']
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id: string
          role?: Database['public']['Enums']['user_role']
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          role?: Database['public']['Enums']['user_role']
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          id: string
          listing_id: string
          user_id: string
          rating: number
          title: string | null
          body: string | null
          is_anonymous: boolean
          is_verified: boolean
          recommend: boolean | null
          helpful_count: number
          is_approved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          listing_id: string
          user_id: string
          rating: number
          title?: string | null
          body?: string | null
          is_anonymous?: boolean
          is_verified?: boolean
          recommend?: boolean | null
          helpful_count?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          listing_id?: string
          user_id?: string
          rating?: number
          title?: string | null
          body?: string | null
          is_anonymous?: boolean
          is_verified?: boolean
          recommend?: boolean | null
          helpful_count?: number
          is_approved?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'reviews_listing_id_fkey'
            columns: ['listing_id']
            referencedRelation: 'listings'
            referencedColumns: ['id']
          }
        ]
      }
      review_helpful_votes: {
        Row: {
          id: string
          review_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'review_helpful_votes_review_id_fkey'
            columns: ['review_id']
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_helpful_votes_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
      review_reports: {
        Row: {
          id: string
          review_id: string
          user_id: string
          reason: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          review_id: string
          user_id: string
          reason: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          review_id?: string
          user_id?: string
          reason?: string
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'review_reports_review_id_fkey'
            columns: ['review_id']
            referencedRelation: 'reviews'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'review_reports_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: Record<string, never>
    Functions: {
      create_listing_with_details: {
        Args: { payload: Json }
        Returns: string
      }
      update_listing_with_details: {
        Args: { payload: Json }
        Returns: undefined
      }
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      record_listing_view: {
        Args: {
          p_listing_id: string
          p_user_id: string | null
          p_anonymous_id: string | null
          p_device_type: string | null
        }
        Returns: undefined
      }
    }
    Enums: {
      hostel_gender: 'male' | 'female' | 'co_ed'
      lead_event_type: 'view' | 'call_click' | 'whatsapp_click' | 'direction_click' | 'website_click' | 'share_click'
      listing_type: 'coaching' | 'hostel'
      plan_tier: 'free' | 'paid'
      user_role: 'student' | 'admin'
    }
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']

export type Enums<T extends keyof Database['public']['Enums']> =
  Database['public']['Enums'][T]
