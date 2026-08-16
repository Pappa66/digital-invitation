export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          slug: string;
          status: 'draft' | 'published';
          thumbnail: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          slug: string;
          status?: 'draft' | 'published';
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          slug?: string;
          status?: 'draft' | 'published';
          thumbnail?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };
      project_designs: {
        Row: {
          id: string;
          project_id: string;
          canvas_data: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          canvas_data: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          canvas_data?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_designs_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      rsvps: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          attendance: 'hadir' | 'tidak' | 'ragu';
          guest_count: number;
          message: string | null;
          meal_choice: string | null;
          menu_options: { label: string; value: string }[] | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          attendance: 'hadir' | 'tidak' | 'ragu';
          guest_count?: number;
          message?: string | null;
          meal_choice?: string | null;
          menu_options?: { label: string; value: string }[] | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          attendance?: 'hadir' | 'tidak' | 'ragu';
          guest_count?: number;
          message?: string | null;
          meal_choice?: string | null;
          menu_options?: { label: string; value: string }[] | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'rsvps_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      checkins: {
        Row: {
          id: string;
          project_id: string;
          name: string;
          guest_count: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          name: string;
          guest_count?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          name?: string;
          guest_count?: number;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'checkins_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      access_tokens: {
        Row: {
          id: string;
          project_id: string;
          token: string;
          label: string;
          created_by: string | null;
          expires_at: string | null;
          last_used_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id: string;
          token: string;
          label?: string;
          created_by?: string | null;
          expires_at?: string | null;
          last_used_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string;
          token?: string;
          label?: string;
          created_by?: string | null;
          expires_at?: string | null;
          last_used_at?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'access_tokens_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
    orders: {
        Row: {
          id: string;
          template_name: string | null;
          name: string;
          whatsapp: string | null;
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_name?: string | null;
          name: string;
          whatsapp?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_name?: string | null;
          name?: string;
          whatsapp?: string | null;
          note?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      settings: {
        Row: {
          key: string;
          value: string | null;
          updated_at: string;
        };
        Insert: {
          key: string;
          value?: string | null;
          updated_at?: string;
        };
        Update: {
          key?: string;
          value?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      get_published_design: {
        Args: { p_slug: string };
        Returns: {
          project_id: string;
          title: string;
          canvas_data: Json;
        }[];
      };
      get_invite_by_token: {
        Args: { p_project_id: string; p_token: string };
        Returns: {
          project_id: string;
          title: string;
          slug: string;
        }[];
      };
      ensure_invite_token: {
        Args: { p_project_id: string; p_label?: string };
        Returns: {
          id: string;
          token: string;
          project_id: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}