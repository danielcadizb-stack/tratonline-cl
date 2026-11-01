import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

const PRECIO_MENSUALIDAD = 15000;

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: mecanico } = await supabase
    .from("mecanicos")
    .select("*")
    .eq("usuario_id", user.id)
    .single();

  if (!mecanico) {
    const body = await req.json();
    const { nombre_taller, comunas, especialidad, tarifa_base } = body;

    const { data: nuevo, error } = await supabase
      .from("mecanicos")
      .insert({
        usuario_id: user.id,
        nombre_taller: nombre_taller || "Mi Taller",
        comunas: comunas || [],
        especialidad: especialidad || [],
        tarifa_base: Number(tarifa_base) || 40000,
        suscripcion_activa: true,
        suscripcion_vence: new Date(
          Date.now() + 30 * 24 * 60 * 60 * 1000,
        ).toISOString(),
        rating: 5.0,
        total_inspecciones: 0,
      })
      .select()
      .single();

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({
      ok: true,
      simulado: true,
      mecanico: nuevo,
      mensaje: "Suscripcion activada — apareces en el directorio",
    });
  }

  const vence = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { error } = await supabase
    .from("mecanicos")
    .update({
      suscripcion_activa: true,
      suscripcion_vence: vence.toISOString(),
    })
    .eq("usuario_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({
    ok: true,
    simulado: true,
    mensaje: "Suscripcion renovada por 30 dias",
    vence: vence.toISOString(),
  });
}

export async function GET() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: mecanico } = await supabase
    .from("mecanicos")
    .select("*")
    .eq("usuario_id", user.id)
    .single();

  return NextResponse.json({ mecanico });
}
