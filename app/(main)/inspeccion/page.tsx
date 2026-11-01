"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const COMUNAS = [
  "Las Condes",
  "Providencia",
  "Nunoa",
  "Vitacura",
  "Lo Barnechea",
  "Maipu",
  "Santiago Centro",
  "Quilicura",
  "Puente Alto",
  "La Florida",
  "San Miguel",
  "Macul",
  "Penalolen",
  "La Reina",
  "Cerrillos",
];

const ESPECIALIDADES = [
  "Toyota",
  "Mazda",
  "Kia",
  "Hyundai",
  "Chevrolet",
  "Nissan",
  "Honda",
  "Ford",
  "Todas las marcas",
];

const MECANICOS_DEMO = [
  {
    id: "1",
    nombre: "Ricardo Vega",
    taller: "Taller Vega",
    rating: 4.9,
    inspecciones: 87,
    comunas: ["Las Condes", "Providencia", "Vitacura"],
    tarifa: 45000,
  },
  {
    id: "2",
    nombre: "Manuel Perez",
    taller: "Mecanica Perez",
    rating: 4.8,
    inspecciones: 142,
    comunas: ["Las Condes", "Nunoa", "Santiago Centro"],
    tarifa: 40000,
  },
  {
    id: "3",
    nombre: "Carlos Lopez",
    taller: "Servicio Lopez",
    rating: 4.5,
    inspecciones: 34,
    comunas: ["Maipu", "Pudahuel", "Quilicura"],
    tarifa: 35000,
  },
];

export default function InspeccionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id") || "";

  const [rol, setRol] = useState<string | null>(null);
  const [mecanico, setMecanico] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);
  const [solicitando, setSolicitando] = useState<string | null>(null);

  const [nombreTaller, setNombreTaller] = useState("");
  const [comunas, setComunas] = useState<string[]>([]);
  const [especialidad, setEspecialidad] = useState<string[]>([]);
  const [tarifaBase, setTarifaBase] = useState("40000");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const { data: u } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single();
      setRol(u?.rol || null);

      if (u?.rol === "mecanico") {
        fetch("/api/mecanicos/suscribir")
          .then((r) => r.json())
          .then(({ mecanico }) => {
            setMecanico(mecanico);
            if (mecanico) {
              setNombreTaller(mecanico.nombre_taller || "");
              setComunas(mecanico.comunas || []);
              setEspecialidad(mecanico.especialidad || []);
              setTarifaBase(String(mecanico.tarifa_base || 40000));
            }
          })
          .finally(() => setCargando(false));
      } else {
        setCargando(false);
      }
    });
  }, []);

  function toggleComuna(c: string) {
    setComunas((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  }
  function toggleEsp(e: string) {
    setEspecialidad((prev) =>
      prev.includes(e) ? prev.filter((x) => x !== e) : [...prev, e],
    );
  }

  async function activarSuscripcion() {
    if (!nombreTaller || comunas.length === 0) {
      setError("Completa el nombre del taller y al menos una comuna.");
      return;
    }
    setActivando(true);
    setError("");
    try {
      const res = await fetch("/api/mecanicos/suscribir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nombre_taller: nombreTaller,
          comunas,
          especialidad,
          tarifa_base: Number(tarifaBase),
        }),
      });
      if (!res.ok) throw new Error("Error al activar");
      setExito(true);
      setTimeout(() => router.push("/panel-mecanico"), 2000);
    } catch (e: any) {
      setError(e.message);
      setActivando(false);
    }
  }

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

  if (cargando)
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

  if (exito)
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 rounded-full bg-trato-green flex items-center justify-center mx-auto mb-6">
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
        <h2 className="text-xl font-bold text-trato-text mb-2">
          Suscripcion activada
        </h2>
        <p className="text-trato-text2 text-sm">
          Ya apareces en el directorio. Redirigiendo...
        </p>
      </div>
    );

  /* ── VISTA MECANICO ─────────────────────────────────── */
  if (rol === "mecanico")
    return (
      <div className="max-w-lg mx-auto">
        {mecanico?.suscripcion_activa ? (
          <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-4 mb-6 flex items-center justify-between">
            <div>
              <p className="text-trato-green font-medium text-sm">
                Suscripcion activa
              </p>
              <p className="text-trato-green/70 text-xs mt-0.5">
                Vence:{" "}
                {new Date(mecanico.suscripcion_vence).toLocaleDateString(
                  "es-CL",
                )}
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-trato-amber-bg border border-trato-amber/20 rounded-xl p-4 mb-6">
            <p className="text-trato-amber font-medium text-sm">
              Suscripcion inactiva
            </p>
            <p className="text-trato-amber/70 text-xs mt-1">
              Activa tu plan para aparecer en el directorio.
            </p>
          </div>
        )}

        <div className="mb-6">
          <h1 className="text-xl font-semibold text-trato-text">
            Plan Mecanico TratOnline
          </h1>
          <p className="text-trato-text2 text-sm mt-1">
            Accede a clientes que necesitan inspeccion en tu zona
          </p>
        </div>

        <div className="bg-trato-dark rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-white font-bold text-2xl">$15.000</p>
              <p className="text-trato-gray3 text-xs">al mes</p>
            </div>
            <span className="badge-green">Plan mensual</span>
          </div>
          <div className="space-y-2">
            {[
              "Apareces en el directorio de mecanicos",
              "Recibes solicitudes en tu zona",
              "Chat directo con compradores",
              "Comision 10% por inspeccion coordinada",
              "Rating visible para generar confianza",
            ].map((b) => (
              <div
                key={b}
                className="flex items-center gap-2 text-xs text-trato-gray2"
              >
                <div className="w-4 h-4 rounded-full bg-trato-green/20 flex items-center justify-center flex-shrink-0">
                  <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                    <path
                      d="M1 4l2 2 4-4"
                      stroke="#22A374"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                {b}
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-5">
          <div>
            <label className="section-label">Nombre de tu taller</label>
            <input
              type="text"
              value={nombreTaller}
              onChange={(e) => setNombreTaller(e.target.value)}
              placeholder="Ej: Taller Mecanico Rodriguez"
              className="input-trato"
            />
          </div>
          <div>
            <label className="section-label">Comunas donde trabajas</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {COMUNAS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => toggleComuna(c)}
                  className={`tag-filter ${comunas.includes(c) ? "active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label">
              Especialidad por marca (opcional)
            </label>
            <div className="flex flex-wrap gap-2 mt-2">
              {ESPECIALIDADES.map((e) => (
                <button
                  key={e}
                  type="button"
                  onClick={() => toggleEsp(e)}
                  className={`tag-filter ${especialidad.includes(e) ? "active" : ""}`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label">
              Tu tarifa por inspeccion (CLP)
            </label>
            <input
              type="number"
              value={tarifaBase}
              onChange={(e) => setTarifaBase(e.target.value)}
              placeholder="40000"
              min="20000"
              step="5000"
              className="input-trato"
            />
          </div>
          {error && (
            <p className="text-trato-danger text-xs bg-red-50 border border-trato-danger/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}
          <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-3">
            <p className="text-trato-green text-xs leading-relaxed">
              Pago simulado activado — cuando Khipu este listo se cobraran los
              $15.000 cada 30 dias.
            </p>
          </div>
          <button
            onClick={activarSuscripcion}
            disabled={activando}
            className="btn-primary"
          >
            {activando
              ? "Activando..."
              : mecanico?.suscripcion_activa
                ? "Renovar suscripcion"
                : "Activar plan por $15.000/mes"}
          </button>
          {mecanico?.suscripcion_activa && (
            <button
              onClick={() => router.push("/panel-mecanico")}
              className="btn-secondary"
            >
              Ver mis inspecciones
            </button>
          )}
        </div>
      </div>
    );

  /* ── VISTA COMPRADOR/VENDEDOR ───────────────────────── */
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
              className="flex items-center gap-2 text-xs text-trato-text2"
            >
              <div className="w-4 h-4 rounded-full bg-trato-green flex items-center justify-center flex-shrink-0">
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
        <p className="text-trato-danger text-xs bg-red-50 border border-trato-danger/20 rounded-lg px-3 py-2 mb-4">
          {error}
        </p>
      )}
      {MECANICOS_DEMO.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-trato-border rounded-2xl">
          <p className="text-trato-text2 text-sm">
            No hay mecanicos disponibles en tu zona todavia.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {MECANICOS_DEMO.map((mec) => (
            <div key={mec.id} className="card-trato">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-trato-green-bg flex items-center justify-center flex-shrink-0 font-semibold text-trato-green text-sm">
                  {mec.nombre.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-trato-text text-sm">
                    {mec.nombre}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-trato-amber text-xs">
                      {"★".repeat(Math.round(mec.rating))}
                    </span>
                    <span className="text-trato-text2 text-xs">
                      {mec.rating} · {mec.inspecciones} inspecciones
                    </span>
                  </div>
                  <p className="text-trato-text2 text-xs mt-0.5">
                    {mec.comunas.join(", ")}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-trato-green text-sm">
                    ${mec.tarifa.toLocaleString("es-CL")}
                  </p>
                  <button
                    onClick={() => solicitarInspeccion(mec.id)}
                    disabled={solicitando === mec.id}
                    className="mt-2 bg-trato-green text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-trato-green-l transition-colors disabled:opacity-50"
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
