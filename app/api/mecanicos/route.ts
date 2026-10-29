import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

export async function GET(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const region = searchParams.get("region") || "";

  const { data: mecanicos, error } = await supabase
    .from("mecanicos")
    .select("*, usuario:usuarios(nombre, email, telefono)")
    .eq("suscripcion_activa", true)
    .order("rating", { ascending: false });

  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });

  // Filtrar por región si se especifica
  const filtrados = region
    ? mecanicos?.filter((m: any) =>
        m.comunas.some((c: string) =>
          c.toLowerCase().includes(region.toLowerCase()),
        ),
      )
    : mecanicos;

  return NextResponse.json({ mecanicos: filtrados || [] });
}
