// Modelos preparados para las funcionalidades 2, 3 y 4 (registro, historial y detalle de pedidos).

export type EstadoPedido = 'pendiente' | 'entregado' | 'cancelado';

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
}

// Datos que envía el formulario: precios y total los calcula el servicio a partir de IndexedDB,
// así el pedido no depende de valores que el usuario pudiera alterar en el navegador.
export interface NuevoPedido {
  nombreCliente: string;
  observaciones?: string;
  items: { productoId: number; cantidad: number }[];
}
