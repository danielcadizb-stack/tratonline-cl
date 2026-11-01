"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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

export default function InspeccionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const matchId = searchParams.get("match_id") || "";

  const [mecanico, setMecanico] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [activando, setActivando] = useState(false);
  const [error, setError] = useState("");
  const [exito, setExito] = useState(false);

  const [nombreTaller, setNombreTaller] = useState("");
  const [comunas, setComunas] = useState<string[]>([]);
  const [especialidad, setEspecialidad] = useState<string[]>([]);
  const [tarifaBase, setTarifaBase] = useState("40000");

  useEffect(() => {
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

  if (cargando)
    return (
      <div className="max-w-lg mx-auto space-y-4">
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
        <div
          className="w-16 h-16 rounded-full bg-trato-green flex items-center
        justify-center mx-auto mb-6"
        >
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path
              d="M4 14l7 7L24 7"
              stroke="white"
              stroke-width="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-trato-text mb-2">
          Suscripcion activada
        </h2>
        <p className="text-trato-text2 text-sm">
          Ya apareces en el directorio de mecanicos. Redirigiendo...
        </p>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      {mecanico?.suscripcion_activa ? (
        <div
          className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-4 mb-6 flex items-center gap-3"
        >
          <div
            className="w-8 h-8 rounded-full bg-trato-green flex items-center
            justify-center flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M2 7l3.5 3.5L12 3"
                stroke="white"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <div>
            <p className="text-trato-green font-medium text-sm">
              Suscripcion activa
            </p>
            <p className="text-trato-green/70 text-xs">
              Vence:{" "}
              {new Date(mecanico.suscripcion_vence).toLocaleDateString("es-CL")}
            </p>
          </div>
        </div>
      ) : (
        <div
          className="bg-trato-amber-bg border border-trato-amber/20
          rounded-xl p-4 mb-6"
        >
          <p className="text-trato-amber font-medium text-sm">
            Suscripcion inactiva
          </p>
          <p className="text-trato-amber/70 text-xs mt-1">
            Activa tu plan para aparecer en el directorio y recibir solicitudes.
          </p>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Plan Mecanico TratOnline
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Accede a clientes que necesitan inspeccion mecanica en tu zona
        </p>
      </div>

      <div className="bg-trato-dark rounded-2xl p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-white font-bold text-2xl">$15.000</p>
            <p className="text-trato-gray3 text-xs">al mes</p>
          </div>
          <span className="badge-green">Plan activo</span>
        </div>
        <div className="space-y-2">
          {[
            "Apareces en el directorio de mecanicos",
            "Recibes solicitudes de inspeccion en tu zona",
            "Chat directo con compradores",
            "Comision 10% por inspeccion coordinada",
            "Rating visible para generar confianza",
          ].map((b) => (
            <div
              key={b}
              className="flex items-center gap-2 text-xs text-trato-gray2"
            >
              <div
                className="w-4 h-4 rounded-full bg-trato-green/20 flex items-center
                justify-center flex-shrink-0"
              >
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
          <label className="section-label">
            Comunas donde trabajas
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (selecciona una o mas)
            </span>
          </label>
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
            Especialidad por marca
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (opcional)
            </span>
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
          <p className="text-trato-text2 text-[10px] mt-1">
            Precio base sugerido: entre $35.000 y $60.000
          </p>
        </div>

        {error && (
          <p
            className="text-trato-danger text-xs bg-red-50 border
            border-trato-danger/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <div
          className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-3"
        >
          <p className="text-trato-green text-xs leading-relaxed">
            Pago simulado activado — cuando Khipu este listo se cobraran los
            $15.000 automaticamente cada 30 dias.
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
            Ver mi panel de inspecciones
          </button>
        )}
      </div>
    </div>
  );
}
