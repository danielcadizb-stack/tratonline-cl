import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";
import { calcularScore, SCORE_MINIMO } from "@/lib/matching";

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  await supabase
    .from("perfiles_comprador")
    .update({ activo: false })
    .eq("comprador_id", user.id);

  const { data: perfil, error } = await supabase
    .from("perfiles_comprador")
    .insert({
      comprador_id: user.id,
      marcas: body.marcas || [],
      anio_min: Number(body.anio_min),
      anio_max: Number(body.anio_max),
      km_max: Number(body.km_max),
      presupuesto: Number(body.presupuesto),
      tipos: body.tipos || [],
      transmision: body.transmision || "cualquiera",
      combustible: body.combustible || "cualquiera",
      region: body.region,
      urgencia: body.urgencia || "flexible",
      activo: true,
    })
    .select()
    .single();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  buscarMatchesExistentes(user.id, perfil.id, perfil, supabase).catch(
    console.error,
  );

  return NextResponse.json({ perfil }, { status: 201 });
}

export async function GET() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: perfil } = await supabase
    .from("perfiles_comprador")
    .select("*")
    .eq("comprador_id", user.id)
    .eq("activo", true)
    .single();

  return NextResponse.json({ perfil });
}

async function buscarMatchesExistentes(
  compradorId: string,
  perfilId: string,
  perfil: any,
  supabase: any,
) {
  const { data: autos } = await supabase
    .from("autos")
    .select("*")
    .eq("estado", "disponible");

  if (!autos || autos.length === 0) return;

  const rows = autos
    .map((auto: any) => {
      const { score } = calcularScore(auto, perfil);
      return { auto, score };
    })
    .filter((r: any) => r.score >= SCORE_MINIMO)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5)
    .map((r: any) => ({
      auto_id: r.auto.id,
      comprador_id: compradorId,
      perfil_id: perfilId,
      score: r.score,
      estado: "pendiente",
    }));

  if (rows.length === 0) return;

  await supabase
    .from("matches")
    .upsert(rows, {
      onConflict: "auto_id,comprador_id",
      ignoreDuplicates: true,
    });
}
