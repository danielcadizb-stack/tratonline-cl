import { NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

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
    .in("estado", ["disponible", "vendido", "reservado"])
    .order("created_at", { ascending: false });

  console.log(
    "API MIS-AUTOS — user:",
    user.id,
    "autos:",
    autos?.length,
    "error:",
    error,
  );

  return NextResponse.json({ autos: autos || [] });
}
