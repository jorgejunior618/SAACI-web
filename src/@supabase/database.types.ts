export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      atividades: {
        Row: {
          aluno_id: string
          comprovante_caminho: string
          comprovante_hash: string
          comprovante_nome: string
          comprovante_tamanho: number
          comprovante_tipo: string
          created_at: string
          curso_id: string
          data_fim: string
          data_inicio: string
          id: string
          item_numero: number
          nome: string
          quantidade: number
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          aluno_id?: string
          comprovante_caminho: string
          comprovante_hash: string
          comprovante_nome: string
          comprovante_tamanho: number
          comprovante_tipo: string
          created_at?: string
          curso_id: string
          data_fim: string
          data_inicio: string
          id?: string
          item_numero: number
          nome: string
          quantidade: number
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          comprovante_caminho?: string
          comprovante_hash?: string
          comprovante_nome?: string
          comprovante_tamanho?: number
          comprovante_tipo?: string
          created_at?: string
          curso_id?: string
          data_fim?: string
          data_inicio?: string
          id?: string
          item_numero?: number
          nome?: string
          quantidade?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'atividades_curso_id_item_numero_fkey'
            columns: ['curso_id', 'item_numero']
            isOneToOne: false
            referencedRelation: 'itens_curso'
            referencedColumns: ['curso_id', 'numero']
          },
        ]
      }
      cursos: {
        Row: {
          campus: string
          carga_total_horas: number
          created_at: string
          grau: string
          id: string
          nome: string
          nome_busca: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          campus: string
          carga_total_horas: number
          created_at?: string
          grau: string
          id?: string
          nome: string
          nome_busca?: never
          updated_at?: string
        }
        Update: {
          campus?: string
          carga_total_horas?: number
          created_at?: string
          grau?: string
          id?: string
          nome?: string
          nome_busca?: never
          updated_at?: string
        }
        Relationships: []
      }
      itens_curso: {
        Row: {
          a_cada: number
          created_at: string
          curso_id: string
          horas: number
          id: string
          maximo_horas: number
          nome: string
          numero: number
          regra: string
          tipo_regra: string
          unidade: string
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          a_cada: number
          created_at?: string
          curso_id: string
          horas: number
          id?: string
          maximo_horas: number
          nome: string
          numero: number
          regra: string
          tipo_regra: string
          unidade: string
          updated_at?: string
        }
        Update: {
          a_cada?: number
          created_at?: string
          curso_id?: string
          horas?: number
          id?: string
          maximo_horas?: number
          nome?: string
          numero?: number
          regra?: string
          tipo_regra?: string
          unidade?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'itens_curso_curso_id_fkey'
            columns: ['curso_id']
            isOneToOne: false
            referencedRelation: 'cursos'
            referencedColumns: ['id']
          },
        ]
      }
      leituras_comprovante: {
        Row: {
          aluno_id: string
          created_at: string
          id: string
        }
        ComputedFields: never
        Insert: {
          aluno_id?: string
          created_at?: string
          id?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      perfis: {
        Row: {
          aluno_id: string
          created_at: string
          curso_id: string | null
          matricula: string | null
          nome: string | null
          semestre_inicio: string | null
          updated_at: string
        }
        ComputedFields: never
        Insert: {
          aluno_id: string
          created_at?: string
          curso_id?: string | null
          matricula?: string | null
          nome?: string | null
          semestre_inicio?: string | null
          updated_at?: string
        }
        Update: {
          aluno_id?: string
          created_at?: string
          curso_id?: string | null
          matricula?: string | null
          nome?: string | null
          semestre_inicio?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'perfis_curso_id_fkey'
            columns: ['curso_id']
            isOneToOne: false
            referencedRelation: 'cursos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      aluno_tem_atividades: { Args: { aluno: string }; Returns: boolean }
      apagar_contas_nao_confirmadas: { Args: { prazo?: string }; Returns: number }
      apagar_minha_conta: { Args: Record<PropertyKey, never>; Returns: number }
      barrar_email_externo: { Args: { event: Json }; Returns: Json }
      calcula_horas: { Args: { entrada: Json }; Returns: Json }
      comprovantes_orfaos: { Args: { idade?: string; limite?: number }; Returns: string[] }
      email_institucional: { Args: { email: string }; Returns: boolean }
      progresso_do_aluno: { Args: Record<PropertyKey, never>; Returns: Json }
      registrar_atividade: {
        Args: {
          comprovante_caminho: string
          comprovante_hash: string
          comprovante_nome: string
          data_fim: string
          data_inicio: string
          item_numero: number
          nome: string
          quantidade: number
        }
        Returns: {
          comprovante_tamanho: number
          comprovante_tipo: string
          created_at: string
          id: string
          updated_at: string
        }[]
      }
      reservar_leitura_comprovante: {
        Args: { limite_dia: number; limite_minuto: number }
        Returns: boolean
      }
      sem_acento: { Args: { texto: string }; Returns: string }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema['Tables'] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema['Enums'] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema['CompositeTypes'] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
