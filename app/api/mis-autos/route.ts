import { NextResponse } from "next/server"
import { createServerClientInstance } from "@/lib/supabase-server"

export async function GET() {
  try {
    const supabase = await createServerClientInstance()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    console.log("MIS-AUTOS AUTH - user:", user?.id, "authError:", authError?.message)

    if (!user) {
      return NextResponse.json({ error: "No autorizado", debug: authError?.message }, { status: 401 })
    }

    const { data: autos, error } = await supabase
      .from("autos")
      .select("*")
      .eq("vendedor_id", user.id)
      .in("estado", ["disponible", "vendido", "reservado"])
      .order("created_at", { ascending: false })

    console.log("MIS-AUTOS QUERY - userId:", user.id, "autos:", autos?.length, "error:", error?.message)

    return NextResponse.json({ autos: autos || [], debug_user: user.id, debug_count: autos?.length })
  } catch (e: any) {
    console.log("MIS-AUTOS EXCEPTION:", e.message)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}