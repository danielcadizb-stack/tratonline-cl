import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();
  const { match_id, mecanico_id } = body;

  if (!match_id || !mecanico_id)
    return NextResponse.json({ error: "Faltan datos" }, { status: 400 });

  // Actualizar el match con el mecánico y cambiar estado
  const { error } = await supabase
    .from("matches")
    .update({
      mecanico_id,
      estado: "inspeccion_solicitada",
    })
    .eq("id", match_id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Agregar mensaje en el chat
  await supabase.from("mensajes").insert({
    match_id,
    autor_id: user.id,
    texto: "Inspeccion solicitada con mecanico. Se coordinara por este chat.",
    tipo: "sistema",
  });

  return NextResponse.json({ ok: true });
}
