'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { formatCLP } from '@/lib/autofact'

const MARCAS_OPC = ['Toyota', 'Mazda', 'Kia', 'Hyundai', 'Chevrolet',
  'Nissan', 'Honda', 'Mitsubishi', 'Ford', 'Suzuki',
  'Volkswagen', 'Subaru', 'Otra']
const TIPOS_OPC  = ['sedan', 'suv', 'hatchback', 'camioneta', 'otro']
const REGIONES   = ['Las Condes', 'Providencia', 'Ñuñoa', 'Vitacura',
  'Maipú', 'Santiago Centro', 'Quilicura', 'Puente Alto',
  'La Florida', 'Cualquier comuna RM']

export default function BuscarPage() {
  const router = useRouter()
  const [loading, setLoading]     = useState(false)
  const [error, setError]         = useState('')
  const [cargando, setCargando]   = useState(true)
  const [perfilExistente, setPerfilExistente] = useState<any>(null)
  const [marcas, setMarcas]           = useState<string[]>([])
  const [tipos, setTipos]             = useState<string[]>([])
  const [anioMin, setAnioMin]         = useState('2018')
  const [anioMax, setAnioMax]         = useState(String(new Date().getFullYear()))
  const [kmMax, setKmMax]             = useState('80000')
  const [presupuesto, setPresupuesto] = useState('')
  const [transmision, setTransmision] = useState('cualquiera')
  const [combustible, setCombustible] = useState('cualquiera')
  const [region, setRegion]           = useState('')
  const [urgencia, setUrgencia]       = useState('flexible')

  useEffect(() => {
    fetch('/api/perfiles')
      .then(r => r.json())
      .then(({ perfil }) => {
        if (perfil) {
          setPerfilExistente(perfil)
          setMarcas(perfil.marcas || [])
          setTipos(perfil.tipos || [])
          setAnioMin(String(perfil.anio_min))
          setAnioMax(String(perfil.anio_max))
          setKmMax(String(perfil.km_max))
          setPresupuesto(String(perfil.presupuesto))
          setTransmision(perfil.transmision)
          setCombustible(perfil.combustible)
          setRegion(perfil.region)
          setUrgencia(perfil.urgencia)
        }
      })
      .finally(() => setCargando(false))
  }, [])

  function toggleMarca(m: string) {
    setMarcas(prev => prev.includes(m) ? prev.filter(x => x !== m) : [...prev, m])
  }

  function toggleTipo(t: string) {
    setTipos(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  async function handleGuardar() {
    if (!presupuesto || !region) {
      setError('Debes indicar tu presupuesto y zona de busqueda.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/perfiles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          marcas, tipos,
          anio_min: Number(anioMin), anio_max: Number(anioMax),
          km_max: Number(kmMax), presupuesto: Number(presupuesto),
          transmision, combustible, region, urgencia,
        }),
      })
      if (!res.ok) throw new Error('Error al guardar perfil')
      router.push('/matches?perfil=nuevo')
    } catch (e: any) {
      setError(e.message)
      setLoading(false)
    }
  }

  if (cargando) {
    return (
      <div className="max-w-lg mx-auto space-y-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-12 bg-trato-gray1 rounded-xl animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-trato-text">
          {perfilExistente ? 'Actualizar busqueda' : 'Definir que busco'}
        </h1>
        <p className="text-trato-text2 text-sm mt-1">
          Te avisamos apenas aparezca un auto que calce con tu perfil
        </p>
      </div>
      <div className="space-y-6">
        <div>
          <label className="section-label">Marcas de interes</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {MARCAS_OPC.map(m => (
              <button key={m} type="button" onClick={() => toggleMarca(m)}
                className={`tag-filter ${marcas.includes(m) ? 'active' : ''}`}>
                {m}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="section-label">Tipo de auto</label>
          <div className="flex flex-wrap gap-2 mt-2">
            {TIPOS_OPC.map(t => (
              <button key={t} type="button" onClick={() => toggleTipo(t)}
                className={`tag-filter capitalize ${tipos.includes(t) ? 'active' : ''}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="section-label">Rango de año</label>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-trato-text2 text-xs mb-1 block">Desde</label>
              <input type="number" value={anioMin} onChange={e => setAnioMin(e.target.value)}
                min="2000" max={anioMax} className="input-trato" />
            </div>
            <div>
              <label className="text-trato-text2 text-xs mb-1 block">Hasta</label>
              <input type="number" value={anioMax} onChange={e => setAnioMax(e.target.value)}
                min={anioMin} max={new Date().getFullYear()} className="input-trato" />
            </div>
          </div>
        </div>
        <div>
          <label className="section-label">Kilometraje maximo</label>
          <div className="flex gap-2 flex-wrap mt-2">
            {['50000','80000','100000','150000','200000'].map(k => (
              <button key={k} type="button" onClick={() => setKmMax(k)}
                className={`tag-filter ${kmMax === k ? 'active' : ''}`}>
                {Number(k).toLocaleString('es-CL')} km
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="section-label">Presupuesto maximo (CLP)</label>
          <input type="number" value={presupuesto} onChange={e => setPresupuesto(e.target.value)}
            placeholder="10000000" min="0" step="500000"
            className="input-trato text-base font-semibold" />
          {presupuesto && (
            <p className="text-trato-green text-[10px] mt-1 font-medium">
              {formatCLP(Number(presupuesto))}
            </p>
          )}
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="section-label">Transmision</label>
            <div className="flex flex-col gap-1 mt-2">
              {['cualquiera','automatico','manual'].map(t => (
                <button key={t} type="button" onClick={() => setTransmision(t)}
                  className={`tag-filter text-left ${transmision === t ? 'active' : ''}`}>
                  {t === 'cualquiera' ? 'Cualquiera' : t === 'automatico' ? 'Automatico' : 'Manual'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="section-label">Combustible</label>
            <div className="flex flex-col gap-1 mt-2">
              {['cualquiera','bencina','diesel','hibrido','electrico'].map(c => (
                <button key={c} type="button" onClick={() => setCombustible(c)}
                  className={`tag-filter text-left capitalize ${combustible === c ? 'active' : ''}`}>
                  {c === 'cualquiera' ? 'Cualquiera' : c}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="section-label">Zona</label>
          <select value={region} onChange={e => setRegion(e.target.value)} className="input-trato">
            <option value="">Selecciona zona</option>
            {REGIONES.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <div>
          <label className="section-label">Cuando quieres comprar</label>
          <div className="grid grid-cols-2 gap-2 mt-2">
            {[
              ['inmediata','Lo antes posible'],
              ['1mes','En el proximo mes'],
              ['3meses','En los proximos 3 meses'],
              ['flexible','Sin apuro, voy viendo'],
            ].map(([val, lbl]) => (
              <button key={val} type="button" onClick={() => setUrgencia(val)}
                className={`tag-filter text-left ${urgencia === val ? 'active' : ''}`}>
                {lbl}
              </button>
            ))}
          </div>
        </div>
        {error && (
          <p className="text-trato-danger text-xs bg-red-50 border border-trato-danger/20 rounded-lg px-3 py-2">{error}</p>
        )}
        <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-3">
          <p className="text-trato-green text-xs leading-relaxed">
            Cuando aparezca un auto compatible recibiras una alerta. Solo matches con score de 60/100 o mas.
          </p>
        </div>
        <button onClick={handleGuardar} disabled={loading} className="btn-primary">
          {loading ? 'Guardando...' : perfilExistente ? 'Actualizar mi busqueda' : 'Activar alertas de match'}
        </button>
      </div>
    </div>
  )
}
