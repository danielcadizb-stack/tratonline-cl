import { redirect } from "next/navigation";
import {
  getCurrentUser,
  createServerClientInstance,
} from "@/lib/supabase-server";
import { formatCLP } from "@/lib/autofact";

export default async function AdminPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  // Solo Daniel puede ver el admin — verificar por email
  const ADMIN_EMAIL = "daniel.cadiz.b@gmail.com";
  if (user.email !== ADMIN_EMAIL) redirect("/matches");

  const supabase = await createServerClientInstance();

  // Stats generales
  const [
    { count: totalAutos },
    { count: totalUsuarios },
    { count: totalMatches },
    { count: matchesCerrados },
    { count: mecanicosActivos },
  ] = await Promise.all([
    supabase.from("autos").select("*", { count: "exact", head: true }),
    supabase.from("usuarios").select("*", { count: "exact", head: true }),
    supabase.from("matches").select("*", { count: "exact", head: true }),
    supabase
      .from("matches")
      .select("*", { count: "exact", head: true })
      .eq("estado", "cerrado"),
    supabase
      .from("mecanicos")
      .select("*", { count: "exact", head: true })
      .eq("suscripcion_activa", true),
  ]);

  const ingresosEstimados = (matchesCerrados || 0) * 100000;

  // Ultimos matches
  const { data: ultimosMatches } = await supabase
    .from("matches")
    .select(
      "*, auto:autos(marca, modelo, anio, precio_pedido), comprador:usuarios!matches_comprador_id_fkey(nombre)",
    )
    .order("created_at", { ascending: false })
    .limit(10);

  // Ultimos usuarios
  const { data: ultimosUsuarios } = await supabase
    .from("usuarios")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(8);

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
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-trato-text">Panel admin</h1>
        <p className="text-trato-text2 text-sm mt-1">
          Vista general de Trato.cl
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {[
          {
            label: "Usuarios",
            value: totalUsuarios || 0,
            color: "text-trato-text",
          },
          {
            label: "Autos publicados",
            value: totalAutos || 0,
            color: "text-trato-text",
          },
          {
            label: "Matches totales",
            value: totalMatches || 0,
            color: "text-trato-accent",
          },
          {
            label: "Ventas cerradas",
            value: matchesCerrados || 0,
            color: "text-trato-green",
          },
          {
            label: "Mecanicos activos",
            value: mecanicosActivos || 0,
            color: "text-trato-text",
          },
        ].map((kpi) => (
          <div key={kpi.label} className="card-trato text-center">
            <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
            <p className="text-trato-text2 text-xs mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Ingresos */}
      <div className="bg-trato-dark rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-trato-gray3 text-sm">
              Ingresos totales estimados
            </p>
            <p className="text-white text-4xl font-bold mt-1">
              {formatCLP(ingresosEstimados)}
            </p>
            <p className="text-trato-gray3 text-xs mt-2">
              {matchesCerrados} ventas × $100.000 fee
            </p>
          </div>
          <div className="text-right">
            <div className="bg-trato-green/20 rounded-xl p-4">
              <p className="text-trato-green-l text-sm font-medium">
                Fee por venta
              </p>
              <p className="text-trato-green-l text-2xl font-bold mt-1">
                $100.000
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Ultimos matches */}
        <div className="card-trato">
          <h2 className="font-semibold text-trato-text mb-4">
            Ultimos matches
          </h2>
          <div className="space-y-3">
            {ultimosMatches?.map((match: any) => (
              <div
                key={match.id}
                className="flex items-center justify-between
                py-2 border-b border-trato-border last:border-0"
              >
                <div>
                  <p className="text-sm font-medium text-trato-text">
                    {match.auto?.marca} {match.auto?.modelo} {match.auto?.anio}
                  </p>
                  <p className="text-xs text-trato-text2 mt-0.5">
                    {match.comprador?.nombre || "Comprador"} · Score{" "}
                    {match.score}/100
                  </p>
                </div>
                <div className="text-right">
                  <span className={ESTADO_COLOR[match.estado] || ""}>
                    {match.estado.replace("_", " ")}
                  </span>
                  <p className="text-xs text-trato-text2 mt-1">
                    {formatCLP(match.auto?.precio_pedido || 0)}
                  </p>
                </div>
              </div>
            ))}
            {(!ultimosMatches || ultimosMatches.length === 0) && (
              <p className="text-trato-text2 text-sm text-center py-4">
                Sin matches todavia
              </p>
            )}
          </div>
        </div>

        {/* Ultimos usuarios */}
        <div className="card-trato">
          <h2 className="font-semibold text-trato-text mb-4">
            Ultimos usuarios
          </h2>
          <div className="space-y-3">
            {ultimosUsuarios?.map((u: any) => (
              <div
                key={u.id}
                className="flex items-center justify-between
                py-2 border-b border-trato-border last:border-0"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full bg-trato-green-bg
                    flex items-center justify-center text-xs font-semibold
                    text-trato-green flex-shrink-0"
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
              </div>
            ))}
            {(!ultimosUsuarios || ultimosUsuarios.length === 0) && (
              <p className="text-trato-text2 text-sm text-center py-4">
                Sin usuarios todavia
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
