import Link from "next/link"
import Image from "next/image"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-trato-dark">
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Image src="/logo.svg" alt="TratOnline" width={150} height={34} priority />
        <div className="flex items-center gap-3">
          <Link href="/login" className="text-trato-gray2 text-sm hover:text-white transition-colors">Ingresar</Link>
          <Link href="/registro" className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg font-medium hover:bg-trato-green-l transition-colors">Crear cuenta gratis</Link>
        </div>
      </nav>
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-trato-green/10 border border-trato-green/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-trato-green animate-pulse" />
          <span className="text-trato-green text-xs font-medium">Plataforma activa en Santiago</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-4">
          Compra y vende tu auto<br/>
          <span className="text-trato-green-l">sin complicaciones</span>
        </h1>
        <p className="text-trato-gray2 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Conectamos vendedores con compradores ideales mediante un motor de matching inteligente. Todo el proceso en una sola plataforma.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/registro" className="bg-trato-green text-white px-8 py-3.5 rounded-[10px] font-semibold text-sm hover:bg-trato-green-l transition-colors">Publicar mi auto gratis</Link>
          <Link href="/registro" className="bg-trato-steel/30 text-white px-8 py-3.5 rounded-[10px] font-semibold text-sm border border-trato-steel/50 hover:bg-trato-steel/50 transition-colors">Buscar un auto</Link>
        </div>
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          <div className="text-center">
            <p className="text-trato-green-l text-2xl font-bold">Gratis</p>
            <p className="text-trato-gray3 text-xs mt-0.5">Para publicar</p>
          </div>
          <div className="text-center">
            <p className="text-trato-green-l text-2xl font-bold">48h</p>
            <p className="text-trato-gray3 text-xs mt-0.5">Primer match</p>
          </div>
          <div className="text-center">
            <p className="text-trato-green-l text-2xl font-bold">100K</p>
            <p className="text-trato-gray3 text-xs mt-0.5">Solo si vendes</p>
          </div>
        </div>
      </section>
      <section className="bg-trato-mid border-t border-trato-steel/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-2">Como funciona</h2>
          <p className="text-trato-gray3 text-center text-sm mb-10">Tres pasos para cerrar tu venta</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-trato-dark border border-trato-steel/40 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-4">🚗</div>
              <div className="w-6 h-6 rounded-full bg-trato-green text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">1</div>
              <h3 className="text-white font-semibold mb-2">Publicas gratis</h3>
              <p className="text-trato-gray3 text-sm leading-relaxed">Carga los datos de tu auto en 3 minutos. El motor de matching empieza a buscar compradores de inmediato.</p>
            </div>
            <div className="bg-trato-dark border border-trato-steel/40 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-4">⚡</div>
              <div className="w-6 h-6 rounded-full bg-trato-green text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">2</div>
              <h3 className="text-white font-semibold mb-2">Hacemos el match</h3>
              <p className="text-trato-gray3 text-sm leading-relaxed">Nuestro algoritmo conecta tu auto con compradores que tienen exactamente tu perfil. Score de 0 a 100.</p>
            </div>
            <div className="bg-trato-dark border border-trato-steel/40 rounded-2xl p-6 text-center">
              <div className="text-3xl mb-4">🤝</div>
              <div className="w-6 h-6 rounded-full bg-trato-green text-white text-xs font-bold flex items-center justify-center mx-auto mb-3">3</div>
              <h3 className="text-white font-semibold mb-2">Cierras el trato</h3>
              <p className="text-trato-gray3 text-sm leading-relaxed">Chatean, coordinan la visita y la inspeccion mecanica. Solo pagas cuando la venta se concreta.</p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-10">Una plataforma, tres roles</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-trato-mid border border-trato-steel/40 rounded-2xl p-6">
            <div className="text-3xl mb-3">🚗</div>
            <h3 className="text-white font-semibold mb-2">Vendedor</h3>
            <p className="text-trato-gray3 text-sm leading-relaxed mb-4">Publica tu auto gratis y recibe matches con compradores reales. Solo pagas si vendes.</p>
            <Link href="/registro" className="text-trato-green-l text-sm font-medium hover:underline">Publicar mi auto</Link>
          </div>
          <div className="bg-trato-mid border border-trato-steel/40 rounded-2xl p-6">
            <div className="text-3xl mb-3">🔍</div>
            <h3 className="text-white font-semibold mb-2">Comprador</h3>
            <p className="text-trato-gray3 text-sm leading-relaxed mb-4">Define que buscas y te avisamos apenas aparezca un auto compatible. Sin perder tiempo.</p>
            <Link href="/registro" className="text-trato-green-l text-sm font-medium hover:underline">Buscar mi auto</Link>
          </div>
          <div className="bg-trato-mid border border-trato-steel/40 rounded-2xl p-6">
            <div className="text-3xl mb-3">🔧</div>
            <h3 className="text-white font-semibold mb-2">Mecanico</h3>
            <p className="text-trato-gray3 text-sm leading-relaxed mb-4">Ofrece inspecciones pre-compra en tu zona. Accede a clientes que necesitan tu servicio.</p>
            <Link href="/registro" className="text-trato-green-l text-sm font-medium hover:underline">Registrarme</Link>
          </div>
        </div>
      </section>
      <section className="bg-trato-mid border-t border-trato-steel/30 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">Listo para hacer el trato</h2>
          <p className="text-trato-gray3 mb-8">Unete a la plataforma que conecta vendedores y compradores de autos en Chile de forma inteligente.</p>
          <Link href="/registro" className="inline-block bg-trato-green text-white px-10 py-4 rounded-[10px] font-semibold hover:bg-trato-green-l transition-colors">Crear cuenta gratis</Link>
        </div>
      </section>
      <footer className="border-t border-trato-steel/30 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Image src="/logo.svg" alt="TratOnline" width={120} height={30} />
          <div className="flex gap-6 text-trato-gray3 text-xs">
            <Link href="/registro" className="hover:text-white transition-colors">Registrarse</Link>
            <Link href="/login" className="hover:text-white transition-colors">Ingresar</Link>
            <a href="mailto:soporte@tratonline.cl" className="hover:text-white transition-colors">soporte@tratonline.cl</a>
          </div>
          <div className="flex items-center gap-4">
            <p className="text-trato-gray3 text-xs">2026 TratOnline - Alfester Agency</p>
            <a href="https://wa.me/56967959942" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 bg-[#25D366] text-white text-xs px-3 py-1.5 rounded-full hover:bg-[#20b558] transition-colors font-medium">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              +56 9 6795 9942
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}