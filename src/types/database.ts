/**
 * Hand-maintained mirror of supabase/migrations/0001_init.sql.
 * Regenerate with:  npx supabase gen types typescript --project-id <ref> > src/types/database.ts
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          username: string;
          full_name: string | null;
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          username: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          username?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      boards: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          is_private: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          is_private?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          is_private?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      pins: {
        Row: {
          id: string;
          user_id: string;
          board_id: string | null;
          title: string | null;
          description: string | null;
          link: string | null;
          image_path: string;
          image_url: string;
          width: number;
          height: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          board_id?: string | null;
          title?: string | null;
          description?: string | null;
          link?: string | null;
          image_path: string;
          image_url: string;
          width: number;
          height: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          board_id?: string | null;
          title?: string | null;
          description?: string | null;
          link?: string | null;
          image_path?: string;
          image_url?: string;
          width?: number;
          height?: number;
          created_at?: string;
        };
        Relationships: [];
      };
      saves: {
        Row: {
          id: string;
          user_id: string;
          pin_id: string;
          board_id: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pin_id: string;
          board_id: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pin_id?: string;
          board_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      comments: {
        Row: {
          id: string;
          user_id: string;
          pin_id: string;
          body: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          pin_id: string;
          body: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          pin_id?: string;
          body?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      follows: {
        Row: {
          follower_id: string;
          following_id: string;
          created_at: string;
        };
        Insert: {
          follower_id: string;
          following_id: string;
          created_at?: string;
        };
        Update: {
          follower_id?: string;
          following_id?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
}

/* ---- Convenience row aliases used across the app ---- */

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type Board = Tables["boards"]["Row"];
export type Pin = Tables["pins"]["Row"];
export type Save = Tables["saves"]["Row"];
export type Comment = Tables["comments"]["Row"];
export type Follow = Tables["follows"]["Row"];

/** A pin joined with its author — the shape the feed and cards consume. */
export type PinWithAuthor = Pin & {
  author: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};

/** A comment joined with its author. */
export type CommentWithAuthor = Comment & {
  author: Pick<Profile, "id" | "username" | "full_name" | "avatar_url"> | null;
};
