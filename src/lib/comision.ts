// Comisión que retiene Mawis sobre cada servicio cobrado por un paseador/cuidador.
//
// Valor de ejemplo mientras no hay integración de pagos real — no está
// hardcodeado en cada lugar que lo usa, vive acá para poder ajustarlo o,
// más adelante, reemplazar este archivo por una lectura desde una tabla de
// configuración editable (p. ej. `platform_settings`) cuando exista un panel
// admin.
//
// TODO(pagos): hoy el "monto" lo carga el propio prestador a mano (cobra por
// fuera de la app, en efectivo/transferencia) y acá solo se registra el
// cálculo de la comisión. Conectar acá el procesador de pagos real (Stripe
// Connect / Mercado Pago Marketplace, etc.) para: (1) cobrarle al dueño
// dentro de la app, (2) retener la comisión automáticamente, y (3)
// liquidarle el neto al prestador.
export const COMISION_PLATAFORMA_PCT = 15;

export function calcularNeto(monto: number, comisionPct: number) {
  const comision = Math.round(monto * (comisionPct / 100) * 100) / 100;
  const neto = Math.round((monto - comision) * 100) / 100;
  return { comision, neto };
}
