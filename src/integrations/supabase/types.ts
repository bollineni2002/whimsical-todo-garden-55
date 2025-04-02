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
      transactions: {
        Row: {
          attachments: Json | null
          business_name: string | null
          buyers: Database["public"]["CompositeTypes"]["buyer_type"][] | null
          created_at: string | null
          date: string
          id: string
          load_buy: Json | null
          load_sold: Json | null
          name: string
          notes: Json | null
          payments: Json | null
          status: string | null
          suppliers:
            | Database["public"]["CompositeTypes"]["supplier_type"][]
            | null
          synced_at: string | null
          total_amount: number | null
          transportation: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          business_name?: string | null
          buyers?: Database["public"]["CompositeTypes"]["buyer_type"][] | null
          created_at?: string | null
          date: string
          id: string
          load_buy?: Json | null
          load_sold?: Json | null
          name: string
          notes?: Json | null
          payments?: Json | null
          status?: string | null
          suppliers?:
            | Database["public"]["CompositeTypes"]["supplier_type"][]
            | null
          synced_at?: string | null
          total_amount?: number | null
          transportation?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          business_name?: string | null
          buyers?: Database["public"]["CompositeTypes"]["buyer_type"][] | null
          created_at?: string | null
          date?: string
          id?: string
          load_buy?: Json | null
          load_sold?: Json | null
          name?: string
          notes?: Json | null
          payments?: Json | null
          status?: string | null
          suppliers?:
            | Database["public"]["CompositeTypes"]["supplier_type"][]
            | null
          synced_at?: string | null
          total_amount?: number | null
          transportation?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      buyer_type: {
        name: string | null
        contact: string | null
        quantitysold: number | null
        salerate: number | null
        totalsaleamount: number | null
        amountreceived: number | null
        pendingbalance: number | null
        paymentduedate: string | null
        paymentfrequency: string | null
      }
      supplier_type: {
        name: string | null
        contact: string | null
        goodsname: string | null
        quantity: number | null
        purchaserate: number | null
        totalcost: number | null
        amountpaid: number | null
        balance: number | null
        paymentduedate: string | null
        paymentfrequency: string | null
      }
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
