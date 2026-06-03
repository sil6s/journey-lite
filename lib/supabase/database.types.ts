export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      admin_users: {
        Row: {
          email: string;
          role: "admin" | "superadmin";
          status: "active" | "disabled";
          invited_at: string | null;
          invited_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          email: string;
          role?: "admin" | "superadmin";
          status?: "active" | "disabled";
          invited_at?: string | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          email?: string;
          role?: "admin" | "superadmin";
          status?: "active" | "disabled";
          invited_at?: string | null;
          invited_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          email: string | null;
          role: "student" | "admin" | "provider";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          email?: string | null;
          role?: "student" | "admin" | "provider";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          email?: string | null;
          role?: "student" | "admin" | "provider";
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      enrollments: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          status: "active" | "completed" | "expired" | "revoked";
          enrolled_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          status?: "active" | "completed" | "expired" | "revoked";
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          status?: "active" | "completed" | "expired" | "revoked";
          enrolled_at?: string;
          completed_at?: string | null;
        };
        Relationships: [];
      };
      lesson_progress: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          module_slug: string | null;
          lesson_slug: string;
          completed: boolean;
          completed_at: string | null;
          last_viewed_at: string;
          percent_watched: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          module_slug?: string | null;
          lesson_slug: string;
          completed?: boolean;
          completed_at?: string | null;
          last_viewed_at?: string;
          percent_watched?: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          module_slug?: string | null;
          lesson_slug?: string;
          completed?: boolean;
          completed_at?: string | null;
          last_viewed_at?: string;
          percent_watched?: number;
        };
        Relationships: [];
      };
      course_access: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          access_type: "manual" | "free" | "paid" | "provider-assigned";
          expires_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          access_type?: "manual" | "free" | "paid" | "provider-assigned";
          expires_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          access_type?: "manual" | "free" | "paid" | "provider-assigned";
          expires_at?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      course_assignments: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          assigned_by: string | null;
          assigned_at: string;
          due_at: string | null;
          status: "assigned" | "in_progress" | "completed" | "overdue" | "revoked";
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          assigned_by?: string | null;
          assigned_at?: string;
          due_at?: string | null;
          status?: "assigned" | "in_progress" | "completed" | "overdue" | "revoked";
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          assigned_by?: string | null;
          assigned_at?: string;
          due_at?: string | null;
          status?: "assigned" | "in_progress" | "completed" | "overdue" | "revoked";
        };
        Relationships: [];
      };
      user_course_progress: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          section_title: string | null;
          lesson_slug: string;
          status: "not_started" | "in_progress" | "completed";
          completed_at: string | null;
          last_viewed_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          section_title?: string | null;
          lesson_slug: string;
          status?: "not_started" | "in_progress" | "completed";
          completed_at?: string | null;
          last_viewed_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          section_title?: string | null;
          lesson_slug?: string;
          status?: "not_started" | "in_progress" | "completed";
          completed_at?: string | null;
          last_viewed_at?: string;
        };
        Relationships: [];
      };
      user_lesson_events: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          event: string;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          event: string;
          metadata?: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          lesson_slug?: string;
          event?: string;
          metadata?: Json;
          created_at?: string;
        };
        Relationships: [];
      };
      user_quiz_attempts: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          score: number;
          passed: boolean;
          answers: Json;
          started_at: string;
          submitted_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          lesson_slug: string;
          score?: number;
          passed?: boolean;
          answers?: Json;
          started_at?: string;
          submitted_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          lesson_slug?: string;
          score?: number;
          passed?: boolean;
          answers?: Json;
          started_at?: string;
          submitted_at?: string | null;
        };
        Relationships: [];
      };
      completion_attestations: {
        Row: {
          id: string;
          user_id: string;
          course_slug: string;
          attested_at: string;
          ip_hash: string | null;
          user_agent: string | null;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          course_slug: string;
          attested_at?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          course_slug?: string;
          attested_at?: string;
          ip_hash?: string | null;
          user_agent?: string | null;
          metadata?: Json;
        };
        Relationships: [];
      };
      translation_cache: {
        Row: {
          id: string;
          source_document_id: string;
          source_document_type: string;
          source_revision_id: string | null;
          source_updated_at: string | null;
          source_slug: string;
          source_content_hash: string;
          locale: string;
          translated_title: string | null;
          translated_slug: string | null;
          translated_excerpt: string | null;
          translated_body: Json | null;
          translated_seo_title: string | null;
          translated_seo_description: string | null;
          translated_faqs: Json | null;
          translated_ctas: Json | null;
          translated_image_alts: Json | null;
          status: "pending" | "translating" | "complete" | "error" | "stale";
          error_message: string | null;
          translation_provider: string;
          generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_document_id: string;
          source_document_type: string;
          source_revision_id?: string | null;
          source_updated_at?: string | null;
          source_slug: string;
          source_content_hash: string;
          locale: string;
          translated_title?: string | null;
          translated_slug?: string | null;
          translated_excerpt?: string | null;
          translated_body?: Json | null;
          translated_seo_title?: string | null;
          translated_seo_description?: string | null;
          translated_faqs?: Json | null;
          translated_ctas?: Json | null;
          translated_image_alts?: Json | null;
          status?: "pending" | "translating" | "complete" | "error" | "stale";
          error_message?: string | null;
          translation_provider?: string;
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_document_id?: string;
          source_document_type?: string;
          source_revision_id?: string | null;
          source_updated_at?: string | null;
          source_slug?: string;
          source_content_hash?: string;
          locale?: string;
          translated_title?: string | null;
          translated_slug?: string | null;
          translated_excerpt?: string | null;
          translated_body?: Json | null;
          translated_seo_title?: string | null;
          translated_seo_description?: string | null;
          translated_faqs?: Json | null;
          translated_ctas?: Json | null;
          translated_image_alts?: Json | null;
          status?: "pending" | "translating" | "complete" | "error" | "stale";
          error_message?: string | null;
          translation_provider?: string;
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      form_submissions: {
        Row: {
          id: string;
          form_key: string;
          form_name: string | null;
          page_slug: string | null;
          status: "new" | "reviewed" | "contacted" | "closed" | "spam";
          submitted_at: string;
          data: Json;
          metadata: Json;
          admin_notes: string | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          form_key: string;
          form_name?: string | null;
          page_slug?: string | null;
          status?: "new" | "reviewed" | "contacted" | "closed" | "spam";
          submitted_at?: string;
          data?: Json;
          metadata?: Json;
          admin_notes?: string | null;
          updated_at?: string;
        };
        Update: {
          id?: string;
          form_key?: string;
          form_name?: string | null;
          page_slug?: string | null;
          status?: "new" | "reviewed" | "contacted" | "closed" | "spam";
          submitted_at?: string;
          data?: Json;
          metadata?: Json;
          admin_notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      translation_cache: {
        Row: {
          id: string;
          source_document_id: string;
          source_document_type: string;
          source_revision_id: string | null;
          source_updated_at: string | null;
          source_slug: string;
          source_content_hash: string;
          locale: string;
          translated_title: string | null;
          translated_slug: string | null;
          translated_excerpt: string | null;
          translated_body: Json | null;
          translated_seo_title: string | null;
          translated_seo_description: string | null;
          translated_faqs: Json | null;
          translated_ctas: Json | null;
          translated_image_alts: Json | null;
          status: "pending" | "translating" | "complete" | "error" | "stale";
          error_message: string | null;
          translation_provider: string;
          generated_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          source_document_id: string;
          source_document_type: string;
          source_revision_id?: string | null;
          source_updated_at?: string | null;
          source_slug: string;
          source_content_hash: string;
          locale: string;
          translated_title?: string | null;
          translated_slug?: string | null;
          translated_excerpt?: string | null;
          translated_body?: Json | null;
          translated_seo_title?: string | null;
          translated_seo_description?: string | null;
          translated_faqs?: Json | null;
          translated_ctas?: Json | null;
          translated_image_alts?: Json | null;
          status?: "pending" | "translating" | "complete" | "error" | "stale";
          error_message?: string | null;
          translation_provider?: string;
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          source_document_id?: string;
          source_document_type?: string;
          source_revision_id?: string | null;
          source_updated_at?: string | null;
          source_slug?: string;
          source_content_hash?: string;
          locale?: string;
          translated_title?: string | null;
          translated_slug?: string | null;
          translated_excerpt?: string | null;
          translated_body?: Json | null;
          translated_seo_title?: string | null;
          translated_seo_description?: string | null;
          translated_faqs?: Json | null;
          translated_ctas?: Json | null;
          translated_image_alts?: Json | null;
          status?: "pending" | "translating" | "complete" | "error" | "stale";
          error_message?: string | null;
          translation_provider?: string;
          generated_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      reset_user_progress: {
        Args: { p_user_id: string };
        Returns: undefined;
      };
      get_translation: {
        Args: { p_document_id: string; p_locale: string };
        Returns: Database["public"]["Tables"]["translation_cache"]["Row"];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
