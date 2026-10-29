/* ── Roles ──────────────────────────────────────────────── */
export type UserRole = "vendedor" | "comprador" | "mecanico";

/* ── Usuario ────────────────────────────────────────────── */
export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  telefono?: string;
  rol: UserRole;
  rut?: string;
  activo: boolean;
  created_at: string;
}

/* ── Auto ───────────────────────────────────────────────── */
export type TipoAuto = "sedan" | "suv" | "hatchback" | "camioneta" | "otro";
export type Transmision = "manual" | "automatico";
export type Combustible = "bencina" | "diesel" | "electrico" | "hibrido";
export type EstadoAuto = "disponible" | "match_activo" | "vendido" | "retirado";

export interface Auto {
  id: string;
  vendedor_id: string;
  marca: string;
  modelo: string;
  anio: number;
  km: number;
  precio_pedido: number;
  precio_minimo: number;
  transmision: Transmision;
  combustible: Combustible;
  tipo: TipoAuto;
  color?: string;
  region: string;
  fotos: string[];
  descripcion?: string;
  estado: EstadoAuto;
  created_at: string;
}

/* ── Precio de mercado ──────────────────────────────────── */
export interface PrecioMercado {
  min: number;
  max: number;
  mediana: number;
  fuente: "autofact" | "rolav" | "estimado";
  actualizado_at: string;
}

/* ── Perfil de comprador ────────────────────────────────── */
export type Urgencia = "inmediata" | "1mes" | "3meses" | "flexible";

export interface PerfilComprador {
  id: string;
  comprador_id: string;
  marcas: string[];
  anio_min: number;
  anio_max: number;
  km_max: number;
  presupuesto: number;
  tipos: TipoAuto[];
  transmision: Transmision | "cualquiera";
  combustible: Combustible | "cualquiera";
  region: string;
  urgencia: Urgencia;
  activo: boolean;
  created_at: string;
}

/* ── Match ──────────────────────────────────────────────── */
export type EstadoMatch =
  | "pendiente"
  | "notificado"
  | "aceptado_comprador"
  | "aceptado_vendedor"
  | "visita_agendada"
  | "inspeccion_solicitada"
  | "cerrado"
  | "cancelado";

export interface Match {
  id: string;
  auto_id: string;
  comprador_id: string;
  perfil_id: string;
  score: number;
  estado: EstadoMatch;
  mecanico_id?: string;
  fee_cobrado: boolean;
  created_at: string;
  auto?: Auto;
  comprador?: Usuario;
  mecanico?: Mecanico;
}

/* ── Mecánico ───────────────────────────────────────────── */
export interface Mecanico {
  id: string;
  usuario_id: string;
  nombre_taller: string;
  comunas: string[];
  especialidad: string[];
  tarifa_base: number;
  suscripcion_activa: boolean;
  suscripcion_vence: string;
  rating: number;
  total_inspecciones: number;
  created_at: string;
  usuario?: Usuario;
}

/* ── Mensaje de chat ────────────────────────────────────── */
export interface Mensaje {
  id: string;
  match_id: string;
  autor_id: string;
  texto: string;
  tipo: "texto" | "sistema" | "inspeccion_request";
  leido: boolean;
  created_at: string;
  autor?: Usuario;
}

/* ── Score breakdown ────────────────────────────────────── */
export interface ScoreBreakdown {
  total: number;
  marca: number;
  presupuesto: number;
  anio: number;
  km: number;
  tipo: number;
  region_bonus: number;
}
