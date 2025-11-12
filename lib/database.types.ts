export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      announcements: {
        Row: {
          id: string
          user_id: string | null
          type: string | null
          title: string
          description: string | null
          progress: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          type?: string | null
          title: string
          description?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          type?: string | null
          title?: string
          description?: string | null
          progress?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          // Example if you have a profiles table with primary key id
          // { foreignKeyName: "announcements_user_id_fkey", columns: ["user_id"], referencedRelation: "profiles", referencedColumns: ["id"] },
        ]
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}
