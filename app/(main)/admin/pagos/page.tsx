"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const TIPO_LABEL: Record<string, { label: string; color: string }> = {
  fee_venta: { label: "Fee venta", color: "badge-green" },
  inspeccion: { label: "Inspeccion", color: "badge-amber" },
  membresia: {
    label: "Membresia",
    color:
      "text-trato-green-l bg-trato-green/10 px-2 py-0.5 rounded-full text-xs",
  },
};

const ESTADO_COLOR: Record<string, string> = {
  pendiente:
    "text-trato-amber bg-trato-amber/10 px-2 py-0.5 rounded-full text-xs",
  verificado:
    "text-trato-green bg-trato-green/10 px-2 py-0.5 rounded-full text-xs",
  rechazado: "text-trato-danger bg-red-500/10 px-2 py-0.5 rounded-full text-xs",
};

export default function AdminPagosPage() {
  const router = useRouter();
  const [pagos, setPagos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [filtro, setFiltro] = useState<"todos" | "pendiente" | "verificado">(
    "todos",
  );
  const [notas, setNotas] = useState<Record<string, string>>({});
  const [procesando, setProcesando] = useState<string | null>(null);

  useEffect(() => {
    cargarPagos();
  }, []);

  async function cargarPagos() {
    const res = await fetch("/api/pagos");
    if (res.status === 403) {
      router.push("/matches");
      return;
    }
    const { pagos } = await res.json();
    setPagos(pagos || []);
    setCargando(false);
  }

  async function actualizarEstado(id: string, estado: string) {
    setProcesando(id);
    await fetch("/api/pagos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado, notas: notas[id] || "" }),
    });
    await cargarPagos();
    setProcesando(null);
  }

  const pagosFiltrados = pagos.filter((p) =>
    filtro === "todos" ? true : p.estado === filtro,
  );

  const totalPendiente = pagos
    .filter((p) => p.estado === "pendiente")
    .reduce((s, p) => s + p.monto, 0);
  const totalVerificado = pagos
    .filter((p) => p.estado === "verificado")
    .reduce((s, p) => s + p.monto, 0);

  if (cargando)
    return (
      <div className="max-w-4xl mx-auto space-y-3">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-trato-gray1 rounded-xl animate-pulse"
          />
        ))}
      </div>
    );

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <Link
              href="/admin"
              className="text-trato-text2 hover:text-trato-text transition-colors"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
                <path
                  d="M12 4l-6 6 6 6"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
            <h1 className="text-xl font-semibold text-trato-text">
              Panel de pagos
            </h1>
          </div>
          <p className="text-trato-text2 text-sm">
            Gestiona y verifica todos los pagos por transferencia
          </p>
        </div>
        <button
          onClick={cargarPagos}
          className="text-trato-green text-xs border border-trato-green/30 px-3 py-1.5 rounded-lg hover:bg-trato-green/10 transition-colors"
        >
          Actualizar
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-amber">
            {pagos.filter((p) => p.estado === "pendiente").length}
          </p>
          <p className="text-trato-text2 text-xs mt-1">
            Pendientes de verificar
          </p>
          <p className="text-trato-amber text-xs font-medium mt-0.5">
            ${totalPendiente.toLocaleString("es-CL")}
          </p>
        </div>
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-green">
            {pagos.filter((p) => p.estado === "verificado").length}
          </p>
          <p className="text-trato-text2 text-xs mt-1">Verificados</p>
          <p className="text-trato-green text-xs font-medium mt-0.5">
            ${totalVerificado.toLocaleString("es-CL")}
          </p>
        </div>
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-text">{pagos.length}</p>
          <p className="text-trato-text2 text-xs mt-1">Total pagos</p>
          <p className="text-trato-text2 text-xs font-medium mt-0.5">
            ${pagos.reduce((s, p) => s + p.monto, 0).toLocaleString("es-CL")}
          </p>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-5">
        {(["todos", "pendiente", "verificado"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFiltro(f)}
            className={`px-4 py-1.5 rounded-lg text-sm transition-colors capitalize
              ${
                filtro === f
                  ? "bg-trato-green text-white"
                  : "text-trato-text2 border border-trato-border hover:border-trato-steel/60"
              }`}
          >
            {f === "todos"
              ? "Todos"
              : f === "pendiente"
                ? "Pendientes"
                : "Verificados"}
            {f !== "todos" && (
              <span className="ml-1.5 text-[10px] opacity-70">
                ({pagos.filter((p) => p.estado === f).length})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Lista de pagos */}
      {pagosFiltrados.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-trato-border rounded-2xl">
          <p className="text-trato-text font-medium mb-1">
            Sin pagos en esta categoria
          </p>
          <p className="text-trato-text2 text-sm">
            Los pagos apareceran aqui cuando los clientes transfieran
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pagosFiltrados.map((pago: any) => (
            <div
              key={pago.id}
              className={`card-trato border-l-4
              ${
                pago.estado === "pendiente"
                  ? "border-l-trato-amber"
                  : pago.estado === "verificado"
                    ? "border-l-trato-green"
                    : "border-l-red-400"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={TIPO_LABEL[pago.tipo]?.color || "badge-amber"}
                  >
                    {TIPO_LABEL[pago.tipo]?.label || pago.tipo}
                  </span>
                  <span className={ESTADO_COLOR[pago.estado] || ""}>
                    {pago.estado}
                  </span>
                  <span className="text-trato-text font-bold text-sm">
                    ${Number(pago.monto).toLocaleString("es-CL")}
                  </span>
                </div>
                <span className="text-trato-text2 text-xs flex-shrink-0">
                  {new Date(pago.created_at).toLocaleDateString("es-CL", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "2-digit",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-1 mb-3">
                {pago.nombre_cliente && (
                  <div>
                    <p className="text-trato-text2 text-[10px]">Cliente</p>
                    <p className="text-trato-text text-sm">
                      {pago.nombre_cliente}
                    </p>
                  </div>
                )}
                {pago.email_cliente && (
                  <div>
                    <p className="text-trato-text2 text-[10px]">Email</p>
                    <a
                      href={`mailto:${pago.email_cliente}`}
                      className="text-trato-green text-sm hover:underline"
                    >
                      {pago.email_cliente}
                    </a>
                  </div>
                )}
                {pago.telefono && (
                  <div>
                    <p className="text-trato-text2 text-[10px]">Telefono</p>
                    <a
                      href={`tel:${pago.telefono}`}
                      className="text-trato-green text-sm hover:underline"
                    >
                      {pago.telefono}
                    </a>
                  </div>
                )}
                {pago.detalle && (
                  <div className="col-span-2">
                    <p className="text-trato-text2 text-[10px]">Detalle</p>
                    <p className="text-trato-text text-sm">{pago.detalle}</p>
                  </div>
                )}
                {pago.comprobante_ref && (
                  <div>
                    <p className="text-trato-text2 text-[10px]">
                      Ref comprobante
                    </p>
                    <p className="text-trato-text text-sm font-mono">
                      {pago.comprobante_ref}
                    </p>
                  </div>
                )}
                {pago.verificado_at && (
                  <div>
                    <p className="text-trato-text2 text-[10px]">
                      Verificado el
                    </p>
                    <p className="text-trato-text text-sm">
                      {new Date(pago.verificado_at).toLocaleDateString("es-CL")}
                    </p>
                  </div>
                )}
              </div>

              {pago.estado === "pendiente" && (
                <div className="border-t border-trato-border pt-3 space-y-2">
                  <input
                    type="text"
                    placeholder="Notas internas (opcional)"
                    value={notas[pago.id] || ""}
                    onChange={(e) =>
                      setNotas((prev) => ({
                        ...prev,
                        [pago.id]: e.target.value,
                      }))
                    }
                    className="input-trato text-xs py-1.5"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => actualizarEstado(pago.id, "verificado")}
                      disabled={procesando === pago.id}
                      className="bg-trato-green text-white text-xs px-4 py-1.5 rounded-lg font-medium hover:bg-trato-green-l transition-colors disabled:opacity-50"
                    >
                      {procesando === pago.id
                        ? "Procesando..."
                        : "✓ Verificar pago"}
                    </button>
                    <button
                      onClick={() => actualizarEstado(pago.id, "rechazado")}
                      disabled={procesando === pago.id}
                      className="text-trato-danger text-xs px-4 py-1.5 rounded-lg border border-trato-danger/30 hover:bg-red-50 transition-colors disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                </div>
              )}

              {pago.notas && (
                <div className="mt-2 bg-trato-gray1 rounded-lg px-3 py-2">
                  <p className="text-trato-text2 text-xs">Nota: {pago.notas}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
