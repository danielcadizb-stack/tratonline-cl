"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

const CUENTA_PAGO = {
  titular: "Alfester SpA",
  banco: "Global66 / Global Card S.A.",
  tipo: "Cuenta Vista",
  numero: "13928548",
  rut: "78.502.587-3",
  email: "kovaapp2@gmail.com",
};

const PLANES_INSPECCION = [
  {
    id: "basica",
    nombre: "Inspección Básica",
    precio: 34990,
    plazo: "48 horas",
    puntos: "80+",
    color: "border-trato-steel/40",
    items: [
      "Motor y transmisión",
      "Frenos y suspensión",
      "Carrocería y pintura",
      "Informe digital PDF",
    ],
  },
  {
    id: "completa",
    nombre: "Inspección Completa",
    precio: 49990,
    plazo: "24 horas",
    puntos: "150+",
    color: "border-trato-green",
    popular: true,
    items: [
      "Todo lo de Básica",
      "Sistema eléctrico y electrónico",
      "Fotos de cada punto revisado",
      "Estimado de reparaciones",
      "Revisión de antecedentes legales",
    ],
  },
  {
    id: "urgente",
    nombre: "Inspección Urgente",
    precio: 64990,
    plazo: "Mismo día",
    puntos: "150+",
    color: "border-trato-steel/40",
    items: [
      "Todo lo de Completa",
      "Prioridad máxima",
      "Coordinación en menos de 2 horas",
    ],
  },
];

const COMUNAS_DEMO = [
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

const MARCAS_CHILE = [
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
  const [copiado, setCopiado] = useState("");
  const [planSelecto, setPlanSelecto] = useState("completa");
  const [paso, setPaso] = useState<"plan" | "datos" | "pago">("plan");

  // Datos del formulario de inspección externa
  const [formExt, setFormExt] = useState({
    marca: "",
    modelo: "",
    anio: "",
    patente: "",
    direccion: "",
    nombre: "",
    telefono: "",
    email: "",
  });

  const [nombreTaller, setNombreTaller] = useState("");
  const [comunas, setComunas] = useState<string[]>([]);
  const [especialidad, setEspecialidad] = useState<string[]>([]);
  const [tarifaBase, setTarifaBase] = useState("40000");

  const COMUNAS_MECANICO = [
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

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (!user) {
        setCargando(false);
        return;
      }
      const { data: u } = await supabase
        .from("usuarios")
        .select("rol")
        .eq("id", user.id)
        .single();
      setRol(u?.rol || null);
      if (u?.rol === "mecanico") {
        const { data: m } = await supabase
          .from("mecanicos")
          .select("*")
          .eq("usuario_id", user.id)
          .single();
        setMecanico(m);
        if (m) {
          setNombreTaller(m.nombre_taller || "");
          setComunas(m.comunas || []);
          setEspecialidad(m.especialidad || []);
          setTarifaBase(String(m.tarifa_base || 40000));
        }
      }
      setCargando(false);
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

  function copiar(texto: string, campo: string) {
    navigator.clipboard.writeText(texto);
    setCopiado(campo);
    setTimeout(() => setCopiado(""), 2000);
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

  const planActual = PLANES_INSPECCION.find((p) => p.id === planSelecto)!;

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

  /* ── VISTA MECÁNICO ── */
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
              "Comision del 75% por inspeccion coordinada",
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

        {/* Datos de pago membresía */}
        <div className="card-trato mb-5">
          <p className="section-label mb-3">Pago membresia mensual — $15.000</p>
          <p className="text-trato-text2 text-xs mb-3">
            Transfiere a la siguiente cuenta y envia el comprobante a
            soporte@tratonline.cl
          </p>
          <div className="bg-trato-dark rounded-xl p-3 space-y-2">
            {[
              { label: "Titular", value: CUENTA_PAGO.titular },
              { label: "Banco", value: CUENTA_PAGO.banco },
              { label: "N° cuenta", value: CUENTA_PAGO.numero },
              { label: "RUT", value: CUENTA_PAGO.rut },
              { label: "Email", value: CUENTA_PAGO.email },
              { label: "Monto", value: "$15.000" },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <div>
                  <p className="text-trato-gray3 text-[10px]">{label}</p>
                  <p className="text-white text-xs font-medium">{value}</p>
                </div>
                <button
                  onClick={() => copiar(value, label)}
                  className="text-trato-green text-[10px] border border-trato-green/30 px-2 py-0.5 rounded-lg hover:bg-trato-green/10 transition-colors"
                >
                  {copiado === label ? "✓" : "Copiar"}
                </button>
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
              {COMUNAS_MECANICO.map((c) => (
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

  /* ── VISTA COMPRADOR/VENDEDOR — Solicitar inspección con match ── */
  if (matchId)
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
        <div className="space-y-3">
          {COMUNAS_DEMO.map((mec) => (
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
        <button onClick={() => router.back()} className="btn-secondary mt-4">
          Volver al chat
        </button>
      </div>
    );

  /* ── VISTA PUBLICA — Inspección precompra sin match ── */
  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          Inspeccion precompra
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Inspecciona cualquier auto usado antes de comprarlo — aunque no este
          publicado en TratOnline
        </p>
      </div>

      {/* Alerta mercado */}
      <div className="bg-trato-amber-bg border border-trato-amber/20 rounded-xl p-4 mb-6">
        <p className="text-trato-amber font-medium text-sm mb-1">
          3 de cada 4 autos usados tienen fallas ocultas
        </p>
        <p className="text-trato-amber/80 text-xs leading-relaxed">
          Segun datos del mercado chileno 2026, el 75% de los autos usados
          presenta irregularidades mecanicas o legales al momento de la compra.
          Una inspeccion profesional te protege.
        </p>
      </div>

      {paso === "plan" && (
        <>
          <h2 className="font-semibold text-trato-text mb-4">Elige tu plan</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            {PLANES_INSPECCION.map((plan) => (
              <div
                key={plan.id}
                onClick={() => setPlanSelecto(plan.id)}
                className={`relative border-2 rounded-2xl p-5 cursor-pointer transition-all
                  ${planSelecto === plan.id ? "border-trato-green bg-trato-green-bg" : "border-trato-steel/30 bg-trato-mid hover:border-trato-steel/60"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-trato-green text-white text-[10px] px-3 py-0.5 rounded-full font-medium">
                      Mas popular
                    </span>
                  </div>
                )}
                <p className="font-semibold text-trato-text text-sm mb-1">
                  {plan.nombre}
                </p>
                <p className="text-trato-green font-bold text-xl mb-1">
                  ${plan.precio.toLocaleString("es-CL")}
                </p>
                <p className="text-trato-text2 text-xs mb-3">
                  {plan.puntos} puntos · {plan.plazo}
                </p>
                <div className="space-y-1.5">
                  {plan.items.map((item) => (
                    <div
                      key={item}
                      className="flex items-start gap-1.5 text-xs text-trato-text2"
                    >
                      <svg
                        width="10"
                        height="10"
                        viewBox="0 0 10 10"
                        fill="none"
                        className="mt-0.5 flex-shrink-0"
                      >
                        <path
                          d="M1 5l2.5 2.5L9 2"
                          stroke="#22A374"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button onClick={() => setPaso("datos")} className="btn-primary">
            Continuar con {planActual.nombre} →
          </button>
        </>
      )}

      {paso === "datos" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-trato-text mb-2">
            Datos del auto a inspeccionar
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label">Marca</label>
              <select
                value={formExt.marca}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, marca: e.target.value }))
                }
                className="input-trato"
              >
                <option value="">Selecciona</option>
                {MARCAS_CHILE.map((m) => (
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
                value={formExt.modelo}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, modelo: e.target.value }))
                }
                placeholder="Corolla"
                className="input-trato"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label">Año</label>
              <input
                type="number"
                value={formExt.anio}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, anio: e.target.value }))
                }
                placeholder="2020"
                className="input-trato"
              />
            </div>
            <div>
              <label className="section-label">Patente (opcional)</label>
              <input
                type="text"
                value={formExt.patente}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, patente: e.target.value }))
                }
                placeholder="ABCD12"
                className="input-trato"
              />
            </div>
          </div>
          <div>
            <label className="section-label">
              Direccion donde esta el auto
            </label>
            <input
              type="text"
              value={formExt.direccion}
              onChange={(e) =>
                setFormExt((p) => ({ ...p, direccion: e.target.value }))
              }
              placeholder="Av. Providencia 1234, Santiago"
              className="input-trato"
            />
          </div>
          <h2 className="font-semibold text-trato-text mt-2">
            Tus datos de contacto
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="section-label">Nombre</label>
              <input
                type="text"
                value={formExt.nombre}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, nombre: e.target.value }))
                }
                placeholder="Tu nombre"
                className="input-trato"
              />
            </div>
            <div>
              <label className="section-label">Telefono</label>
              <input
                type="tel"
                value={formExt.telefono}
                onChange={(e) =>
                  setFormExt((p) => ({ ...p, telefono: e.target.value }))
                }
                placeholder="+56 9 1234 5678"
                className="input-trato"
              />
            </div>
          </div>
          <div>
            <label className="section-label">Email</label>
            <input
              type="email"
              value={formExt.email}
              onChange={(e) =>
                setFormExt((p) => ({ ...p, email: e.target.value }))
              }
              placeholder="tu@email.com"
              className="input-trato"
            />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setPaso("plan")} className="btn-secondary">
              Volver
            </button>
            <button
              onClick={() => {
                if (
                  !formExt.marca ||
                  !formExt.modelo ||
                  !formExt.direccion ||
                  !formExt.nombre ||
                  !formExt.telefono
                ) {
                  setError("Completa todos los campos obligatorios.");
                  return;
                }
                setError("");
                setPaso("pago");
              }}
              className="btn-primary"
            >
              Continuar al pago →
            </button>
          </div>
          {error && <p className="text-trato-danger text-xs">{error}</p>}
        </div>
      )}

      {paso === "pago" && (
        <div className="space-y-4">
          <h2 className="font-semibold text-trato-text mb-2">
            Pago de la inspeccion
          </h2>

          <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-trato-green font-semibold">
                {planActual.nombre}
              </p>
              <p className="text-trato-green/70 text-xs">
                {planActual.puntos} puntos · {planActual.plazo}
              </p>
            </div>
            <p className="text-trato-green font-bold text-xl">
              ${planActual.precio.toLocaleString("es-CL")}
            </p>
          </div>

          <div className="card-trato">
            <p className="section-label mb-3">Datos de transferencia</p>
            <div className="bg-trato-dark rounded-xl p-4 space-y-3">
              {[
                { label: "Titular", value: CUENTA_PAGO.titular },
                { label: "Banco", value: CUENTA_PAGO.banco },
                { label: "Tipo", value: CUENTA_PAGO.tipo },
                { label: "N° cuenta", value: CUENTA_PAGO.numero },
                { label: "RUT", value: CUENTA_PAGO.rut },
                { label: "Email", value: CUENTA_PAGO.email },
                {
                  label: "Monto",
                  value: `$${planActual.precio.toLocaleString("es-CL")}`,
                },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between">
                  <div>
                    <p className="text-trato-gray3 text-[10px]">{label}</p>
                    <p className="text-white text-sm font-medium">{value}</p>
                  </div>
                  <button
                    onClick={() => copiar(value, label)}
                    className="text-trato-green text-[10px] border border-trato-green/30 px-2 py-1 rounded-lg hover:bg-trato-green/10 transition-colors"
                  >
                    {copiado === label ? "✓ Copiado" : "Copiar"}
                  </button>
                </div>
              ))}
            </div>
            <div className="mt-3 bg-trato-green-bg border border-trato-green/20 rounded-lg p-3">
              <p className="text-trato-green text-xs leading-relaxed">
                Agrega en el comentario de la transferencia tu nombre y el auto.
                Luego envia el comprobante a{" "}
                <strong>soporte@tratonline.cl</strong> y coordinaremos la
                inspeccion en menos de 2 horas habiles.
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setPaso("datos")} className="btn-secondary">
              Volver
            </button>
            <a
              href="mailto:soporte@tratonline.cl?subject=Comprobante inspección precompra"
              className="btn-primary text-center"
            >
              Enviar comprobante por email →
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
