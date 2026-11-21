import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getCurrentUser, createServerClientInstance } from '@/lib/supabase-server'
import { formatCLP } from '@/lib/autofact'

export default async function AutoPublicoPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = await createServerClientInstance()

  const { data: auto } = await supabase
    .from('autos')
    .select('*')
    .eq('id', params.id)
    .eq('estado', 'disponible')
    .single()

  if (!auto) redirect('/explorar')

  const user = await getCurrentUser()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/explorar" className="text-trato-text2 hover:text-trato-text transition-colors">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </Link>
        <h1 className="text-xl font-semibold text-trato-text">
          {auto.marca} {auto.modelo} {auto.anio}
        </h1>
      </div>

      {auto.fotos && auto.fotos.length > 0 ? (
        <div className="mb-6">
          <div className="aspect-video rounded-2xl overflow-hidden mb-2 bg-trato-dark">
            <img src={auto.fotos[0]} alt={auto.marca} className="w-full h-full object-cover" />
          </div>
          {auto.fotos.length > 1 && (
            <div className="grid grid-cols-4 gap-2">
              {auto.fotos.slice(1, 5).map((url: string, i: number) => (
                <div key={i} className="aspect-square rounded-xl overflow-hidden bg-trato-dark">
                  <img src={url} alt={auto.marca} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="aspect-video rounded-2xl bg-trato-gray1 flex items-center justify-center mb-6">
          <span className="text-6xl">🚗</span>
        </div>
      )}

      <div className="bg-trato-dark rounded-2xl p-5 mb-4 flex items-center justify-between">
        <div>
          <p className="text-trato-gray3 text-xs mb-1">Precio de venta</p>
          <p className="text-white text-3xl font-bold">{formatCLP(auto.precio_pedido)}</p>
        </div>
        {user ? (
          user.rol === 'comprador' ? (
            <Link href="/matches" className="bg-trato-green text-white px-5 py-2.5 rounded-[10px] font-semibold text-sm hover:bg-trato-green-l transition-colors">
              Ver si hay match
            </Link>
          ) : user.rol === 'vendedor' ? (
            <Link href="/matches" className="bg-trato-green text-white px-5 py-2.5 rounded-[10px] font-semibold text-sm hover:bg-trato-green-l transition-colors">
              Volver a mis matches
            </Link>
          ) : null
        ) : (
          <Link href="/registro" className="bg-trato-green text-white px-5 py-2.5 rounded-[10px] font-semibold text-sm hover:bg-trato-green-l transition-colors">
            Me interesa
          </Link>
        )}
      </div>

      <div className="card-trato mb-4">
        <p className="section-label mb-3">Datos del vehiculo</p>
        <div className="grid grid-cols-2 gap-y-3">
          {[
            ['Marca',       auto.marca],
            ['Modelo',      auto.modelo],
            ['Año',         auto.anio],
            ['Kilometraje', Number(auto.km).toLocaleString('es-CL') + ' km'],
            ['Transmision', auto.transmision === 'automatico' ? 'Automatico' : 'Manual'],
            ['Combustible', auto.combustible],
            ['Tipo',        auto.tipo || '-'],
            ['Color',       auto.color || '-'],
            ['Ubicacion',   auto.region],
          ].map(([lbl, val]) => (
            <div key={lbl}>
              <p className="text-trato-text2 text-xs">{lbl}</p>
              <p className="text-trato-text text-sm font-medium capitalize">{val}</p>
            </div>
          ))}
        </div>
        {auto.descripcion && (
          <div className="mt-3 pt-3 border-t border-trato-border">
            <p className="text-trato-text2 text-xs mb-1">Descripcion del vendedor</p>
            <p className="text-trato-text text-sm leading-relaxed">{auto.descripcion}</p>
          </div>
        )}
      </div>

      <div className="bg-trato-green-bg border border-trato-green/20 rounded-xl p-4">
        <p className="text-trato-green font-medium text-sm mb-1">Compra segura con TratOnline</p>
        <p className="text-trato-green/80 text-xs leading-relaxed">
          Coordina la visita e inspeccion mecanica por nuestra plataforma.
          Solo el vendedor paga $100.000 cuando se concreta la venta.
        </p>
        {!user && (
          <Link href="/registro" className="inline-block mt-3 bg-trato-green text-white text-xs px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors">
            Crear cuenta gratis para contactar
          </Link>
        )}
      </div>
    </div>
  )
}