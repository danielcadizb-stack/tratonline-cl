import { NextRequest, NextResponse } from "next/server";
import { createServerClientInstance } from "@/lib/supabase-server";

const FEE_TRATO = 100000;

export async function POST(req: NextRequest) {
  const supabase = await createServerClientInstance();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });

  const { match_id } = await req.json();
  if (!match_id)
    return NextResponse.json({ error: "Falta match_id" }, { status: 400 });

  // Verificar que el match existe y pertenece a un auto de este vendedor
  const { data: match } = await supabase
    .from("matches")
    .select("*, auto:autos(vendedor_id, marca, modelo, anio)")
    .eq("id", match_id)
    .single();

  if (!match)
    return NextResponse.json({ error: "Match no encontrado" }, { status: 404 });
  if (match.auto.vendedor_id !== user.id)
    return NextResponse.json({ error: "No autorizado" }, { status: 403 });

  // Modo simulado — cuando Khipu esté activo, reemplazar este bloque
  const KHIPU_KEY = process.env.KHIPU_SECRET;

  if (!KHIPU_KEY) {
    // Simular cobro exitoso en desarrollo
    await supabase
      .from("matches")
      .update({ estado: "cerrado", fee_cobrado: true })
      .eq("id", match_id);

    await supabase
      .from("autos")
      .update({ estado: "vendido" })
      .eq("id", match.auto_id);

    await supabase.from("mensajes").insert({
      match_id,
      autor_id: user.id,
      texto:
        "Venta confirmada. Fee de $100.000 procesado. Procede a la transferencia digital.",
      tipo: "sistema",
    });

    return NextResponse.json({
      ok: true,
      simulado: true,
      mensaje: "Cobro simulado exitoso — activa Khipu para cobros reales",
    });
  }

  // Cobro real con Khipu (activar cuando tengas las credenciales)
  const khipuRes = await fetch("https://khipu.com/api/2.0/payments", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${process.env.KHIPU_RECEIVER_ID}:${KHIPU_KEY}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      subject: `Fee Trato.cl — ${match.auto.marca} ${match.auto.modelo} ${match.auto.anio}`,
      currency: "CLP",
      amount: String(FEE_TRATO),
      return_url: `${process.env.NEXT_PUBLIC_URL}/matches?cobro=ok`,
      cancel_url: `${process.env.NEXT_PUBLIC_URL}/matches?cobro=cancelado`,
      notify_url: `${process.env.NEXT_PUBLIC_URL}/api/cobros/webhook`,
      custom: match_id,
    }),
  });

  const khipuData = await khipuRes.json();

  if (!khipuRes.ok)
    return NextResponse.json(
      { error: "Error creando cobro Khipu" },
      { status: 500 },
    );

  return NextResponse.json({
    ok: true,
    payment_url: khipuData.payment_url,
  });
}
