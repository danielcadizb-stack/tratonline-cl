import { NextResponse } from "next/server"
import { createServerClientInstance } from "@/lib/supabase-server"

const ADMIN_EMAIL = "daniel.cadiz.b@gmail.com"

export async function GET() {
  const supabase = await createServerClientInstance()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const { data: pagos } = await supabase
    .from("pagos")
    .select("*")
    .order("created_at", { ascending: false })

  return NextResponse.json({ pagos: pagos || [] })
}

export async function POST(req: Request) {
  const supabase = await createServerClientInstance()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { data, error } = await supabase.from("pagos").insert({
    tipo: body.tipo,
    monto: body.monto,
    nombre_cliente: body.nombre_cliente,
    email_cliente: body.email_cliente,
    telefono: body.telefono,
    detalle: body.detalle,
    comprobante_ref: body.comprobante_ref,
    estado: "pendiente",
  }).select().single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ pago: data })
}

export async function PATCH(req: Request) {
  const supabase = await createServerClientInstance()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || user.email !== ADMIN_EMAIL)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 })

  const body = await req.json()
  const { id, estado, notas, mecanico_id, match_id } = body

  const { data: pago, error } = await supabase
    .from("pagos")
    .update({
      estado,
      notas,
      verificado_at: estado === "verificado" ? new Date().toISOString() : null,
    })
    .eq("id", id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (estado === "verificado" && pago.tipo === "membresia" && mecanico_id) {
    const ahora = new Date()
    const vence = new Date(ahora)
    vence.setDate(vence.getDate() + 30)

    const { data: suscActual } = await supabase
      .from("suscripciones_mecanicos")
      .select("*")
      .eq("mecanico_id", mecanico_id)
      .eq("estado", "activa")
      .single()

    if (suscActual) {
      const nuevaBase = new Date(suscActual.vence_el)
      const nuevaVence = new Date(nuevaBase)
      nuevaVence.setDate(nuevaVence.getDate() + 30)
      await supabase
        .from("suscripciones_mecanicos")
        .update({ vence_el: nuevaVence.toISOString() })
        .eq("id", suscActual.id)
    } else {
      await supabase.from("suscripciones_mecanicos").insert({
        mecanico_id,
        activa_desde: ahora.toISOString(),
        vence_el: vence.toISOString(),
        estado: "activa",
        pago_id: id,
      })
    }
  }

  if (estado === "verificado" && pago.tipo === "fee_venta" && match_id) {
    await supabase
      .from("matches")
      .update({ estado: "cerrado" })
      .eq("id", match_id)
  }

  return NextResponse.json({ pago })
}