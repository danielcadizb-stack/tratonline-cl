import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";
import { calcularScore, SCORE_MINIMO } from "@/lib/matching";
import type { Auto, PerfilComprador } from "@/types";

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  const campos = [
    "marca",
    "modelo",
    "anio",
    "km",
    "precio_pedido",
    "precio_minimo",
    "transmision",
    "combustible",
    "tipo",
    "region",
  ];
  for (const campo of campos) {
    if (!body[campo])
      return NextResponse.json(
        { error: `Falta el campo: ${campo}` },
        { status: 400 },
      );
  }

  const { data: auto, error } = await supabase
    .from("autos")
    .insert({
      vendedor_id: user.id,
      marca: body.marca,
      modelo: body.modelo,
      anio: Number(body.anio),
      km: Number(body.km),
      precio_pedido: Number(body.precio_pedido),
      precio_minimo: Number(body.precio_minimo),
      transmision: body.transmision,
      combustible: body.combustible,
      tipo: body.tipo,
      color: body.color || null,
      region: body.region,
      fotos: body.fotos || [],
      descripcion: body.descripcion || null,
      estado: "disponible",
    })
    .select()
    .single();

  if (error || !auto)
    return NextResponse.json(
      { error: error?.message || "Error al publicar" },
      { status: 500 },
    );

  correrMatching(auto as Auto, supabase).catch(console.error);

  return NextResponse.json({ auto }, { status: 201 });
}

export async function GET() {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { data: autos, error } = await supabase
    .from("autos")
    .select("*")
    .eq("vendedor_id", user.id)
    .order("created_at", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ autos });
}

async function correrMatching(auto: Auto, supabase: any) {
  const { data: perfiles } = await supabase
    .from("perfiles_comprador")
    .select("*")
    .eq("activo", true);

  if (!perfiles || perfiles.length === 0) return;

  const rows = perfiles
    .map((perfil: PerfilComprador) => {
      const { score } = calcularScore(auto, perfil);
      return { perfilId: perfil.id, compradorId: perfil.comprador_id, score };
    })
    .filter((r: any) => r.score >= SCORE_MINIMO)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5)
    .map((m: any) => ({
      auto_id: auto.id,
      comprador_id: m.compradorId,
      perfil_id: m.perfilId,
      score: m.score,
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
