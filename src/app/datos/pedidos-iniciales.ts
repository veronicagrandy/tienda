import { Pedido } from '../modelos/pedido';

// Pedidos de ejemplo ya cerrados (entregados o cancelados): no afectan el stock actual,
// solo sirven para que el historial y su filtro por estado tengan datos desde el inicio.
// No llevan id: IndexedDB lo asigna con autoIncrement.
export const pedidosIniciales: Pedido[] = [
  {
    nombreCliente: 'Rosa Mamani',
    fecha: '2026-11-15T09:20:00.000Z',
    estado: 'entregado',
    items: [
      { productoId: 1, nombreProducto: 'Arroz Grano de Oro', precioUnitario: 9.5, cantidad: 2 },
      { productoId: 8, nombreProducto: 'Leche entera PIL', precioUnitario: 6.5, cantidad: 4 },
    ],
    total: 45,
  },
  {
    nombreCliente: 'Carlos Choque',
    fecha: '2026-11-17T16:45:00.000Z',
    estado: 'cancelado',
    observaciones: 'El cliente ya no pasó a recoger.',
    items: [
      { productoId: 5, nombreProducto: 'Coca-Cola 2 L', precioUnitario: 12, cantidad: 3 },
      { productoId: 15, nombreProducto: 'Papas fritas clásicas', precioUnitario: 8, cantidad: 2 },
    ],
    total: 52,
    fechaCancelacion: '2026-11-18T10:00:00.000Z',
  },
  {
    nombreCliente: 'Lucía Flores',
    fecha: '2026-11-20T11:05:00.000Z',
    estado: 'entregado',
    observaciones: 'Entregar en la puerta lateral.',
    items: [
      { productoId: 12, nombreProducto: 'Detergente en polvo', precioUnitario: 18, cantidad: 1 },
      { productoId: 14, nombreProducto: 'Jabón de tocador', precioUnitario: 4, cantidad: 3 },
      { productoId: 13, nombreProducto: 'Lavandina', precioUnitario: 7.5, cantidad: 1 },
    ],
    total: 37.5,
  },
];
