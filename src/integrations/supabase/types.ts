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
      alertas: {
        Row: {
          animal_id: string
          created_at: string | null
          data: string
          descricao: string
          id: string
          status: string
          tipo: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          status: string
          tipo: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          status?: string
          tipo?: string
        }
        Relationships: [
          {
            foreignKeyName: "alertas_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
        ]
      }
      animais: {
        Row: {
          created_at: string | null
          data_nascimento: string
          id: string
          nome: string | null
          numero: string
          raca: string
          status: string
        }
        Insert: {
          created_at?: string | null
          data_nascimento: string
          id?: string
          nome?: string | null
          numero: string
          raca: string
          status: string
        }
        Update: {
          created_at?: string | null
          data_nascimento?: string
          id?: string
          nome?: string | null
          numero?: string
          raca?: string
          status?: string
        }
        Relationships: []
      }
      dados_nutricao: {
        Row: {
          animal_id: string
          created_at: string | null
          data: string
          id: string
          observacoes: string | null
          quantidade: number
          racao: string
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          data: string
          id?: string
          observacoes?: string | null
          quantidade: number
          racao: string
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          data?: string
          id?: string
          observacoes?: string | null
          quantidade?: number
          racao?: string
        }
        Relationships: [
          {
            foreignKeyName: "dados_nutricao_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
            referencedColumns: ["id"]
          },
        ]
      }
      farm_profiles: {
        Row: {
          city: string
          created_at: string | null
          farm_name: string
          id: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string | null
          farm_name: string
          id?: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string | null
          farm_name?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      registros_financeiros: {
        Row: {
          categoria: string
          created_at: string | null
          data: string
          descricao: string
          id: string
          tipo: string
          valor: number
        }
        Insert: {
          categoria: string
          created_at?: string | null
          data: string
          descricao: string
          id?: string
          tipo: string
          valor: number
        }
        Update: {
          categoria?: string
          created_at?: string | null
          data?: string
          descricao?: string
          id?: string
          tipo?: string
          valor?: number
        }
        Relationships: []
      }
      registros_leite: {
        Row: {
          animal_id: string
          created_at: string | null
          data: string
          id: string
          periodo: string
          quantidade: number
        }
        Insert: {
          animal_id: string
          created_at?: string | null
          data: string
          id?: string
          periodo: string
          quantidade: number
        }
        Update: {
          animal_id?: string
          created_at?: string | null
          data?: string
          id?: string
          periodo?: string
          quantidade?: number
        }
        Relationships: [
          {
            foreignKeyName: "registros_leite_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animais"
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
