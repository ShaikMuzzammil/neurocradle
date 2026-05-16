export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; full_name: string | null; avatar_url: string | null; updated_at: string }
        Insert: { id: string; full_name?: string | null; avatar_url?: string | null; updated_at?: string }
        Update: { id?: string; full_name?: string | null; avatar_url?: string | null; updated_at?: string }
      }
      hand_sessions: {
        Row: {
          id: string; user_id: string; session_data: Json; duration: number
          gesture_labels: string[]; thumbnail_url: string | null
          created_at: string; title: string | null
        }
        Insert: {
          id?: string; user_id: string; session_data: Json; duration: number
          gesture_labels?: string[]; thumbnail_url?: string | null; title?: string | null
        }
        Update: { duration?: number; gesture_labels?: string[]; thumbnail_url?: string | null }
      }
      contact_submissions: {
        Row: { id: string; name: string; email: string; subject: string | null; category: string; message: string; priority: string; created_at: string }
        Insert: { name: string; email: string; subject?: string | null; category: string; message: string; priority?: string }
        Update: {}
      }
      session_likes: {
        Row: { id: string; session_id: string; user_id: string; created_at: string }
        Insert: { session_id: string; user_id: string }
        Update: {}
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
  }
}
