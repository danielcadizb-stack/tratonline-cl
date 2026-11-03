"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { formatCLP, evaluarPrecio, getPrecioMercado } from "@/lib/autofact";
import { createClient } from "@/lib/supabase";
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
  "Lifan",
  "Chery",
  "MG",
  "BYD",
  "Otra",
];

const TIPOS = ["sedan", "suv", "hatchback", "camioneta", "otro"];
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
  const [fotos, setFotos] = useState<File[]>([]);
  const [fotosPreview, setFotosPreview] = useState<string[]>([]);
  const [subiendoFotos, setSubiendoFotos] = useState(false);

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

  function handleFotos(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const nuevasFotos = [...fotos, ...files].slice(0, 8);
    setFotos(nuevasFotos);
    const previews = nuevasFotos.map((f) => URL.createObjectURL(f));
    setFotosPreview(previews);
  }

  function eliminarFoto(idx: number) {
    const nuevasFotos = fotos.filter((_, i) => i !== idx);
    setFotos(nuevasFotos);
    setFotosPreview(nuevasFotos.map((f) => URL.createObjectURL(f)));
  }

  async function subirFotos(autoId: string): Promise<string[]> {
    if (fotos.length === 0) return [];
    const supabase = createClient();
    const urls: string[] = [];

    for (const foto of fotos) {
      const ext = foto.name.split(".").pop();
      const path = `${autoId}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage
        .from("autos-fotos")
        .upload(path, foto, { contentType: foto.type });
      if (!error) {
        const { data } = supabase.storage
          .from("autos-fotos")
          .getPublicUrl(path);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  }

  async function handleSubmit() {
    setLoading(true);
    setSubiendoFotos(fotos.length > 0);
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
          fotos: [],
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al publicar");
      }
      const { auto } = await res.json();

      // Subir fotos después de crear el auto
      if (fotos.length > 0 && auto?.id) {
        setSubiendoFotos(true);
        const fotosUrls = await subirFotos(auto.id);
        if (fotosUrls.length > 0) {
          await fetch(`/api/autos/${auto.id}/fotos`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ fotos: fotosUrls }),
          });
        }
      }

      router.push("/matches?nuevo=1");
    } catch (e: any) {
      setError(e.message);
      setLoading(false);
      setSubiendoFotos(false);
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

      <div className="flex gap-2 mb-2">
        {([1, 2, 3] as Step[]).map((s) => (
          <div
            key={s}
            className={`flex-1 h-1.5 rounded-full transition-colors
            ${s < step ? "bg-trato-green" : s === step ? "bg-trato-green-l" : "bg-trato-border"}`}
          />
        ))}
      </div>
      <p className="text-trato-text2 text-xs mb-5">
        Paso {step} de 3 —{" "}
        {step === 1
          ? "Datos del vehículo"
          : step === 2
            ? "Precio y ubicación"
            : "Fotos y publicar"}
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
              placeholder="Ej: Corolla, Mazda3, X7"
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
                  className={`tag-filter capitalize ${form.combustible === c ? "active" : ""}`}
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
            <div className="bg-trato-gray1 rounded-xl p-3 text-sm text-trato-text2 animate-pulse">
              Consultando precio de mercado...
            </div>
          )}
          {mercado && !cargandoPrecio && (
            <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-4">
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
                className={`text-[10px] mt-1 ${evalPrecio === "competitivo" ? "text-trato-green" : evalPrecio === "bajo" ? "text-blue-500" : "text-trato-amber"}`}
              >
                {evalPrecio === "competitivo"
                  ? "✓ Precio competitivo"
                  : evalPrecio === "bajo"
                    ? "↓ Bajo el mercado — te vendes rápido"
                    : "↑ Sobre el mercado — puede tardar más en hacer match"}
              </p>
            )}
          </div>
          <div>
            <label className="section-label">
              Precio mínimo que aceptarías{" "}
              <span className="normal-case font-normal text-trato-gray3">
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
              Color{" "}
              <span className="normal-case font-normal text-trato-gray3">
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
          {/* Fotos */}
          <div>
            <label className="section-label">
              Fotos del auto
              <span className="normal-case font-normal text-trato-gray3 ml-1">
                (hasta 8 fotos)
              </span>
            </label>

            <div className="grid grid-cols-3 gap-2 mt-2">
              {fotosPreview.map((src, i) => (
                <div
                  key={i}
                  className="relative aspect-square rounded-xl overflow-hidden
                  border border-trato-border bg-trato-gray1"
                >
                  <img
                    src={src}
                    alt={`foto ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => eliminarFoto(i)}
                    className="absolute top-1 right-1 w-5 h-5 rounded-full bg-black/60
                      text-white flex items-center justify-center text-xs hover:bg-black/80"
                  >
                    ×
                  </button>
                </div>
              ))}
              {fotosPreview.length < 8 && (
                <label
                  className="aspect-square rounded-xl border-2 border-dashed
                  border-trato-border bg-trato-gray1 flex flex-col items-center
                  justify-center cursor-pointer hover:border-trato-green
                  hover:bg-trato-green-bg transition-colors"
                >
                  <svg
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    className="text-trato-gray3 mb-1"
                  >
                    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
                  </svg>
                  <span className="text-trato-gray3 text-[10px]">Agregar</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleFotos}
                    className="hidden"
                  />
                </label>
              )}
            </div>
            <p className="text-trato-text2 text-[10px] mt-1">
              Los autos con fotos reciben 3x más matches. JPG o PNG, máx 5MB
              cada una.
            </p>
          </div>

          <div>
            <label className="section-label">
              Descripción{" "}
              <span className="normal-case font-normal text-trato-gray3">
                (opcional)
              </span>
            </label>
            <textarea
              value={form.descripcion}
              onChange={(e) => set("descripcion", e.target.value)}
              placeholder="Ej: Único dueño, mantenciones al día, sin golpes..."
              rows={3}
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
              ["Fotos", `${fotos.length} foto${fotos.length !== 1 ? "s" : ""}`],
            ].map(([lbl, val]) => (
              <div key={lbl} className="flex justify-between text-sm">
                <span className="text-trato-text2">{lbl}</span>
                <span className="font-medium text-trato-text">{val}</span>
              </div>
            ))}
          </div>

          <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-3">
            <p className="text-trato-green text-xs leading-relaxed">
              Al publicar, el motor buscará compradores compatibles
              automáticamente.
              <strong> Solo pagas $100.000 si vendes.</strong>
            </p>
          </div>

          {error && (
            <p className="text-trato-danger text-xs bg-red-50 border border-trato-danger/20 rounded-lg px-3 py-2">
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
              {subiendoFotos
                ? "Subiendo fotos..."
                : loading
                  ? "Publicando..."
                  : "Publicar auto"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
