"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatCLP, evaluarPrecio, getPrecioMercado } from "@/lib/autofact";
import type { PrecioMercado } from "@/types";

const MARCAS = [
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
  "Volvo",
  "BMW",
  "Mercedes-Benz",
  "Otra",
];

const TIPOS = ["sedan", "suv", "hatchback", "camioneta", "otro"];
const COMUNAS = [
  "Las Condes",
  "Providencia",
  "Ñuñoa",
  "Vitacura",
  "Lo Barnechea",
  "Maipú",
  "Santiago Centro",
  "Quilicura",
  "Puente Alto",
  "La Florida",
  "Otra",
];

type Step = 1 | 2 | 3;

export default function PublicarPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [mercado, setMercado] = useState<PrecioMercado | null>(null);
  const [cargandoPrecio, setCargandoPrecio] = useState(false);

  const [form, setForm] = useState({
    marca: "",
    modelo: "",
    anio: "",
    km: "",
    precio_pedido: "",
    precio_minimo: "",
    transmision: "automatico",
    combustible: "bencina",
    tipo: "",
    color: "",
    region: "",
    descripcion: "",
  });

  const set = (campo: string, valor: string) =>
    setForm((prev) => ({ ...prev, [campo]: valor }));

  const calcularMercado = useCallback(async () => {
    const { marca, modelo, anio, km } = form;
    if (!marca || !modelo || !anio || !km) return;
    setCargandoPrecio(true);
    const precio = await getPrecioMercado(
      marca,
      modelo,
      Number(anio),
      Number(km),
    );
    setMercado(precio);
    setCargandoPrecio(false);
  }, [form.marca, form.modelo, form.anio, form.km]);

  useEffect(() => {
    const t = setTimeout(calcularMercado, 600);
    return () => clearTimeout(t);
  }, [calcularMercado]);

  const evalPrecio =
    form.precio_pedido && mercado
      ? evaluarPrecio(Number(form.precio_pedido), mercado)
      : null;

  async function handleSubmit() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/autos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          anio: Number(form.anio),
          km: Number(form.km),
          precio_pedido: Number(form.precio_pedido),
          precio_minimo: Number(form.precio_minimo),
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al publicar");
      }
      router.push("/matches?nuevo=1");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
    }
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Publicar mi auto
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Publicación gratis · Solo pagas $100.000 si vendes
        </p>
      </div>

      {/* Progress */}
      <div className="flex gap-2 mb-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors
            ${
              s < step
                ? "bg-trato-green"
                : s === step
                  ? "bg-trato-green-l"
                  : "bg-trato-border"
            }`}
          />
        ))}
      </div>
      <p className="text-trato-text2 text-xs mb-5">
        Paso {step} de 3 —{" "}
        {step === 1
          ? "Datos del vehículo"
          : step === 2
            ? "Precio y ubicación"
            : "Descripción y publicar"}
      </p>

      {/* ── Paso 1 ── */}
      {step === 1 && (
        <div className="space-y-4">
          <div>
            <label className="section-label">Marca</label>
            <select
              value={form.marca}
              onChange={(e) => set("marca", e.target.value)}
              className="input-trato"
            >
              <option value="">Selecciona la marca</option>
              {MARCAS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="section-label">Modelo</label>
            <input
              type="text"
              value={form.modelo}
              onChange={(e) => set("modelo", e.target.value)}
              placeholder="Ej: Corolla, Mazda3, Sportage"
              className="input-trato"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label">Año</label>
              <input
                type="number"
                value={form.anio}
                onChange={(e) => set("anio", e.target.value)}
                placeholder="2020"
                min="2000"
                max={new Date().getFullYear()}
                className="input-trato"
              />
            </div>
            <div>
              <label className="section-label">Kilometraje</label>
              <input
                type="number"
                value={form.km}
                onChange={(e) => set("km", e.target.value)}
                placeholder="45000"
                min="0"
                className="input-trato"
              />
            </div>
          </div>
          <div>
            <label className="section-label">Tipo de vehículo</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {TIPOS.map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("tipo", t)}
                  className={`tag-filter capitalize ${form.tipo === t ? "active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label">Transmisión</label>
            <div className="flex gap-2 mt-1">
              {["automatico", "manual"].map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => set("transmision", t)}
                  className={`tag-filter ${form.transmision === t ? "active" : ""}`}
                >
                  {t === "automatico" ? "Automático" : "Manual"}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label">Combustible</label>
            <div className="flex gap-2 flex-wrap mt-1">
              {["bencina", "diesel", "hibrido", "electrico"].map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => set("combustible", c)}
                  className={`tag-filter capitalize
                    ${form.combustible === c ? "active" : ""}`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          {error && <p className="text-trato-danger text-xs">{error}</p>}
          <button
            onClick={() => {
              if (
                !form.marca ||
                !form.modelo ||
                !form.anio ||
                !form.km ||
                !form.tipo
              ) {
                setError("Completa todos los campos antes de continuar.");
                return;
              }
              setError("");
              setStep(2);
            }}
            className="btn-primary mt-2"
          >
            Continuar
          </button>
        </div>
      )}

      {/* ── Paso 2 ── */}
      {step === 2 && (
        <div className="space-y-4">
          {cargandoPrecio && (
            <div
              className="bg-trato-gray1 rounded-xl p-3 text-sm
              text-trato-text2 animate-pulse"
            >
              Consultando precio de mercado...
            </div>
          )}
          {mercado && !cargandoPrecio && (
            <div
              className="bg-trato-green-bg border border-trato-green/20
              rounded-xl p-4"
            >
              <p className="text-trato-green text-xs font-medium mb-1">
                Precio de mercado — {form.marca} {form.modelo} {form.anio}
              </p>
              <p className="text-trato-green font-bold text-lg">
                {formatCLP(mercado.min)} – {formatCLP(mercado.max)}
              </p>
              <p className="text-trato-green/70 text-[10px] mt-1">
                Mediana: {formatCLP(mercado.mediana)}
              </p>
            </div>
          )}
          <div>
            <label className="section-label">Tu precio de venta (CLP)</label>
            <input
              type="number"
              value={form.precio_pedido}
              onChange={(e) => set("precio_pedido", e.target.value)}
              placeholder="9800000"
              min="0"
              step="50000"
              className="input-trato text-base font-semibold"
            />
            {evalPrecio && (
              <p
                className={`text-[10px] mt-1 ${
                  evalPrecio === "competitivo"
                    ? "text-trato-green"
                    : evalPrecio === "bajo"
                      ? "text-blue-500"
                      : "text-trato-amber"
                }`}
              >
                {evalPrecio === "competitivo"
                  ? "✓ Precio competitivo — buen margen para match"
                  : evalPrecio === "bajo"
                    ? "↓ Bajo el mercado — te vas a vender rápido"
                    : "↑ Sobre el mercado — puede tardar más en hacer match"}
              </p>
            )}
          </div>
          <div>
            <label className="section-label">
              Precio mínimo que aceptarías
              <span className="normal-case font-normal text-trato-gray3 ml-1">
                (privado)
              </span>
            </label>
            <input
              type="number"
              value={form.precio_minimo}
              onChange={(e) => set("precio_minimo", e.target.value)}
              placeholder={form.precio_pedido || "9200000"}
              min="0"
              step="50000"
              className="input-trato"
            />
            <p className="text-trato-text2 text-[10px] mt-1">
              Solo tú lo ves. Te ayuda a negociar con más seguridad.
            </p>
          </div>
          <div>
            <label className="section-label">
              Color
              <span className="normal-case font-normal text-trato-gray3 ml-1">
                (opcional)
              </span>
            </label>
            <input
              type="text"
              value={form.color}
              onChange={(e) => set("color", e.target.value)}
              placeholder="Blanco, Negro, Gris..."
              className="input-trato"
            />
          </div>
          <div>
            <label className="section-label">Ubicación del auto</label>
            <select
              value={form.region}
              onChange={(e) => set("region", e.target.value)}
              className="input-trato"
            >
              <option value="">Selecciona la comuna</option>
              {COMUNAS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-trato-danger text-xs">{error}</p>}
          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary">
              Volver
            </button>
            <button
              onClick={() => {
                if (
                  !form.precio_pedido ||
                  !form.precio_minimo ||
                  !form.region
                ) {
                  setError("Completa todos los campos.");
                  return;
                }
                setError("");
                setStep(3);
              }}
              className="btn-primary"
            >
              Continuar
            </button>
          </div>
        </div>
      )}

      {/* ── Paso 3 ── */}
      {step === 3 && (
        <div className="space-y-4">
          <div>
            <label className="section-label">
              Descripción
              <span className="normal-case font-normal text-trato-gray3 ml-1">
                (opcional)
              </span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Ej: Único dueño, mantenciones al día, sin golpes..."
              rows={4}
              className="input-trato resize-none"
            />
          </div>

          <div className="bg-trato-gray1 rounded-xl p-4 space-y-2">
            <p className="section-label">Resumen</p>
            {[
              ["Auto", `${form.marca} ${form.modelo} ${form.anio}`],
              ["Kilometraje", `${Number(form.km).toLocaleString("es-CL")} km`],
              ["Precio", formatCLP(Number(form.precio_pedido))],
              ["Ubicación", form.region],
            ].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between text-sm">
                <span className="text-trato-text2">{lbl}</span>
                <span className="font-medium text-trato-text">{val}</span>
              </div>
            ))}
          </div>

          <div
            className="bg-trato-green-bg border border-trato-green/20
            rounded-xl p-3"
          >
            <p className="text-trato-green text-xs leading-relaxed">
              Al publicar, el motor buscará compradores compatibles
              automáticamente. <strong>Solo pagas $100.000 si vendes.</strong>
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

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="btn-secondary">
              Volver
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="btn-primary"
            >
              {loading ? "Publicando..." : "Publicar auto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
