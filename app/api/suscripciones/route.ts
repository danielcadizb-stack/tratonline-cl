import { NextResponse } from "next/server"
import { createServerClientInstance } from "@/lib/supabase-server"

export async function GET() {
  const supabase = await createServerClientInstance()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  await supabase.rpc("marcar_suscripciones_vencidas")

  const { data: suscripcion } = await supabase
    .from("suscripciones_mecanicos")
    .select("*")
    .eq("mecanico_id", user.id)
    .eq("estado", "activa")
    .single()

  return NextResponse.json({ suscripcion: suscripcion || null })
}