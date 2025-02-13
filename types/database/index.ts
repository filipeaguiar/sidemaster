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
      guides: {
        Row: {
          created_at: string | null
          deck_archetype: string
          description: string | null
          format: string
          id: string
          release_date: string | null
          user_id: string
          version: string | null
        }
        Insert: {
          created_at?: string | null
          deck_archetype: string
          description?: string | null
          format: string
          id?: string
          release_date?: string | null
          user_id: string
          version?: string | null
        }
        Update: {
          created_at?: string | null
          deck_archetype?: string
          description?: string | null
          format?: string
          id?: string
          release_date?: string | null
          user_id?: string
          version?: string | null
        }
        Relationships: []
      }
      maindeck_cards: {
        Row: {
          card_name: string
          guide_id: string
          id: string
          quantity: number
        }
        Insert: {
          card_name: string
          guide_id: string
          id?: string
          quantity?: number
        }
        Update: {
          card_name?: string
          guide_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "maindeck_cards_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      side_in_cards: {
        Row: {
          card_name: string
          id: string
          quantity: number
          reason: string | null
          strategy_id: string
        }
        Insert: {
          card_name: string
          id?: string
          quantity?: number
          reason?: string | null
          strategy_id: string
        }
        Update: {
          card_name?: string
          id?: string
          quantity?: number
          reason?: string | null
          strategy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "side_in_cards_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      side_out_cards: {
        Row: {
          card_name: string
          id: string
          quantity: number
          reason: string | null
          strategy_id: string
        }
        Insert: {
          card_name: string
          id?: string
          quantity?: number
          reason?: string | null
          strategy_id: string
        }
        Update: {
          card_name?: string
          id?: string
          quantity?: number
          reason?: string | null
          strategy_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "side_out_cards_strategy_id_fkey"
            columns: ["strategy_id"]
            isOneToOne: false
            referencedRelation: "strategies"
            referencedColumns: ["id"]
          },
        ]
      }
      sideboard_cards: {
        Row: {
          card_name: string
          guide_id: string
          id: string
          quantity: number
        }
        Insert: {
          card_name: string
          guide_id: string
          id?: string
          quantity?: number
        }
        Update: {
          card_name?: string
          guide_id?: string
          id?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "sideboard_cards_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
      strategies: {
        Row: {
          general_strategy: string | null
          guide_id: string
          id: string
          opponent_deck_archetype: string
        }
        Insert: {
          general_strategy?: string | null
          guide_id: string
          id?: string
          opponent_deck_archetype: string
        }
        Update: {
          general_strategy?: string | null
          guide_id?: string
          id?: string
          opponent_deck_archetype?: string
        }
        Relationships: [
          {
            foreignKeyName: "strategies_guide_id_fkey"
            columns: ["guide_id"]
            isOneToOne: false
            referencedRelation: "guides"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
  | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
    Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
  ? R
  : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
    PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
    PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
  ? R
  : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Insert: infer I
  }
  ? I
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Insert: infer I
  }
  ? I
  : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
  | keyof PublicSchema["Tables"]
  | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
  : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
    Update: infer U
  }
  ? U
  : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
    Update: infer U
  }
  ? U
  : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
  | keyof PublicSchema["Enums"]
  | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
  ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
  : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
  | keyof PublicSchema["CompositeTypes"]
  | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
  ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
  : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never
