'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { formatCLP } from '@/lib/autofact'

export default function MisAutosPage() {
  const router = useRouter()
  const [autos, setAutos] = useState([])
  const [cargando, setCargando] = useState(true)

  useEffect(() => {
    fetch('/api/mis-autos')
      .then(r => r.json())
      .then(({ autos, error }) => {
        if (error) { router.push('/login'); return }
        setAutos(autos || [])
        setCargando(false)
      })
      .catch(() => setCargando(false))
  }, [])

  if (cargando) return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="h-32 bg-trato-gray1 rounded-2xl animate-pulse" />
      <div className="h-32 bg-trato-gray1 rounded-2xl animate-pulse" />
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-trato-text">Mis autos</h1>
          <p className="text-trato-text2 text-sm mt-1">{autos.length} publicaciones</p>
        </div>
        <Link href="/publicar" className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors">
          + Publicar auto
        </Link>
      </div>
      {autos.length === 0 ? (
        <div className="text-center py-16 border border-dashed border-trato-border rounded-2xl">
          <p className="text-trato-text font-medium mb-2">No tienes autos publicados</p>
          <Link href="/publicar" className="text-trato-green text-sm hover:underline">Publicar mi primer auto</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {autos.map((auto) => (
            <div key={auto.id} className="card-trato overflow-hidden">
              {auto.fotos?.[0] && (
                <div className="aspect-video rounded-xl overflow-hidden mb-3 bg-trato-dark -mx-4 -mt-4">
                  <img src={auto.fotos[0]} alt={auto.marca} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-trato-text">{auto.marca} {auto.modelo} {auto.anio}</p>
                  <p className="text-trato-text2 text-xs mt-0.5">{Number(auto.km).toLocaleString('es-CL')} km · {auto.transmision === 'automatico' ? 'Automatico' : 'Manual'} · {auto.region}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-3">
                  <p className="font-bold text-trato-green text-sm">{formatCLP(auto.precio_pedido)}</p>
                  <span className={auto.estado === 'disponible' ? 'text-trato-green text-xs' : 'text-trato-gray3 text-xs'}>{auto.estado}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 border-t border-trato-border pt-3">
                {auto.estado !== 'vendido' && (
                  <Link href={`/mis-autos/${auto.id}`} className="bg-trato-green text-white text-xs px-3 py-1.5 rounded-lg font-medium hover:bg-trato-green-l transition-colors">Editar</Link>
                )}
                <Link href={`/explorar/${auto.id}`} className="text-trato-text2 text-xs px-3 py-1.5 rounded-lg border border-trato-border hover:border-trato-steel/60 transition-colors">Ver publicacion</Link>
                <Link href="/matches" className="text-trato-green text-xs font-medium hover:underline ml-auto">Ver matches</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}