"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function InspeccionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id") || "";

  const [mecanicos, setMecanicos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [solicitando, setSolicitando] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/mecanicos")
      .then((r) => r.json())
      .then(({ mecanicos }) => setMecanicos(mecanicos || []))
      .finally(() => setLoading(false));
  }, []);

  async function solicitarInspeccion(mecanicoId: string) {
    if (!matchId) {
      setError("No se especifico el match.");
      return;
    }
    setSolicitando(mecanicoId);
    try {
      const res = await fetch("/api/inspecciones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ match_id: matchId, mecanico_id: mecanicoId }),
      });
      if (!res.ok) throw new Error("Error al solicitar");
      router.push(`/chat/${matchId}`);
    } catch (e: any) {
      setError(e.message);
      setSolicitando(null);
    }
  }

  if (loading)
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-trato-gray1 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Solicitar inspeccion
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Un mecanico revisara el auto antes de que lo visites
        </p>
      </div>

      <div className="bg-trato-gray1 rounded-xl p-4 mb-6">
        <p className="text-trato-text text-sm font-medium mb-2">
          Que incluye la inspeccion
        </p>
        <div className="grid grid-cols-2 gap-2">
          {[
            "150+ puntos mecanicos",
            "Informe escrito",
            "Estimado de reparaciones",
            "Test drive incluido",
          ].map((item) => (
            <div
              key={item}
              className="flex items-center gap-2 text-xs
              text-trato-text2"
            >
              <div
                className="w-4 h-4 rounded-full bg-trato-green flex items-center
                justify-center flex-shrink-0"
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path
                    d="M1 4l2 2 4-4"
                    stroke="white"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              {item}
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

      {mecanicos.length === 0 ? (
        <div
          className="text-center py-12 border border-dashed
          border-trato-border rounded-2xl"
        >
          <p className="text-trato-text2 text-sm">
            No hay mecanicos disponibles en tu zona todavia.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {mecanicos.map((mec: any) => (
            <div key={mec.id} className="card-trato">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full bg-trato-green-bg
                  flex items-center justify-center flex-shrink-0
                  font-semibold text-trato-green text-sm"
                >
                  {mec.usuario?.nombre?.charAt(0) || "M"}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-trato-text text-sm">
                    {mec.usuario?.nombre || "Mecanico"}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-trato-amber text-xs">
                      {"★".repeat(Math.round(mec.rating))}
                    </span>
                    <span className="text-trato-text2 text-xs">
                      {mec.rating} · {mec.total_inspecciones} inspecciones
                    </span>
                  </div>
                  <p className="text-trato-text2 text-xs mt-0.5">
                    {mec.comunas?.join(", ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-trato-green text-sm">
                    ${mec.tarifa_base?.toLocaleString("es-CL")}
                  </p>
                  <button
                    onClick={() => solicitarInspeccion(mec.id)}
                    disabled={solicitando === mec.id}
                    className="mt-2 bg-trato-green text-white text-xs px-3 py-1.5
                      rounded-lg font-medium hover:bg-trato-green-l transition-colors
                      disabled:opacity-50"
                  >
                    {solicitando === mec.id ? "Solicitando..." : "Solicitar"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <button onClick={() => router.back()} className="btn-secondary mt-4">
        Volver al chat
      </button>
    </div>
  );
}
