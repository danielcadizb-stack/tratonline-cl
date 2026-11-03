import { redirect } from "next/navigation";
import Link from "next/link";
import {
  getCurrentUser,
  createServerClientInstance,
} from "@/lib/supabase-server";
import { formatCLP } from "@/lib/autofact";

const ADMIN_EMAIL = "daniel.cadiz.b@gmail.com";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  if (user.email !== ADMIN_EMAIL) redirect("/matches");

  const supabase = await createServerClientInstance();

  const [
    { count: totalAutos },
    { count: autosActivos },
    { count: totalUsuarios },
    { count: totalVendedores },
    { count: totalCompradores },
    { count: totalMecanicos },
    { count: totalMatches },
    { count: matchesCerrados },
    { count: matchesActivos },
    { count: mecanicosActivos },
  ] = await Promise.all([
    supabase.from("autos").select("*", { count: "exact", head: true }),
    supabase
      .from("autos")
      .select("*", { count: "exact", head: true })
      .eq("estado", "disponible"),
    supabase.from("usuarios").select("*", { count: "exact", head: true }),
    supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("rol", "vendedor"),
    supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("rol", "comprador"),
    supabase
      .from("usuarios")
      .select("*", { count: "exact", head: true })
      .eq("rol", "mecanico"),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("estado", "cerrado"),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .not("estado", "in", "(cerrado,cancelado)"),
    supabase
      .from("mecanicos")
      .select("*", { count: "exact", head: true })
      .eq("suscripcion_activa", true),
  ]);

  const ingresosEstimados = (matchesCerrados || 0) * 100000;
  const ingresosMembresias = (mecanicosActivos || 0) * 15000;

  // Todos los autos
  const { data: autos } = await supabase
    .from("autos")
    .select("*, vendedor:usuarios!autos_vendedor_id_fkey(nombre, email)")
    .order("created_at", { ascending: false })
    .limit(20);

  // Todos los matches con detalle
  const { data: matches } = await supabase
    .from("matches")
    .select(
      "*, auto:autos(marca, modelo, anio, precio_pedido), comprador:usuarios!matches_comprador_id_fkey(nombre, email)",
    )
    .order("created_at", { ascending: false })
    .limit(20);

  // Todos los usuarios
  const { data: usuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(20);

  // Mecánicos con suscripción
  const { data: mecanicos } = await supabase
    .from("mecanicos")
    .select("*, usuario:usuarios(nombre, email)")
    .order("created_at", { ascending: false });

  const ESTADO_COLOR: Record<string, string> = {
    pendiente: "badge-amber",
    notificado: "badge-amber",
    aceptado_comprador: "badge-green",
    aceptado_vendedor: "badge-green",
    visita_agendada: "badge-green",
    inspeccion_solicitada: "badge-green",
    cerrado: "badge-green",
    cancelado: "",
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-trato-text">
            Panel Admin 360
          </h1>
          <p className="text-trato-text2 text-sm mt-1">
            Vista completa de TratOnline
          </p>
        </div>
        <span className="badge-green">Admin</span>
      </div>

      {/* KPIs principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: "Usuarios totales",
            value: totalUsuarios || 0,
            color: "text-trato-text",
          },
          {
            label: "Autos publicados",
            value: autosActivos || 0,
            color: "text-trato-text",
          },
          {
            label: "Matches activos",
            value: matchesActivos || 0,
            color: "text-trato-green",
          },
          {
            label: "Ventas cerradas",
            value: matchesCerrados || 0,
            color: "text-trato-green",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="card-trato text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-trato-text2 text-xs mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Ingresos */}
      <div className="bg-trato-dark rounded-2xl p-6 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <p className="text-trato-gray3 text-xs mb-1">Ingresos por fees</p>
            <p className="text-white text-2xl font-bold">
              {formatCLP(ingresosEstimados)}
            </p>
            <p className="text-trato-gray3 text-[10px]">
              {matchesCerrados} ventas × $100.000
            </p>
          </div>
          <div>
            <p className="text-trato-gray3 text-xs mb-1">
              Ingresos por membresías
            </p>
            <p className="text-trato-green-l text-2xl font-bold">
              {formatCLP(ingresosMembresias)}
            </p>
            <p className="text-trato-gray3 text-[10px]">
              {mecanicosActivos} mecánicos × $15.000
            </p>
          </div>
          <div>
            <p className="text-trato-gray3 text-xs mb-1">Total estimado</p>
            <p className="text-white text-2xl font-bold">
              {formatCLP(ingresosEstimados + ingresosMembresias)}
            </p>
            <p className="text-trato-gray3 text-[10px]">Fees + membresías</p>
          </div>
        </div>
      </div>

      {/* Desglose usuarios */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          {
            label: "Vendedores",
            value: totalVendedores || 0,
            color: "text-trato-amber",
          },
          {
            label: "Compradores",
            value: totalCompradores || 0,
            color: "text-trato-green",
          },
          {
            label: "Mecánicos",
            value: totalMecanicos || 0,
            color: "text-trato-text2",
          },
        ].map((r) => (
          <div key={r.label} className="card-trato text-center">
            <p className={`text-2xl font-bold ${r.color}`}>{r.value}</p>
            <p className="text-trato-text2 text-xs mt-1">{r.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Autos publicados */}
        <div className="card-trato">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-trato-text">Autos publicados</h2>
            <span className="text-trato-text2 text-xs">{totalAutos} total</span>
          </div>
          <div className="space-y-3">
            {autos?.map((auto: any) => (
              <div
                key={auto.id}
                className="flex items-center justify-between py-2
                border-b border-trato-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  {auto.fotos?.[0] ? (
                    <img
                      src={auto.fotos[0]}
                      alt={auto.marca}
                      className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-10 h-10 rounded-lg bg-trato-gray1 flex items-center
                      justify-center flex-shrink-0 text-trato-gray3 text-xs"
                    >
                      🚗
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-medium text-trato-text">
                      {auto.marca} {auto.modelo} {auto.anio}
                    </p>
                    <p className="text-xs text-trato-text2">
                      {auto.vendedor?.nombre?.split(" ")[0]} ·{" "}
                      {Number(auto.km).toLocaleString("es-CL")} km
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-trato-green text-xs font-semibold">
                    {formatCLP(auto.precio_pedido)}
                  </p>
                  <span
                    className={`text-[10px] ${auto.estado === "disponible" ? "text-trato-green" : "text-trato-gray3"}`}
                  >
                    {auto.estado}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Matches con acceso a chat */}
        <div className="card-trato">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-trato-text">Matches y chats</h2>
            <span className="text-trato-text2 text-xs">
              {totalMatches} total
            </span>
          </div>
          <div className="space-y-3">
            {matches?.map((match: any) => (
              <div
                key={match.id}
                className="flex items-center justify-between py-2
                border-b border-trato-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-trato-text">
                    {match.auto?.marca} {match.auto?.modelo} {match.auto?.anio}
                  </p>
                  <p className="text-xs text-trato-text2">
                    {match.comprador?.nombre?.split(" ")[0]} · Score{" "}
                    {match.score}/100
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {ESTADO_COLOR[match.estado] && (
                    <span
                      className={`${ESTADO_COLOR[match.estado]} text-[10px]`}
                    >
                      {match.estado.replace(/_/g, " ")}
                    </span>
                  )}
                  <Link
                    href={`/chat/${match.id}`}
                    className="text-trato-green text-xs hover:underline"
                  >
                    Chat →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Usuarios */}
        <div className="card-trato">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-trato-text">
              Usuarios registrados
            </h2>
            <span className="text-trato-text2 text-xs">
              {totalUsuarios} total
            </span>
          </div>
          <div className="space-y-3">
            {usuarios?.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between py-2
                border-b border-trato-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-trato-green-bg flex items-center
                    justify-center text-xs font-semibold text-trato-green flex-shrink-0"
                  >
                    {u.nombre?.charAt(0) || "?"}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-trato-text">
                      {u.nombre}
                    </p>
                    <p className="text-xs text-trato-text2">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium
                    ${
                      u.rol === "vendedor"
                        ? "bg-trato-amber-bg text-trato-amber"
                        : u.rol === "comprador"
                          ? "bg-trato-green-bg text-trato-green"
                          : "bg-trato-gray1 text-trato-text2"
                    }`}
                  >
                    {u.rol}
                  </span>
                  <p className="text-trato-text2 text-[10px] mt-0.5">
                    {new Date(u.created_at).toLocaleDateString("es-CL")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mecánicos */}
        <div className="card-trato">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-trato-text">Mecánicos</h2>
            <span className="text-trato-text2 text-xs">
              {mecanicosActivos} activos
            </span>
          </div>
          {!mecanicos || mecanicos.length === 0 ? (
            <p className="text-trato-text2 text-sm text-center py-4">
              Sin mecánicos registrados todavía
            </p>
          ) : (
            <div className="space-y-3">
              {mecanicos.map((mec: any) => (
                <div
                  key={mec.id}
                  className="flex items-center justify-between py-2
                  border-b border-trato-border last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-trato-text">
                      {mec.nombre_taller || mec.usuario?.nombre}
                    </p>
                    <p className="text-xs text-trato-text2">
                      {mec.comunas?.join(", ")} · ★{mec.rating}
                    </p>
                  </div>
                  <div className="text-right">
                    <span
                      className={
                        mec.suscripcion_activa ? "badge-green" : "badge-amber"
                      }
                    >
                      {mec.suscripcion_activa ? "Activo" : "Inactivo"}
                    </span>
                    {mec.suscripcion_activa && mec.suscripcion_vence && (
                      <p className="text-trato-text2 text-[10px] mt-0.5">
                        Vence:{" "}
                        {new Date(mec.suscripcion_vence).toLocaleDateString(
                          "es-CL",
                        )}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
