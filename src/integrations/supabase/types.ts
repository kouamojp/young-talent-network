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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      account_links: {
        Row: {
          created_at: string
          id: string
          last_synced_at: string | null
          linked_user_id: string
          owner_user_id: string
          status: string
          sync_fields: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          linked_user_id: string
          owner_user_id: string
          status?: string
          sync_fields?: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          last_synced_at?: string | null
          linked_user_id?: string
          owner_user_id?: string
          status?: string
          sync_fields?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      advertisements: {
        Row: {
          clicks_count: number
          created_at: string
          created_by: string | null
          description: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          is_active: boolean
          link_url: string | null
          placement: string
          starts_at: string
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          starts_at?: string
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          clicks_count?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          link_url?: string | null
          placement?: string
          starts_at?: string
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: []
      }
      agent_organization_memberships: {
        Row: {
          agent_id: string
          created_at: string
          id: string
          joined_at: string | null
          organization_id: string
          role: string | null
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          id?: string
          joined_at?: string | null
          organization_id: string
          role?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          id?: string
          joined_at?: string | null
          organization_id?: string
          role?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_organization_memberships_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_organization_memberships_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_organization_memberships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organization_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_profiles: {
        Row: {
          agency_name: string
          avatar_url: string | null
          bio: string | null
          category: string | null
          clients_represented: number | null
          commission_rate: number | null
          created_at: string
          deals_completed: number | null
          email: string | null
          id: string
          license_number: string | null
          location: string | null
          phone: string | null
          services: string[] | null
          specialization: string[] | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          agency_name: string
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          clients_represented?: number | null
          commission_rate?: number | null
          created_at?: string
          deals_completed?: number | null
          email?: string | null
          id?: string
          license_number?: string | null
          location?: string | null
          phone?: string | null
          services?: string[] | null
          specialization?: string[] | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          agency_name?: string
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          clients_represented?: number | null
          commission_rate?: number | null
          created_at?: string
          deals_completed?: number | null
          email?: string | null
          id?: string
          license_number?: string | null
          location?: string | null
          phone?: string | null
          services?: string[] | null
          specialization?: string[] | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_suggestions: {
        Row: {
          acted_on: boolean
          action_data: Json | null
          action_link: string | null
          created_at: string
          description: string | null
          dismissed: boolean
          expires_at: string | null
          id: string
          suggestion_type: string
          title: string
          user_id: string
        }
        Insert: {
          acted_on?: boolean
          action_data?: Json | null
          action_link?: string | null
          created_at?: string
          description?: string | null
          dismissed?: boolean
          expires_at?: string | null
          id?: string
          suggestion_type?: string
          title: string
          user_id: string
        }
        Update: {
          acted_on?: boolean
          action_data?: Json | null
          action_link?: string | null
          created_at?: string
          description?: string | null
          dismissed?: boolean
          expires_at?: string | null
          id?: string
          suggestion_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      agent_talent_contracts: {
        Row: {
          agent_id: string
          commission_rate: number | null
          contract_duration_months: number | null
          created_at: string
          end_date: string | null
          id: string
          start_date: string | null
          status: string
          talent_id: string
          terms: string | null
          updated_at: string
        }
        Insert: {
          agent_id: string
          commission_rate?: number | null
          contract_duration_months?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          talent_id: string
          terms?: string | null
          updated_at?: string
        }
        Update: {
          agent_id?: string
          commission_rate?: number | null
          contract_duration_months?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          start_date?: string | null
          status?: string
          talent_id?: string
          terms?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_talent_contracts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_talent_contracts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_talent_contracts_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_talent_contracts_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_search_history: {
        Row: {
          created_at: string
          id: string
          query: string
          results: Json | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          query: string
          results?: Json | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          query?: string
          results?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      assistant_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role?: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          name_fr: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          name_fr?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          name_fr?: string | null
        }
        Relationships: []
      }
      coin_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          reason: string
          user_id: string
          xp_earned: number
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          reason: string
          user_id: string
          xp_earned?: number
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          reason?: string
          user_id?: string
          xp_earned?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          created_at: string
          id: string
          post_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          post_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          post_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      communities: {
        Row: {
          created_at: string
          creator_id: string
          description: string | null
          id: string
          image_url: string | null
          is_private: boolean | null
          members_count: number | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          members_count?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_private?: boolean | null
          members_count?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communities_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "community_members_community_id_fkey"
            columns: ["community_id"]
            isOneToOne: false
            referencedRelation: "communities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "community_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          connected_user_id: string
          created_at: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          connected_user_id: string
          created_at?: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          connected_user_id?: string
          created_at?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_connected_user_id_fkey"
            columns: ["connected_user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connections_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_group: boolean
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_group?: boolean
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      course_enrollments: {
        Row: {
          completed: boolean | null
          course_id: string
          enrolled_at: string
          id: string
          progress: number | null
          student_id: string
        }
        Insert: {
          completed?: boolean | null
          course_id: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id: string
        }
        Update: {
          completed?: boolean | null
          course_id?: string
          enrolled_at?: string
          id?: string
          progress?: number | null
          student_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          duration_hours: number | null
          id: string
          instructor_id: string
          level: string | null
          price: number | null
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id: string
          level?: string | null
          price?: number | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string
          level?: string | null
          price?: number | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "courses_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      event_attendees: {
        Row: {
          created_at: string
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_attendees_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "event_attendees_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          attendees_count: number | null
          capacity: number | null
          category_id: string | null
          created_at: string
          description: string | null
          end_date: string
          id: string
          image_url: string | null
          is_virtual: boolean | null
          latitude: number | null
          location: string | null
          longitude: number | null
          organizer_id: string
          start_date: string
          status: string
          subcategory_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          attendees_count?: number | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organizer_id: string
          start_date: string
          status?: string
          subcategory_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          attendees_count?: number | null
          capacity?: number | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          end_date?: string
          id?: string
          image_url?: string | null
          is_virtual?: boolean | null
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          organizer_id?: string
          start_date?: string
          status?: string
          subcategory_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "yat_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "events_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "yat_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      job_applications: {
        Row: {
          applicant_id: string
          cover_letter: string | null
          created_at: string
          id: string
          job_id: string
          resume_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          applicant_id: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          applicant_id?: string
          cover_letter?: string | null
          created_at?: string
          id?: string
          job_id?: string
          resume_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_applicant_id_fkey"
            columns: ["applicant_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_postings"
            referencedColumns: ["id"]
          },
        ]
      }
      job_postings: {
        Row: {
          application_deadline: string | null
          benefits: string[] | null
          created_at: string
          description: string
          id: string
          job_type: string | null
          location: string | null
          organization_id: string
          requirements: string[] | null
          salary_range: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          application_deadline?: string | null
          benefits?: string[] | null
          created_at?: string
          description: string
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id: string
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          application_deadline?: string | null
          benefits?: string[] | null
          created_at?: string
          description?: string
          id?: string
          job_type?: string | null
          location?: string | null
          organization_id?: string
          requirements?: string[] | null
          salary_range?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_postings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      live_streams: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          is_live: boolean | null
          started_at: string | null
          stream_key: string | null
          streamer_id: string
          thumbnail_url: string | null
          title: string
          viewer_count: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          stream_key?: string | null
          streamer_id: string
          thumbnail_url?: string | null
          title: string
          viewer_count?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          is_live?: boolean | null
          started_at?: string | null
          stream_key?: string | null
          streamer_id?: string
          thumbnail_url?: string | null
          title?: string
          viewer_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "live_streams_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "live_streams_streamer_id_fkey"
            columns: ["streamer_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_listings: {
        Row: {
          category: string
          condition: string | null
          created_at: string
          currency: string
          description: string | null
          id: string
          likes_count: number
          location: string | null
          media_urls: string[] | null
          original_price: number | null
          price: number
          status: string
          stock_status: string
          title: string
          type: string
          updated_at: string
          user_id: string
          views_count: number
        }
        Insert: {
          category?: string
          condition?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          likes_count?: number
          location?: string | null
          media_urls?: string[] | null
          original_price?: number | null
          price?: number
          status?: string
          stock_status?: string
          title: string
          type?: string
          updated_at?: string
          user_id: string
          views_count?: number
        }
        Update: {
          category?: string
          condition?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          id?: string
          likes_count?: number
          location?: string | null
          media_urls?: string[] | null
          original_price?: number | null
          price?: number
          status?: string
          stock_status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
          views_count?: number
        }
        Relationships: []
      }
      media_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_comments_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "talent_media"
            referencedColumns: ["id"]
          },
        ]
      }
      media_likes: {
        Row: {
          created_at: string
          id: string
          media_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          media_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          media_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "media_likes_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "talent_media"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          forwarded_from_id: string | null
          id: string
          media_type: string | null
          media_url: string | null
          read: boolean | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          forwarded_from_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          read?: boolean | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          forwarded_from_id?: string | null
          id?: string
          media_type?: string | null
          media_url?: string | null
          read?: boolean | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
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
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          link: string | null
          message: string | null
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          link?: string | null
          message?: string | null
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_profiles: {
        Row: {
          company_name: string
          company_size: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          headquarters: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          logo_url: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website_url: string | null
        }
        Insert: {
          company_name: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website_url?: string | null
        }
        Update: {
          company_name?: string
          company_size?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          headquarters?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "organization_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      page_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          page_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          page_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          page_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      page_likes: {
        Row: {
          created_at: string
          id: string
          page_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          page_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          page_id?: string
          user_id?: string
        }
        Relationships: []
      }
      post_drafts: {
        Row: {
          category: string | null
          content: string | null
          created_at: string
          draft_type: string
          id: string
          media_urls: string[] | null
          poll_options: string[] | null
          poll_question: string | null
          scheduled_for: string | null
          title: string | null
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string
          draft_type?: string
          id?: string
          media_urls?: string[] | null
          poll_options?: string[] | null
          poll_question?: string | null
          scheduled_for?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string
          draft_type?: string
          id?: string
          media_urls?: string[] | null
          poll_options?: string[] | null
          poll_question?: string | null
          scheduled_for?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      post_likes: {
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
            foreignKeyName: "post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_published: boolean
          likes_count: number | null
          media_urls: string[] | null
          scheduled_for: string | null
          share_token: string | null
          status: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_published?: boolean
          likes_count?: number | null
          media_urls?: string[] | null
          scheduled_for?: string | null
          share_token?: string | null
          status?: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_published?: boolean
          likes_count?: number | null
          media_urls?: string[] | null
          scheduled_for?: string | null
          share_token?: string | null
          status?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "posts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profile_sources: {
        Row: {
          auto_sync: boolean
          created_at: string
          error_message: string | null
          extracted_data: Json | null
          id: string
          label: string | null
          last_synced_at: string | null
          source_type: string
          status: string
          updated_at: string
          url: string
          user_id: string
        }
        Insert: {
          auto_sync?: boolean
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          label?: string | null
          last_synced_at?: string | null
          source_type?: string
          status?: string
          updated_at?: string
          url: string
          user_id: string
        }
        Update: {
          auto_sync?: boolean
          created_at?: string
          error_message?: string | null
          extracted_data?: Json | null
          id?: string
          label?: string | null
          last_synced_at?: string | null
          source_type?: string
          status?: string
          updated_at?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          category_id: string | null
          city: string | null
          country: string | null
          cover_photo_url: string | null
          created_at: string
          email: string
          id: string
          latitude: number | null
          location: string | null
          longitude: number | null
          name: string
          phone: string | null
          platform_rating: number | null
          rating_count: number | null
          sport_type: string | null
          updated_at: string
          user_type: string
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          category_id?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email: string
          id: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name: string
          phone?: string | null
          platform_rating?: number | null
          rating_count?: number | null
          sport_type?: string | null
          updated_at?: string
          user_type: string
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          category_id?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string
          email?: string
          id?: string
          latitude?: number | null
          location?: string | null
          longitude?: number | null
          name?: string
          phone?: string | null
          platform_rating?: number | null
          rating_count?: number | null
          sport_type?: string | null
          updated_at?: string
          user_type?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      stories: {
        Row: {
          background_color: string | null
          created_at: string
          expires_at: string
          id: string
          media_items: Json
          media_url: string | null
          text_overlay: string | null
          user_id: string
          views_count: number | null
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_items?: Json
          media_url?: string | null
          text_overlay?: string | null
          user_id: string
          views_count?: number | null
        }
        Update: {
          background_color?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          media_items?: Json
          media_url?: string | null
          text_overlay?: string | null
          user_id?: string
          views_count?: number | null
        }
        Relationships: []
      }
      story_comments: {
        Row: {
          content: string
          created_at: string
          id: string
          story_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          story_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          story_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_comments_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "stories"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_achievements: {
        Row: {
          category: string | null
          created_at: string
          date: string | null
          description: string | null
          id: string
          level: string | null
          title: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          level?: string | null
          title: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          date?: string | null
          description?: string | null
          id?: string
          level?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_education: {
        Row: {
          created_at: string
          degree: string | null
          description: string | null
          education_type: string
          end_year: number | null
          field_of_study: string | null
          id: string
          institution: string
          is_current: boolean | null
          start_year: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          degree?: string | null
          description?: string | null
          education_type?: string
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution: string
          is_current?: boolean | null
          start_year?: number | null
          user_id: string
        }
        Update: {
          created_at?: string
          degree?: string | null
          description?: string | null
          education_type?: string
          end_year?: number | null
          field_of_study?: string | null
          id?: string
          institution?: string
          is_current?: boolean | null
          start_year?: number | null
          user_id?: string
        }
        Relationships: []
      }
      talent_media: {
        Row: {
          created_at: string
          description: string | null
          id: string
          media_type: string
          title: string | null
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          media_type: string
          title?: string | null
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          media_type?: string
          title?: string | null
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_presence: {
        Row: {
          bio: string | null
          created_at: string
          featured: boolean | null
          id: string
          is_active: boolean | null
          section: string
          skills: string[] | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          bio?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          section: string
          skills?: string[] | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          bio?: string | null
          created_at?: string
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          section?: string
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: []
      }
      talent_profiles: {
        Row: {
          availability: string | null
          certifications: string[] | null
          created_at: string
          experience_years: number | null
          hourly_rate: number | null
          id: string
          languages: string[] | null
          portfolio_url: string | null
          resume_url: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: string | null
          certifications?: string[] | null
          created_at?: string
          experience_years?: number | null
          hourly_rate?: number | null
          id?: string
          languages?: string[] | null
          portfolio_url?: string | null
          resume_url?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_ratings: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          rater_id: string
          rating: number
          talent_id: string
          updated_at: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          rater_id: string
          rating: number
          talent_id: string
          updated_at?: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          rater_id?: string
          rating?: number
          talent_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_ratings_rater_id_fkey"
            columns: ["rater_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_ratings_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "talent_ratings_talent_id_fkey"
            columns: ["talent_id"]
            isOneToOne: false
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_resumes: {
        Row: {
          achievements: string[] | null
          category_id: string | null
          created_at: string
          description: string | null
          experience: string | null
          id: string
          is_primary: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          achievements?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          is_primary?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          achievements?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          experience?: string | null
          id?: string
          is_primary?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "talent_resumes_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      talent_social_links: {
        Row: {
          created_at: string
          id: string
          platform: string
          url: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          url: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          url?: string
          user_id?: string
        }
        Relationships: []
      }
      talent_sport_profiles: {
        Row: {
          created_at: string
          data: Json
          id: string
          is_public: boolean
          sport: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          sport: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          is_public?: boolean
          sport?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_name: string
          badge_type: string
          description: string | null
          earned_at: string
          icon: string | null
          id: string
          user_id: string
        }
        Insert: {
          badge_name: string
          badge_type: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          user_id: string
        }
        Update: {
          badge_name?: string
          badge_type?: string
          description?: string | null
          earned_at?: string
          icon?: string | null
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_categories: {
        Row: {
          category_name: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          category_name: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          category_name?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      user_interests: {
        Row: {
          created_at: string
          id: string
          interest_type: string
          interest_value: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interest_type: string
          interest_value: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interest_type?: string
          interest_value?: string
          user_id?: string
        }
        Relationships: []
      }
      user_levels: {
        Row: {
          card_background: string | null
          created_at: string
          id: string
          level: number
          updated_at: string
          user_id: string
          xp_total: number
          yat_coins: number
        }
        Insert: {
          card_background?: string | null
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          user_id: string
          xp_total?: number
          yat_coins?: number
        }
        Update: {
          card_background?: string | null
          created_at?: string
          id?: string
          level?: number
          updated_at?: string
          user_id?: string
          xp_total?: number
          yat_coins?: number
        }
        Relationships: []
      }
      user_pages: {
        Row: {
          category: string | null
          comments_count: number
          content: string | null
          created_at: string
          id: string
          is_public: boolean | null
          likes_count: number
          share_token: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string
        }
        Insert: {
          category?: string | null
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number
          share_token?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string
        }
        Update: {
          category?: string | null
          comments_count?: number
          content?: string | null
          created_at?: string
          id?: string
          is_public?: boolean | null
          likes_count?: number
          share_token?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_skills: {
        Row: {
          created_at: string
          id: string
          level: string | null
          skill_id: string
          user_id: string
          years_experience: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          level?: string | null
          skill_id: string
          user_id: string
          years_experience?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string | null
          skill_id?: string
          user_id?: string
          years_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_skills_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      user_yat_categories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          subcategory_id: string | null
          user_id: string
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          subcategory_id?: string | null
          user_id: string
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          subcategory_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_yat_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "yat_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_yat_categories_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "yat_subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      yat_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          name_en: string
          name_fr: string
          name_ru: string
          slug: string
          sort_order: number
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_en: string
          name_fr: string
          name_ru: string
          slug: string
          sort_order?: number
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          name_en?: string
          name_fr?: string
          name_ru?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      yat_subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          name_en: string
          name_fr: string
          name_ru: string
          slug: string
          sort_order: number
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          name_en: string
          name_fr: string
          name_ru: string
          slug: string
          sort_order?: number
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          name_en?: string
          name_fr?: string
          name_ru?: string
          slug?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "yat_subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "yat_categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      agent_profiles_public: {
        Row: {
          agency_name: string | null
          avatar_url: string | null
          bio: string | null
          category: string | null
          clients_represented: number | null
          commission_rate: number | null
          created_at: string | null
          deals_completed: number | null
          email: string | null
          id: string | null
          license_number: string | null
          location: string | null
          phone: string | null
          services: string[] | null
          specialization: string[] | null
          updated_at: string | null
          user_id: string | null
          verified: boolean | null
          website: string | null
        }
        Insert: {
          agency_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          clients_represented?: number | null
          commission_rate?: number | null
          created_at?: string | null
          deals_completed?: number | null
          email?: string | null
          id?: string | null
          license_number?: never
          location?: string | null
          phone?: string | null
          services?: string[] | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          agency_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          category?: string | null
          clients_represented?: number | null
          commission_rate?: number | null
          created_at?: string | null
          deals_completed?: number | null
          email?: string | null
          id?: string | null
          license_number?: never
          location?: string | null
          phone?: string | null
          services?: string[] | null
          specialization?: string[] | null
          updated_at?: string | null
          user_id?: string | null
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles_public"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles_public: {
        Row: {
          avatar_url: string | null
          bio: string | null
          birthday: string | null
          category_id: string | null
          city: string | null
          country: string | null
          cover_photo_url: string | null
          created_at: string | null
          email: string | null
          id: string | null
          location: string | null
          name: string | null
          phone: string | null
          platform_rating: number | null
          rating_count: number | null
          sport_type: string | null
          updated_at: string | null
          user_type: string | null
          website: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          category_id?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          location?: string | null
          name?: string | null
          phone?: never
          platform_rating?: number | null
          rating_count?: number | null
          sport_type?: string | null
          updated_at?: string | null
          user_type?: string | null
          website?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          birthday?: string | null
          category_id?: string | null
          city?: string | null
          country?: string | null
          cover_photo_url?: string | null
          created_at?: string | null
          email?: never
          id?: string | null
          location?: string | null
          name?: string | null
          phone?: never
          platform_rating?: number | null
          rating_count?: number | null
          sport_type?: string | null
          updated_at?: string | null
          user_type?: string | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      create_conversation_with_participant: {
        Args: { _other_user_id: string }
        Returns: string
      }
      create_group_conversation: {
        Args: { _name: string; _user_ids: string[] }
        Returns: string
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_ad_click: { Args: { _ad_id: string }; Returns: undefined }
      increment_ad_view: { Args: { _ad_id: string }; Returns: undefined }
      is_conversation_member: {
        Args: { _conversation_id: string; _user_id: string }
        Returns: boolean
      }
      sync_linked_account: { Args: { _link_id: string }; Returns: undefined }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
