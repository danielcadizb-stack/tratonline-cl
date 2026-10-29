import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: match } = await supabase
    .from("matches")
    .select("*, auto:autos(vendedor_id)")
    .eq("id", params.id)
    .eq("comprador_id", user.id)
    .single();

  if (!match)
    return NextResponse.json({ error: "Match no encontrado" }, { status: 404 });

  const nuevoEstado =
    match.estado === "aceptado_vendedor"
      ? "visita_agendada"
      : "aceptado_comprador";

  await supabase
    .from("matches")
    .update({ estado: nuevoEstado })
    .eq("id", params.id);

  return NextResponse.redirect(new URL("/matches", req.url));
}
