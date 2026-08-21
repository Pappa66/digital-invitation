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
          checkin_token: string;
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
          checkin_token?: string;
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
          checkin_token?: string;
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
          revoked_at: string | null;
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
          revoked_at?: string | null;
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
          revoked_at?: string | null;
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
          template_id: string | null;
          name: string;
          whatsapp: string | null;
          email: string | null;
          note: string | null;
          status: string | null;
          project_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          template_name?: string | null;
          template_id?: string | null;
          name: string;
          whatsapp?: string | null;
          email?: string | null;
          note?: string | null;
          status?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          template_name?: string | null;
          template_id?: string | null;
          name?: string;
          whatsapp?: string | null;
          email?: string | null;
          note?: string | null;
          status?: string | null;
          project_id?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'orders_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
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
      finance_records: {
        Row: {
          id: string;
          project_id: string | null;
          client_name: string;
          design_name: string | null;
          base_price: number | null;
          discount: number | null;
          promo_code: string | null;
          promo_amount: number | null;
          final_price: number | null;
          payment_status: string | null;
          payment_amount: number | null;
          payment_date: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          project_id?: string | null;
          client_name: string;
          design_name?: string | null;
          base_price?: number | null;
          discount?: number | null;
          promo_code?: string | null;
          promo_amount?: number | null;
          final_price?: number | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          project_id?: string | null;
          client_name?: string;
          design_name?: string | null;
          base_price?: number | null;
          discount?: number | null;
          promo_code?: string | null;
          promo_amount?: number | null;
          final_price?: number | null;
          payment_status?: string | null;
          payment_amount?: number | null;
          payment_date?: string | null;
          notes?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'finance_records_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'];
          }
        ];
      };
      clients: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string | null;
          phone: string | null;
          project_id: string | null;
          design_name: string | null;
          status: 'aktual' | 'proses' | 'selesai';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email?: string | null;
          phone?: string | null;
          project_id?: string | null;
          design_name?: string | null;
          status?: 'aktual' | 'proses' | 'selesai';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string | null;
          phone?: string | null;
          project_id?: string | null;
          design_name?: string | null;
          status?: 'aktual' | 'proses' | 'selesai';
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'clients_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'],
          },
          {
            foreignKeyName: 'clients_project_id_fkey';
            columns: ['project_id'];
            referencedRelation: 'projects';
            referencedColumns: ['id'],
          }
        ];
      };
      operators: {
        Row: {
          id: string;
          user_id: string | null;
          email: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          email?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'operators_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'],
          }
        ];
      };
      template_demos: {
        Row: {
          template_id: string;
          demo_image: string | null;
          demo_link: string | null;
          demo_number: number | null;
          demo_name: string | null;
          updated_at: string;
        };
        Insert: {
          template_id: string;
          demo_image?: string | null;
          demo_link?: string | null;
          demo_number?: number | null;
          demo_name?: string | null;
          updated_at?: string;
        };
        Update: {
          template_id?: string;
          demo_image?: string | null;
          demo_link?: string | null;
          demo_number?: number | null;
          demo_name?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_internal: {
        Args: Record<PropertyKey, never>;
        Returns: boolean;
      };
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
      revoke_invite_token: {
        Args: { p_project_id: string };
        Returns: undefined;
      };
      get_guest_book_messages: {
        Args: { p_project_id: string };
        Returns: {
          id: string;
          name: string;
          message: string | null;
          created_at: string;
        }[];
      };
      get_invite_rsvps: {
        Args: { p_project_id: string; p_token: string };
        Returns: {
          id: string;
          name: string;
          attendance: string;
          guest_count: number;
          message: string | null;
          meal_choice: string | null;
          menu_options: Json | null;
          created_at: string;
        }[];
      };
      get_invite_checkins: {
        Args: { p_project_id: string; p_token: string };
        Returns: {
          id: string;
          name: string;
          guest_count: number;
          created_at: string;
        }[];
      };
      get_abs_project_meta: {
        Args: { p_project_id: string };
        Returns: {
          id: string;
          title: string;
          slug: string;
        }[];
      };
      record_checkin_from_token: {
        Args: { p_project_id: string; p_token: string };
        Returns: {
          ok: boolean;
          error: string | null;
          name: string | null;
          guest_count: number | null;
          created_at: string | null;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
