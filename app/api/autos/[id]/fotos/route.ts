import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const body = await req.json();

  // Si viene fotos, actualizar solo fotos
  if (body.fotos !== undefined) {
    const { error } = await supabase
      .from("autos")
      .update({ fotos: body.fotos })
      .eq("id", params.id)
      .eq("vendedor_id", user.id);
    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  }

  // Si no, actualizar datos del auto
  const { error } = await supabase
    .from("autos")
    .update({
      marca: body.marca,
      modelo: body.modelo,
      anio: Number(body.anio),
      km: Number(body.km),
      precio_pedido: Number(body.precio_pedido),
      precio_minimo: Number(body.precio_minimo),
      transmision: body.transmision,
      combustible: body.combustible,
      tipo: body.tipo,
      color: body.color,
      region: body.region,
      descripcion: body.descripcion,
    })
    .eq("id", params.id)
    .eq("vendedor_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { error } = await supabase
    .from("autos")
    .update({ estado: "inactivo" })
    .eq("id", params.id)
    .eq("vendedor_id", user.id);

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
