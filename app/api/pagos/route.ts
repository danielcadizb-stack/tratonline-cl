import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const body = await req.json();

  const { error, data } = await supabase
    .from("pagos")
    .insert({
      tipo: body.tipo,
      monto: body.monto,
      nombre_cliente: body.nombre_cliente,
      email_cliente: body.email_cliente,
      telefono: body.telefono,
      detalle: body.detalle,
      match_id: body.match_id || null,
      mecanico_id: body.mecanico_id || null,
      estado: "pendiente",
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true, pago: data });
}

export async function GET() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("email")
    .eq("id", user.id)
    .single();

  if (usuario?.email !== "daniel.cadiz.b@gmail.com")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const { data: pagos } = await supabase
    .from("pagos")
    .select("*")
    .order("created_at", { ascending: false });

  return NextResponse.json({ pagos: pagos || [] });
}

export async function PATCH(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: usuario } = await supabase
    .from("usuarios")
    .select("email")
    .eq("id", user.id)
    .single();

  if (usuario?.email !== "daniel.cadiz.b@gmail.com")
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  const body = await req.json();
  const { id, estado, notas } = body;

  const { error } = await supabase
    .from("pagos")
    .update({
      estado,
      notas,
      verificado_at: estado === "verificado" ? new Date().toISOString() : null,
    })
    .eq("id", id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Si es fee de venta verificado, activar match como cerrado
  if (estado === "verificado") {
    const { data: pago } = await supabase
      .from("pagos")
      .select("tipo, match_id, mecanico_id")
      .eq("id", id)
      .single();

    if (pago?.tipo === "fee_venta" && pago?.match_id) {
      await supabase
        .from("matches")
        .update({ estado: "cerrado" })
        .eq("id", pago.match_id);
    }

    if (pago?.tipo === "membresia" && pago?.mecanico_id) {
      const vence = new Date(
        Date.now() + 30 * 24 * 60 * 60 * 1000,
      ).toISOString();
      await supabase
        .from("mecanicos")
        .update({
          suscripcion_activa: true,
          suscripcion_vence: vence,
        })
        .eq("id", pago.mecanico_id);
    }
  }

  return NextResponse.json({ ok: true });
}
