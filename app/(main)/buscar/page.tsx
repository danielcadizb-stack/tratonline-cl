"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { formatCLP } from "@/lib/autofact";
import { createClient } from "@/lib/supabase";

const MARCAS_OPC = [
  "Toyota",
  "Mazda",
  "Kia",
  "Hyundai",
  "Chevrolet",
  "Nissan",
  "Honda",
  "Mitsubishi",
  "Ford",
  "Suzuki",
  "Volkswagen",
  "Subaru",
  "BYD",
  "MG",
  "Chery",
  "Lifan",
  "GWM",
  "SsangYong",
  "Otra",
];
const TIPOS_OPC = ["sedan", "suv", "hatchback", "camioneta", "otro"];
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
  "San Bernardo",
  "Conchali",
  "Huechuraba",
  "Todo Santiago",
];

export default function BuscarPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardado, setGuardado] = useState(false);
  const [esEdicion, setEsEdicion] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    marcas: [] as string[],
    anio_min: "",
    anio_max: "",
    km_max: "",
    precio_min: "",
    precio_max: "",
    tipos: [] as string[],
    comunas: [] as string[],
    transmision: "",
    combustible: "",
  });

  // Cargar perfil existente
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        router.push("/login");
        return;
      }
      const { data } = await supabase
        .from("perfiles_comprador")
        .select("*")
        .eq("comprador_id", user.id)
        .single();
      if (data) {
        setEsEdicion(true);
        setForm({
          marcas: data.marcas || [],
          anio_min: data.anio_min ? String(data.anio_min) : "",
          anio_max: data.anio_max ? String(data.anio_max) : "",
          km_max: data.km_max ? String(data.km_max) : "",
          precio_min: data.precio_min ? String(data.precio_min) : "",
          precio_max: data.precio_max ? String(data.precio_max) : "",
          tipos: data.tipos || [],
          comunas: data.comunas || [],
          transmision: data.transmision || "",
          combustible: data.combustible || "",
        });
      }
      setCargando(false);
    });
  }, []);

  const set = (campo: string, valor: any) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  function toggleArr(campo: "marcas" | "tipos" | "comunas", val: string) {
    setForm((prev) => ({
      ...prev,
      [campo]: prev[campo].includes(val)
        ? prev[campo].filter((x: string) => x !== val)
        : [...prev[campo], val],
    }));
  }

  async function handleSubmit() {
    if (form.marcas.length === 0) {
      setError("Selecciona al menos una marca.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/perfiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anio_min: form.anio_min ? Number(form.anio_min) : null,
          anio_max: form.anio_max ? Number(form.anio_max) : null,
          km_max: form.km_max ? Number(form.km_max) : null,
          precio_min: form.precio_min ? Number(form.precio_min) : null,
          precio_max: form.precio_max ? Number(form.precio_max) : null,
        }),
      });
      if (!res.ok) throw new Error("Error al guardar");
      setGuardado(true);
      setTimeout(() => router.push("/matches?perfil=1"), 1500);
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  if (cargando)
    return (
      <div className="max-w-lg mx-auto space-y-3">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-14 bg-trato-gray1 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );

  if (guardado)
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
        <h2 className="text-xl font-bold text-trato-text mb-2">
          {esEdicion ? "Perfil actualizado" : "Perfil guardado"}
        </h2>
        <p className="text-trato-text2 text-sm">
          Redirigiendo a tus matches...
        </p>
      </div>
    );

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          {esEdicion ? "Editar mi busqueda" : "Que auto buscas"}
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          {esEdicion
            ? "Actualiza tu perfil y el motor buscara nuevos matches automaticamente."
            : "Define tu perfil y te avisamos cuando aparezca un auto compatible."}
        </p>
      </div>

      {esEdicion && (
        <div
          className="bg-trato-green-bg border border-trato-green/20
          rounded-xl p-3 mb-5 flex items-center gap-2"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 7l3.5 3.5L12 3"
              stroke="#1A7F5A"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="text-trato-green text-xs">
            Ya tienes un perfil activo. Puedes editarlo cuando quieras.
          </p>
        </div>
      )}

      <div className="space-y-6">
        {/* Marcas */}
        <div>
          <label className="section-label">
            Marca que buscas
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (una o mas)
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {MARCAS_OPC.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => toggleArr("marcas", m)}
                className={`tag-filter ${form.marcas.includes(m) ? "active" : ""}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {/* Año */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label">Año minimo</label>
            <input
              type="number"
              value={form.anio_min}
              onChange={(e) => set("anio_min", e.target.value)}
              placeholder="2015"
              min="2000"
              max="2026"
              className="input-trato"
            />
          </div>
          <div>
            <label className="section-label">Año maximo</label>
            <input
              type="number"
              value={form.anio_max}
              onChange={(e) => set("anio_max", e.target.value)}
              placeholder="2024"
              min="2000"
              max="2026"
              className="input-trato"
            />
          </div>
        </div>

        {/* Precio */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="section-label">Precio minimo (CLP)</label>
            <input
              type="number"
              value={form.precio_min}
              onChange={(e) => set("precio_min", e.target.value)}
              placeholder="3000000"
              min="0"
              step="500000"
              className="input-trato"
            />
          </div>
          <div>
            <label className="section-label">Precio maximo (CLP)</label>
            <input
              type="number"
              value={form.precio_max}
              onChange={(e) => set("precio_max", e.target.value)}
              placeholder="12000000"
              min="0"
              step="500000"
              className="input-trato"
            />
          </div>
        </div>

        {/* Km max */}
        <div>
          <label className="section-label">Kilometraje maximo</label>
          <input
            type="number"
            value={form.km_max}
            onChange={(e) => set("km_max", e.target.value)}
            placeholder="100000"
            min="0"
            step="10000"
            className="input-trato"
          />
        </div>

        {/* Tipo */}
        <div>
          <label className="section-label">
            Tipo de vehiculo
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (opcional)
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIPOS_OPC.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => toggleArr("tipos", t)}
                className={`tag-filter capitalize ${form.tipos.includes(t) ? "active" : ""}`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Transmision */}
        <div>
          <label className="section-label">
            Transmision
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (opcional)
            </span>
          </label>
          <div className="flex gap-2 mt-2">
            {["automatico", "manual", "cualquiera"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() =>
                  set("transmision", form.transmision === t ? "" : t)
                }
                className={`tag-filter capitalize ${form.transmision === t ? "active" : ""}`}
              >
                {t === "automatico"
                  ? "Automatico"
                  : t === "manual"
                    ? "Manual"
                    : "Cualquiera"}
              </button>
            ))}
          </div>
        </div>

        {/* Comunas */}
        <div>
          <label className="section-label">
            Zona donde buscas
            <span className="normal-case font-normal text-trato-gray3 ml-1">
              (opcional)
            </span>
          </label>
          <div className="flex flex-wrap gap-2 mt-2">
            {COMUNAS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => toggleArr("comunas", c)}
                className={`tag-filter ${form.comunas.includes(c) ? "active" : ""}`}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {error && (
          <p
            className="text-trato-danger text-xs bg-red-50 border
            border-trato-danger/20 rounded-lg px-3 py-2"
          >
            {error}
          </p>
        )}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="btn-primary"
        >
          {loading
            ? "Guardando..."
            : esEdicion
              ? "Actualizar mi busqueda"
              : "Guardar y buscar matches"}
        </button>

        {esEdicion && (
          <button
            onClick={() => router.push("/matches")}
            className="btn-secondary"
          >
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
}
