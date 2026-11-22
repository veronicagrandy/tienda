// Modelos preparados para las funcionalidades 2, 3 y 4 (registro, historial y detalle de pedidos).

export const estadosPedido = ['pendiente', 'entregado', 'cancelado'] as const;
export type EstadoPedido = (typeof estadosPedido)[number];

export const etiquetasEstadoPedido: Record<EstadoPedido, string> = {
  pendiente: 'Pendiente',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
};

// Clases de Bootstrap por estado, compartidas por el badge y los filtros.
export const coloresEstadoPedido: Record<EstadoPedido, string> = {
  pendiente: 'warning',
  entregado: 'success',
  cancelado: 'secondary',
};

export interface ItemPedido {
  productoId: number;
  // Se copian nombre y precio para que el pedido conserve los valores del momento de la compra.
  nombreProducto: string;
  precioUnitario: number;
  cantidad: number;
}

export interface Pedido {
  // Opcional porque IndexedDB lo genera con autoIncrement al guardar.
  id?: number;
  nombreCliente: string;
  fecha: string; // ISO 8601
  estado: EstadoPedido;
  items: ItemPedido[];
  total: number;
  observaciones?: string;
  fechaCancelacion?: string; // ISO 8601, se registrará en la fase 4
}

export function contarUnidades(pedido: Pedido): number {
  return pedido.items.reduce((suma, item) => suma + item.cantidad, 0);
}

// Datos que envía el formulario: precios y total los calcula el servicio a partir de IndexedDB,
// así el pedido no depende de valores que el usuario pudiera alterar en el navegador.
export interface NuevoPedido {
  nombreCliente: string;
  observaciones?: string;
  items: { productoId: number; cantidad: number }[];
}
