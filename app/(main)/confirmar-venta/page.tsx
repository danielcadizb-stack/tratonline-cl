"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";
import { formatCLP } from "@/lib/autofact";

export default function ConfirmarVentaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id") || "";

  const [match, setMatch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  useEffect(() => {
    if (!matchId) return;
    const supabase = createClient();
    supabase
      .from("matches")
      .select(
        "*, auto:autos(*), comprador:usuarios!matches_comprador_id_fkey(nombre, telefono)",
      )
      .eq("id", matchId)
      .single()
      .then(({ data }) => {
        setMatch(data);
        setLoading(false);
      });
  }, [matchId]);

  async function confirmarVenta() {
    setProcesando(true);
    setError("");
    try {
      const res = await fetch("/api/cobros", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Error al procesar");

      if (data.payment_url) {
        // Khipu activo — redirigir al pago real
        window.location.href = data.payment_url;
      } else {
        // Modo simulado
        setExito(true);
      }
    } catch (e: any) {
      setError(e.message);
      setProcesando(false);
    }
  }

  if (loading)
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-16 bg-trato-gray1 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );

  if (!match)
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-trato-text2">Match no encontrado.</p>
      </div>
    );

  if (exito)
    return (
      <div className="max-w-lg mx-auto">
        <div className="text-center py-12">
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
          <h1 className="text-2xl font-bold text-trato-text mb-2">
            Venta confirmada
          </h1>
          <p className="text-trato-text2 text-sm mb-8">
            Fee de $100.000 procesado correctamente.
          </p>

          <div
            className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-5 text-left mb-6"
          >
            <p className="text-trato-green font-medium text-sm mb-3">
              Siguiente paso — Transferencia digital
            </p>
            <p className="text-trato-green/80 text-xs leading-relaxed mb-4">
              Completa la transferencia del auto a nombre del comprador a traves
              de Autofact. Es 100% online y tarda 15-25 dias habiles.
            </p>
            <a
              href="https://www.autofact.cl/transferencias"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-trato-green text-white text-sm
              font-medium px-5 py-2.5 rounded-[9px] hover:bg-trato-green-l
              transition-colors"
            >
              Ir a Autofact para la transferencia →
            </a>
          </div>

          <button
            onClick={() => router.push("/matches")}
            className="btn-secondary"
          >
            Volver a mis matches
          </button>
        </div>
      </div>
    );

  const auto = match.auto;
  const comprador = match.comprador;

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Confirmar venta
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Al confirmar, se cobrara el fee de $100.000 y el auto quedara marcado
          como vendido.
        </p>
      </div>

      {/* Resumen del match */}
      <div className="card-trato mb-4">
        <p className="section-label">Resumen de la operacion</p>
        <div className="space-y-2 mt-2">
          {[
            ["Auto", `${auto?.marca} ${auto?.modelo} ${auto?.anio}`],
            ["Precio", formatCLP(auto?.precio_pedido || 0)],
            ["Kilometraje", `${Number(auto?.km).toLocaleString("es-CL")} km`],
            ["Comprador", comprador?.nombre || "Comprador"],
            ["Telefono", comprador?.telefono || "No registrado"],
          ].map(([lbl, val]) => (
            <div key={lbl} className="flex justify-between text-sm">
              <span className="text-trato-text2">{lbl}</span>
              <span className="font-medium text-trato-text">{val}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fee */}
      <div className="bg-trato-dark rounded-xl p-4 mb-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-white font-medium text-sm">Fee Trato.cl</p>
            <p className="text-trato-gray3 text-xs mt-0.5">
              Servicio de intermediacion digital
            </p>
          </div>
          <p className="text-trato-green-l font-bold text-xl">$100.000</p>
        </div>
      </div>

      {/* Pasos siguientes */}
      <div className="bg-trato-gray1 rounded-xl p-4 mb-6">
        <p className="text-trato-text font-medium text-sm mb-3">
          Que pasa despues
        </p>
        <div className="space-y-2">
          {[
            "Se cobra el fee de $100.000",
            "El auto queda marcado como vendido en Trato",
            "Se habilita el link a Autofact para la transferencia digital",
            "Ambas partes completan el tramite online con firma digital",
          ].map((paso, i) => (
            <div
              key={i}
              className="flex items-start gap-2 text-xs text-trato-text2"
            >
              <div
                className="w-4 h-4 rounded-full bg-trato-green flex items-center
                justify-center flex-shrink-0 mt-0.5"
              >
                <span className="text-white text-[9px] font-bold">{i + 1}</span>
              </div>
              {paso}
            </div>
          ))}
        </div>
      </div>

      {error && (
        <p
          className="text-trato-danger text-xs bg-red-50 border
          border-trato-danger/20 rounded-lg px-3 py-2 mb-4"
        >
          {error}
        </p>
      )}

      <button
        onClick={confirmarVenta}
        disabled={procesando}
        className="btn-primary"
      >
        {procesando ? "Procesando..." : "Confirmar venta y pagar fee"}
      </button>

      <button onClick={() => router.back()} className="btn-secondary mt-3">
        Volver
      </button>
    </div>
  );
}
