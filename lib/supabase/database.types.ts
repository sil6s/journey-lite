export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
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
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
