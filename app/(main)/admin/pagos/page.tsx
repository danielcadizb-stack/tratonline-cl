"use client"
import { useState, useEffect } from "react"

type Pago = {
  id: string
  tipo: string
  estado: string
  monto: number
  nombre_cliente: string
  email_cliente: string
  telefono?: string
  detalle?: string
  comprobante_ref?: string
  notas?: string
  match_id?: string
  mecanico_id?: string
  created_at: string
  verificado_at?: string
}

export default function AdminPagosPage() {
  const [pagos, setPagos] = useState<Pago[]>([])
  const [cargando, setCargando] = useState(true)
  const [filtro, setFiltro] = useState("todos")
  const [mostrarForm, setMostrarForm] = useState(false)
  const [verificandoId, setVerificandoId] = useState<string | null>(null)
  const [mecanicoId, setMecanicoId] = useState("")
  const [matchId, setMatchId] = useState("")
  const [form, setForm] = useState({
    tipo: "fee_venta",
    monto: "",
    nombre_cliente: "",
    email_cliente: "",
    telefono: "",
    detalle: "",
    comprobante_ref: "",
  })

  useEffect(() => { cargarPagos() }, [])

  async function cargarPagos() {
    const r = await fetch("/api/pagos")
    const { pagos } = await r.json()
    setPagos(pagos || [])
    setCargando(false)
  }

  async function registrarPago() {
    await fetch("/api/pagos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, monto: Number(form.monto) }),
    })
    setMostrarForm(false)
    setForm({ tipo: "fee_venta", monto: "", nombre_cliente: "", email_cliente: "", telefono: "", detalle: "", comprobante_ref: "" })
    cargarPagos()
  }

  async function actualizarEstado(id: string, estado: string) {
    await fetch("/api/pagos", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id,
        estado,
        mecanico_id: mecanicoId || undefined,
        match_id: matchId || undefined,
      }),
    })
    setVerificandoId(null)
    setMecanicoId("")
    setMatchId("")
    cargarPagos()
  }

  const pagosFiltrados = pagos.filter(p =>
    filtro === "todos" ? true : p.estado === filtro
  )

  const pendientes = pagos.filter(p => p.estado === "pendiente")
  const verificados = pagos.filter(p => p.estado === "verificado")
  const totalVerificado = verificados.reduce((s, p) => s + (p.monto || 0), 0)

  function labelTipo(tipo: string) {
    if (tipo === "fee_venta") return "Fee venta"
    if (tipo === "inspeccion") return "Inspección"
    if (tipo === "membresia") return "Membresía"
    return tipo
  }

  if (cargando) return <div className="max-w-4xl mx-auto"><div className="h-32 bg-trato-gray1 rounded-2xl animate-pulse" /></div>

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-trato-text">Gestión de pagos</h1>
          <p className="text-trato-text2 text-sm mt-1">Panel de verificación manual</p>
        </div>
        <button
          onClick={() => setMostrarForm(!mostrarForm)}
          className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors"
        >
          + Registrar pago
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-amber">{pendientes.length}</p>
          <p className="text-trato-text2 text-xs mt-1">Pendientes</p>
        </div>
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-green">{verificados.length}</p>
          <p className="text-trato-text2 text-xs mt-1">Verificados</p>
        </div>
        <div className="card-trato text-center">
          <p className="text-2xl font-bold text-trato-green">${totalVerificado.toLocaleString("es-CL")}</p>
          <p className="text-trato-text2 text-xs mt-1">Total recaudado</p>
        </div>
      </div>

      {mostrarForm && (
        <div className="card-trato mb-6">
          <h2 className="font-semibold text-trato-text mb-4">Registrar nuevo pago</h2>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Tipo</label>
              <select value={form.tipo} onChange={e => setForm({...form, tipo: e.target.value})}
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text">
                <option value="fee_venta">Fee venta ($100.000)</option>
                <option value="inspeccion">Inspección</option>
                <option value="membresia">Membresía mecánico ($15.000)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Monto</label>
              <input value={form.monto} onChange={e => setForm({...form, monto: e.target.value})}
                placeholder="100000" type="number"
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Nombre cliente</label>
              <input value={form.nombre_cliente} onChange={e => setForm({...form, nombre_cliente: e.target.value})}
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Email</label>
              <input value={form.email_cliente} onChange={e => setForm({...form, email_cliente: e.target.value})}
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Teléfono</label>
              <input value={form.telefono} onChange={e => setForm({...form, telefono: e.target.value})}
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
            <div>
              <label className="text-xs text-trato-text2 mb-1 block">Referencia transferencia</label>
              <input value={form.comprobante_ref} onChange={e => setForm({...form, comprobante_ref: e.target.value})}
                placeholder="Nro. operación o RUT"
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
            <div className="col-span-2">
              <label className="text-xs text-trato-text2 mb-1 block">Detalle</label>
              <input value={form.detalle} onChange={e => setForm({...form, detalle: e.target.value})}
                placeholder="Ej: Toyota Corolla 2019 / Plan Completo"
                className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-sm text-trato-text" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={registrarPago}
              className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors">
              Guardar
            </button>
            <button onClick={() => setMostrarForm(false)}
              className="text-trato-text2 text-sm px-4 py-2 rounded-lg border border-trato-border hover:border-trato-steel/60 transition-colors">
              Cancelar
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-2 mb-4">
        {["todos", "pendiente", "verificado", "rechazado"].map(f => (
          <button key={f} onClick={() => setFiltro(f)}
            className={`text-xs px-3 py-1.5 rounded-lg border transition-colors capitalize
              ${filtro === f ? "bg-trato-green text-white border-trato-green" : "text-trato-text2 border-trato-border hover:border-trato-steel/60"}`}>
            {f === "todos" ? "Todos" : f === "pendiente" ? `Pendientes (${pendientes.length})` : f === "verificado" ? "Verificados" : "Rechazados"}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {pagosFiltrados.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-trato-border rounded-2xl">
            <p className="text-trato-text2 text-sm">No hay pagos en este estado</p>
          </div>
        ) : pagosFiltrados.map(pago => (
          <div key={pago.id} className="card-trato">
            <div className="flex items-start justify-between mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium
                    ${pago.tipo === "fee_venta" ? "bg-trato-green/10 text-trato-green" :
                      pago.tipo === "membresia" ? "bg-blue-500/10 text-blue-400" :
                      "bg-trato-amber/10 text-trato-amber"}`}>
                    {labelTipo(pago.tipo)}
                  </span>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full
                    ${pago.estado === "pendiente" ? "bg-trato-amber/10 text-trato-amber" :
                      pago.estado === "verificado" ? "bg-trato-green/10 text-trato-green" :
                      "bg-red-500/10 text-red-400"}`}>
                    {pago.estado}
                  </span>
                </div>
                <p className="font-semibold text-trato-text">{pago.nombre_cliente}</p>
                <p className="text-trato-text2 text-xs">{pago.email_cliente} {pago.telefono && `· ${pago.telefono}`}</p>
                {pago.detalle && <p className="text-trato-text2 text-xs mt-0.5">{pago.detalle}</p>}
                {pago.comprobante_ref && <p className="text-trato-gray3 text-xs mt-0.5">Ref: {pago.comprobante_ref}</p>}
                {pago.mecanico_id && <p className="text-blue-400 text-xs mt-0.5">Mecánico ID: {pago.mecanico_id}</p>}
              </div>
              <div className="text-right">
                <p className="font-bold text-trato-green">${(pago.monto || 0).toLocaleString("es-CL")}</p>
                <p className="text-trato-gray3 text-[10px] mt-0.5">
                  {new Date(pago.created_at).toLocaleDateString("es-CL")}
                </p>
                {pago.verificado_at && (
                  <p className="text-trato-green text-[10px]">
                    Verificado {new Date(pago.verificado_at).toLocaleDateString("es-CL")}
                  </p>
                )}
              </div>
            </div>

            {pago.estado === "pendiente" && (
              <>
                {verificandoId === pago.id ? (
                  <div className="border-t border-trato-border pt-3 mt-2">
                    {pago.tipo === "membresia" && (
                      <div className="mb-2">
                        <label className="text-xs text-trato-text2 mb-1 block">ID del mecánico (UUID de Supabase)</label>
                        <input value={mecanicoId} onChange={e => setMecanicoId(e.target.value)}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-xs text-trato-text font-mono" />
                      </div>
                    )}
                    {pago.tipo === "fee_venta" && (
                      <div className="mb-2">
                        <label className="text-xs text-trato-text2 mb-1 block">ID del match (opcional)</label>
                        <input value={matchId} onChange={e => setMatchId(e.target.value)}
                          placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                          className="w-full bg-trato-gray1 border border-trato-border rounded-lg px-3 py-2 text-xs text-trato-text font-mono" />
                      </div>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => actualizarEstado(pago.id, "verificado")}
                        className="bg-trato-green text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-trato-green-l transition-colors">
                        Confirmar verificación
                      </button>
                      <button onClick={() => { setVerificandoId(null); setMecanicoId(""); setMatchId("") }}
                        className="text-trato-text2 text-xs px-3 py-1.5 rounded-lg border border-trato-border">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex gap-2 border-t border-trato-border pt-3 mt-2">
                    <button onClick={() => setVerificandoId(pago.id)}
                      className="bg-trato-green text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-trato-green-l transition-colors">
                      Verificar pago
                    </button>
                    <button onClick={() => actualizarEstado(pago.id, "rechazado")}
                      className="text-red-400 text-xs px-3 py-1.5 rounded-lg border border-red-400/30 hover:bg-red-400/10 transition-colors">
                      Rechazar
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}