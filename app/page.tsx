import Link from 'next/link'
import Image from 'next/image'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-trato-dark">

      {/* Navbar público */}
      <nav className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Image src="/logo.svg" alt="TratOnline" width={150} height={34} priority />
        <div className="flex items-center gap-3">
          <Link href="/login"
            className="text-trato-gray2 text-sm hover:text-white transition-colors">
            Ingresar
          </Link>
          <Link href="/registro"
            className="bg-trato-green text-white text-sm px-4 py-2 rounded-lg
              font-medium hover:bg-trato-green-l transition-colors">
            Crear cuenta gratis
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-trato-green/10 border
          border-trato-green/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-2 h-2 rounded-full bg-trato-green animate-pulse" />
          <span className="text-trato-green text-xs font-medium">
            Plataforma activa en Santiago
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight
          tracking-tight mb-4">
          Compra y vende tu auto<br/>
          <span className="text-trato-green-l">sin complicaciones</span>
        </h1>

        <p className="text-trato-gray2 text-lg max-w-xl mx-auto mb-8 leading-relaxed">
          Conectamos vendedores con compradores ideales mediante un motor de
          matching inteligente. Todo el proceso en una sola plataforma.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
          <Link href="/registro"
            className="bg-trato-green text-white px-8 py-3.5 rounded-[10px]
              font-semibold text-sm hover:bg-trato-green-l transition-colors">
            Publicar mi auto gratis →
          </Link>
          <Link href="/registro"
            className="bg-trato-steel/30 text-white px-8 py-3.5 rounded-[10px]
              font-semibold text-sm border border-trato-steel/50
              hover:bg-trato-steel/50 transition-colors">
            Buscar un auto
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
          {[
            { v: '$0',    l: 'Para publicar' },
            { v: '48h',   l: 'Primer match' },
            { v: '$100K', l: 'Solo si vendes' },
          ].map(s => (
            <div key={s.l} className="text-center">
              <p className="text-trato-green-l text-2xl font-bold">{s.v}</p>
              <p className="text-trato-gray3 text-xs mt-0.5">{s.l}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Como funciona */}
      <section className="bg-trato-mid border-t border-trato-steel/30 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            ¿Cómo funciona?
          </h2>
          <p className="text-trato-gray3 text-center text-sm mb-10">
            Tres pasos para cerrar tu venta
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {[
              {
                n: '1', icon: '🚗', title: 'Publicas gratis',
                desc: 'Carga los datos de tu auto en 3 minutos. El motor de matching empieza a buscar compradores de inmediato.',
              },
              {
                n: '2', icon: '⚡', title: 'Hacemos el match',
                desc: 'Nuestro algoritmo conecta tu auto con compradores que tienen exactamente tu perfil. Score de 0 a 100.',
              },
              {
                n: '3', icon: '🤝', title: 'Cierras el trato',
                desc: 'Chatean, coordinan la visita y la inspección mecánica. Pagas $100.000 solo cuando la venta se concreta.',
              },
            ].map(step => (
              <div key={step.n}
                className="bg-trato-dark border border-trato-steel/40 rounded-2xl p-6 text-center">
                <div className="text-3xl mb-4">{step.icon}</div>
                <div className="w-6 h-6 rounded-full bg-trato-green text-white
                  text-xs font-bold flex items-center justify-center mx-auto mb-3">
                  {step.n}
                </div>
                <h3 className="text-white font-semibold mb-2">{step.title}</h3>
                <p className="text-trato-gray3 text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Para quien es */}
      <section className="py-16 max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-bold text-white text-center mb-10">
          Una plataforma, tres roles
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            {
              icon: '🚗', role: 'Vendedor', cta: 'Publicar mi auto',
              desc: 'Publica tu auto gratis y recibe matches con compradores reales. Solo pagas si vendes.',
            },
            {
              icon: '🔍', role: 'Comprador', cta: 'Buscar mi auto',
              desc: 'Define qué buscas y te avisamos apenas aparezca un auto compatible. Sin perder tiempo.',
            },
            {
              icon: '🔧', role: 'Mecánico', cta: 'Registrarme',
              desc: 'Ofrece inspecciones pre-compra en tu zona. Accede a clientes que necesitan tu servicio.',
            },
          ].map(r => (
            <div key={r.role}
              className="bg-trato-mid border border-trato-steel/40 rounded-2xl p-6">
              <div className="text-3xl mb-3">{r.icon}</div>
              <h3 className="text-white font-semibold mb-2">{r.role}</h3>
              <p className="text-trato-gray3 text-sm leading-relaxed mb-4">{r.desc}</p>
              <Link href="/registro"
                className="text-trato-green-l text-sm font-medium hover:underline">
                {r.cta} →
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-trato-mid border-t border-trato-steel/30 py-16">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-3">
            ¿Listo para hacer el trato?
          </h2>
          <p className="text-trato-gray3 mb-8">
            Únete a la plataforma que conecta vendedores y compradores de autos
            en Chile de forma inteligente.
          </p>
          <Link href="/registro"
            className="inline-block bg-trato-green text-white px-10 py-4
              rounded-[10px] font-semibold hover:bg-trato-green-l transition-colors">
            Crear cuenta gratis
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-trato-steel/30 py-8">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row
          items-center justify-between gap-4">
          <Image src="/logo.svg" alt="TratOnline" width={120} height={30} />
          <div className="flex gap-6 text-trato-gray3 text-xs">
            <Link href="/registro" className="hover:text-white transition-colors">
              Registrarse
            </Link>
            <Link href="/login" className="hover:text-white transition-colors">
              Ingresar
            </Link>
            <a href="mailto:soporte@tratonline.cl"
              className="hover:text-white transition-colors">
              soporte@tratonline.cl