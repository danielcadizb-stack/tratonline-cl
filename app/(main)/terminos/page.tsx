export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold text-trato-text mb-2">Términos y Condiciones</h1>
      <p className="text-trato-text2 text-sm mb-8">Última actualización: noviembre 2026</p>

      <div className="space-y-8 text-trato-text2 text-sm leading-relaxed">

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">1. Naturaleza de la plataforma</h2>
          <p>TratOnline (operado por Alfester SpA, RUT 78.502.587-3) es una plataforma de intermediación digital que conecta vendedores de vehículos usados, compradores y prestadores de servicios de inspección mecánica en Chile. TratOnline actúa exclusivamente como intermediario y no es parte de ninguna transacción de compraventa ni contrato de prestación de servicios entre usuarios.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">2. Mecánicos e inspectores</h2>
          <p className="mb-2">Los mecánicos e inspectores que aparecen en TratOnline son prestadores de servicios independientes. TratOnline <strong className="text-trato-text">NO</strong>:</p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Certifica ni avala las credenciales técnicas de los mecánicos</li>
            <li>Garantiza la calidad del trabajo de inspección realizado</li>
            <li>Es empleador ni tiene relación laboral con los mecánicos registrados</li>
            <li>Responde por daños, omisiones o errores en los informes de inspección</li>
          </ul>
          <p className="mt-2">El badge <em>"Registrado en TratOnline"</em> indica únicamente que el prestador completó el registro en la plataforma y que su identidad fue verificada. No implica certificación técnica de ningún tipo.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">3. Servicio de inspección precompra</h2>
          <p>Al contratar una inspección a través de TratOnline, el usuario acepta que:</p>
          <ul className="list-disc list-inside space-y-1 ml-2 mt-2">
            <li>El informe de inspección es una opinión técnica del mecánico, no una garantía del estado del vehículo</li>
            <li>TratOnline coordina la prestación del servicio pero no es responsable de su resultado</li>
            <li>El pago se realiza directamente a Alfester SpA como coordinador del servicio</li>
            <li>No se otorgan reembolsos una vez realizada la inspección</li>
          </ul>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">4. Reseñas y valoraciones</h2>
          <p>Solo pueden dejar reseñas usuarios que hayan contratado y completado un servicio a través de TratOnline. Las reseñas reflejan la experiencia personal de cada usuario y no constituyen una evaluación técnica de TratOnline. Nos reservamos el derecho de eliminar reseñas que incumplan nuestras políticas de uso.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">5. Compraventa de vehículos</h2>
          <p>TratOnline facilita el contacto entre compradores y vendedores pero no participa en la negociación ni en la transferencia del vehículo. La verificación del estado legal del vehículo, la gestión de la transferencia en el Registro Civil y cualquier aspecto legal de la compraventa son responsabilidad exclusiva de las partes involucradas.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">6. Tarifa de cierre</h2>
          <p>Al concretar una venta a través de TratOnline, el vendedor se compromete a pagar una tarifa de servicio de $100.000 CLP por la intermediación. Esta tarifa se cobra mediante transferencia bancaria una vez confirmada la venta.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">7. Limitación de responsabilidad</h2>
          <p>En ningún caso Alfester SpA será responsable por daños directos, indirectos, incidentales o consecuenciales derivados del uso de la plataforma, incluyendo pero no limitado a: pérdidas económicas en transacciones de vehículos, defectos no detectados en inspecciones, o conducta de terceros usuarios.</p>
        </section>

        <section>
          <h2 className="text-base font-semibold text-trato-text mb-3">8. Contacto</h2>
          <p>Para consultas sobre estos términos: <a href="mailto:soporte@tratonline.cl" className="text-trato-green hover:underline">soporte@tratonline.cl</a></p>
        </section>

      </div>
    </div>
  )
}