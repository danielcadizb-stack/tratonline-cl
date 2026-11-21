"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase";

const CUENTA_PAGO = {
  titular: "Alfester SpA",
  banco: "Global66 / Global Card S.A.",
  tipo: "Cuenta Vista",
  numero: "13928548",
  rut: "78.502.587-3",
  email: "kovaapp2@gmail.com",
};

export default function ConfirmarVentaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id") || "";

  const [paso, setPaso] = useState<"instrucciones" | "confirmado">(
    "instrucciones",
  );
  const [loading, setLoading] = useState(false);
  const [copiado, setCopiado] = useState("");
  const [auto, setAuto] = useState<any>(null);

  useEffect(() => {
    if (!matchId) return;
    const supabase = createClient();
    supabase
      .from("matches")
      .select("*, auto:autos(*)")
      .eq("id", matchId)
      .single()
      .then(({ data }) => setAuto(data?.auto));
  }, [matchId]);

  function copiar(texto: string, campo: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(campo);
    setTimeout(() => setCopiado(""), 2000);
  }

  async function confirmarVenta() {
    if (!matchId) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from("matches")
      .update({ estado: "cerrado" })
      .eq("id", matchId);
    await supabase
      .from("autos")
      .update({ estado: "vendido" })
      .eq("id", auto?.id);
    setPaso("confirmado");
    setLoading(false);
  }

  if (paso === "confirmado")
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div
          className="w-16 h-16 rounded-full bg-trato-green flex items-center
        justify-center mx-auto mb-6"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14l7 7L24 7"
              stroke="white"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-trato-text mb-2">
          Venta confirmada
        </h2>
        <p className="text-trato-text2 text-sm mb-8">
          Hemos registrado el pago y marcado el auto como vendido. Ahora puedes
          proceder con la transferencia del vehiculo.
        </p>
        <div
          className="bg-trato-green-bg border border-trato-green/20
        rounded-xl p-4 mb-6 text-left"
        >
          <p className="text-trato-green font-medium text-sm mb-1">
            Siguiente paso — Transferencia del vehiculo
          </p>
          <p className="text-trato-green/80 text-xs leading-relaxed">
            Coordina la transferencia del vehiculo con el comprador. Puedes
            hacerlo a traves de Autofact o del Registro Civil.
          </p>
          <a
            href="https://www.autofact.cl/transferencia-digital"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block mt-3 bg-trato-green text-white text-xs
            px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors"
          >
            Ir a Autofact →
          </a>
        </div>
        <Link
          href="/matches"
          className="text-trato-green text-sm hover:underline"
        >
          Volver a mis matches
        </Link>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Confirmar venta
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Sigue estos pasos para completar la venta
        </p>
      </div>

      {/* Auto */}
      {auto && (
        <div className="card-trato mb-5">
          <p className="section-label mb-2">Auto en venta</p>
          <p className="font-semibold text-trato-text">
            {auto.marca} {auto.modelo} {auto.anio}
          </p>
          <p className="text-trato-text2 text-xs mt-0.5">
            {Number(auto.km).toLocaleString("es-CL")} km · {auto.region}
          </p>
        </div>
      )}

      {/* Paso 1 — Pago del fee */}
      <div className="card-trato mb-4">
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-7 h-7 rounded-full bg-trato-green text-white text-xs
            font-bold flex items-center justify-center flex-shrink-0"
          >
            1
          </div>
          <div>
            <p className="font-semibold text-trato-text text-sm">
              Paga el fee de cierre
            </p>
            <p className="text-trato-text2 text-xs">
              Transfiere $100.000 a la cuenta de TratOnline
            </p>
          </div>
        </div>

        <div className="bg-trato-dark rounded-xl p-4 space-y-3">
          <p className="text-trato-green text-xs font-medium mb-2">
            Datos de transferencia
          </p>
          {[
            { label: "Titular", value: CUENTA_PAGO.titular },
            { label: "Banco", value: CUENTA_PAGO.banco },
            { label: "Tipo", value: CUENTA_PAGO.tipo },
            { label: "N° cuenta", value: CUENTA_PAGO.numero },
            { label: "RUT", value: CUENTA_PAGO.rut },
            { label: "Email", value: CUENTA_PAGO.email },
            { label: "Monto", value: "$100.000" },
          ].map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-trato-gray3 text-[10px]">{label}</p>
                <p className="text-white text-sm font-medium">{value}</p>
              </div>
              <button
                onClick={() => copiar(value, label)}
                className="text-trato-green text-[10px] border border-trato-green/30
                  px-2 py-1 rounded-lg hover:bg-trato-green/10 transition-colors"
              >
                {copiado === label ? "✓ Copiado" : "Copiar"}
              </button>
            </div>
          ))}
        </div>

        <div
          className="mt-3 bg-trato-green-bg border border-trato-green/20
          rounded-lg p-3"
        >
          <p className="text-trato-green text-xs">
            Agrega en el comentario de la transferencia tu nombre y el auto que
            vendiste. Envía el comprobante a{" "}
            <strong>soporte@tratonline.cl</strong>
          </p>
        </div>
      </div>

      {/* Paso 2 — Confirmar */}
      <div className="card-trato mb-6">
        <div className="flex items-center gap-3 mb-3">
          <div
            className="w-7 h-7 rounded-full bg-trato-green text-white text-xs
            font-bold flex items-center justify-center flex-shrink-0"
          >
            2
          </div>
          <div>
            <p className="font-semibold text-trato-text text-sm">
              Confirma la venta en la plataforma
            </p>
            <p className="text-trato-text2 text-xs">
              Una vez realizada la transferencia haz click en confirmar
            </p>
          </div>
        </div>

        <button
          onClick={confirmarVenta}
          disabled={loading}
          className="btn-primary"
        >
          {loading ? "Confirmando..." : "Ya transferi — Confirmar venta"}
        </button>
      </div>

      {/* Paso 3 — Transferencia vehiculo */}
      <div className="card-trato opacity-60">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-full bg-trato-border text-trato-text2
            text-xs font-bold flex items-center justify-center flex-shrink-0"
          >
            3
          </div>
          <div>
            <p className="font-semibold text-trato-text text-sm">
              Transfiere el vehiculo
            </p>
            <p className="text-trato-text2 text-xs">
              Coordina la transferencia del vehiculo con el comprador via
              Autofact
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
