import { Injectable, inject, signal } from '@angular/core';
import { ItemPedido, NuevoPedido, Pedido } from '../modelos/pedido';
import { Producto } from '../modelos/producto';
import { BaseDatosServicio, almacenPedidos, almacenProductos } from './base-datos.servicio';
import { ProductosServicio } from './productos.servicio';

/** Error de regla de negocio (p. ej. stock insuficiente) con un mensaje apto para mostrar al usuario. */
export class ErrorPedido extends Error {}

@Injectable({ providedIn: 'root' })
export class PedidosServicio {
  private readonly baseDatos = inject(BaseDatosServicio);
  private readonly productosServicio = inject(ProductosServicio);

  private readonly pedidosInterno = signal<Pedido[]>([]);
  private readonly cargandoInterno = signal(false);
  private readonly errorInterno = signal<string | null>(null);

  /** Pedidos ordenados del más reciente al más antiguo. */
  readonly pedidos = this.pedidosInterno.asReadonly();
  readonly cargando = this.cargandoInterno.asReadonly();
  readonly error = this.errorInterno.asReadonly();

  async cargarPedidos(): Promise<void> {
    this.cargandoInterno.set(true);
    this.errorInterno.set(null);
    try {
      const pedidos = await this.baseDatos.obtenerTodos<Pedido>(almacenPedidos);
      // Las fechas ISO se ordenan correctamente como texto.
      this.pedidosInterno.set(pedidos.sort((a, b) => b.fecha.localeCompare(a.fecha)));
    } catch (error) {
      console.error(error);
      this.errorInterno.set('No se pudo cargar el historial de pedidos.');
    } finally {
      this.cargandoInterno.set(false);
    }
  }

  async obtenerPedidoPorId(id: number): Promise<Pedido | undefined> {
    return this.baseDatos.obtenerPorId<Pedido>(almacenPedidos, id);
  }

  /**
   * Registra un pedido y descuenta el stock en UNA sola transacción:
   * si algún producto no tiene existencias suficientes, no se guarda nada.
   * Devuelve el pedido guardado con su id.
   */
  async crearPedido(nuevoPedido: NuevoPedido): Promise<Pedido> {
    if (nuevoPedido.items.length === 0) {
      throw new ErrorPedido('El pedido debe tener al menos un producto.');
    }
    const ids = nuevoPedido.items.map((item) => item.productoId);
    if (new Set(ids).size !== ids.length) {
      throw new ErrorPedido('Hay productos repetidos en el pedido.');
    }

    let mensajeError: string | null = null;
    let pedidoGuardado: Pedido | null = null;

    try {
      await this.baseDatos.ejecutarTransaccion([almacenProductos, almacenPedidos], 'readwrite', (transaccion) => {
        const productosStore = transaccion.objectStore(almacenProductos);
        const pedidosStore = transaccion.objectStore(almacenPedidos);
        const productosLeidos = new Map<number, Producto>();
        let lecturasPendientes = nuevoPedido.items.length;

        const fallar = (mensaje: string) => {
          if (mensajeError === null) {
            mensajeError = mensaje;
            transaccion.abort(); // revierte cualquier cambio de esta transacción
          }
        };

        // 1) Se leen los productos con su stock ACTUAL dentro de la transacción.
        nuevoPedido.items.forEach((item) => {
          const lectura = productosStore.get(item.productoId);
          lectura.onsuccess = () => {
            if (mensajeError !== null) return;
            const producto = lectura.result as Producto | undefined;
            if (!producto) {
              return fallar('Uno de los productos ya no existe en la tienda.');
            }
            if (item.cantidad > producto.stock) {
              return fallar(
                `Stock insuficiente para "${producto.nombre}": pediste ${item.cantidad} y solo quedan ${producto.stock}.`,
              );
            }
            productosLeidos.set(producto.id, producto);

            // 2) Con todo validado, se descuenta el stock y se guarda el pedido.
            if (--lecturasPendientes === 0) {
              const items: ItemPedido[] = nuevoPedido.items.map((itemPedido) => {
                const productoActual = productosLeidos.get(itemPedido.productoId)!;
                productosStore.put({ ...productoActual, stock: productoActual.stock - itemPedido.cantidad });
                return {
                  productoId: productoActual.id,
                  nombreProducto: productoActual.nombre,
                  precioUnitario: productoActual.precio,
                  cantidad: itemPedido.cantidad,
                };
              });

              const pedido: Pedido = {
                nombreCliente: nuevoPedido.nombreCliente.trim(),
                observaciones: nuevoPedido.observaciones?.trim() || undefined,
                fecha: new Date().toISOString(),
                estado: 'pendiente',
                items,
                total: calcularTotal(items),
              };
              const insercion = pedidosStore.add(pedido);
              insercion.onsuccess = () => (pedidoGuardado = { ...pedido, id: insercion.result as number });
            }
          };
        });
      });
    } catch (error) {
      if (mensajeError !== null) {
        throw new ErrorPedido(mensajeError);
      }
      console.error(error);
      throw new ErrorPedido('No se pudo guardar el pedido. Inténtalo de nuevo.');
    }

    // El stock cambió en IndexedDB: se refresca el catálogo y se agrega el pedido al historial en memoria.
    await this.productosServicio.cargarProductos();
    this.pedidosInterno.update((pedidos) => [pedidoGuardado!, ...pedidos]);
    return pedidoGuardado!;
  }

  /**
   * Cancela un pedido pendiente y devuelve sus unidades al stock en UNA sola transacción.
   * Devuelve el pedido actualizado y el detalle del stock recuperado por producto.
   */
  async cancelarPedido(id: number): Promise<ResultadoCancelacion> {
    let mensajeError: string | null = null;
    let resultado: ResultadoCancelacion | null = null;

    try {
      await this.baseDatos.ejecutarTransaccion([almacenProductos, almacenPedidos], 'readwrite', (transaccion) => {
        const productosStore = transaccion.objectStore(almacenProductos);
        const pedidosStore = transaccion.objectStore(almacenPedidos);

        // Se relee el pedido dentro de la transacción: si otra pestaña ya lo cerró, no se repite.
        const lecturaPedido = pedidosStore.get(id);
        lecturaPedido.onsuccess = () => {
          const pedido = lecturaPedido.result as Pedido | undefined;
          const motivo = !pedido
            ? 'El pedido ya no existe.'
            : pedido.estado !== 'pendiente'
              ? `El pedido ya está ${pedido.estado} y no se puede cancelar.`
              : null;
          if (motivo !== null || !pedido) {
            mensajeError = motivo;
            transaccion.abort();
            return;
          }

          const pedidoCancelado: Pedido = { ...pedido, estado: 'cancelado', fechaCancelacion: new Date().toISOString() };
          const stockRecuperado: StockRecuperado[] = [];
          pedidosStore.put(pedidoCancelado);

          // Se devuelve cada cantidad a su producto. Si un producto ya no existe, se informa sin fallar.
          pedido.items.forEach((item) => {
            const lecturaProducto = productosStore.get(item.productoId);
            lecturaProducto.onsuccess = () => {
              const producto = lecturaProducto.result as Producto | undefined;
              if (producto) {
                productosStore.put({ ...producto, stock: producto.stock + item.cantidad });
              }
              stockRecuperado.push({
                productoId: item.productoId,
                nombreProducto: item.nombreProducto,
                cantidad: item.cantidad,
                stockAnterior: producto?.stock ?? null,
                stockActual: producto ? producto.stock + item.cantidad : null,
              });
            };
          });

          resultado = { pedido: pedidoCancelado, stockRecuperado };
        };
      });
    } catch (error) {
      if (mensajeError !== null) {
        throw new ErrorPedido(mensajeError);
      }
      console.error(error);
      throw new ErrorPedido('No se pudo cancelar el pedido. Inténtalo de nuevo.');
    }

    const { pedido } = resultado!;
    this.reemplazarEnMemoria(pedido);
    await this.productosServicio.cargarProductos();
    return resultado!;
  }

  /** Cierra un pedido pendiente como entregado (el stock ya se descontó al registrarlo). */
  async marcarComoEntregado(id: number): Promise<Pedido> {
    const pedido = await this.obtenerPedidoPorId(id);
    if (!pedido) {
      throw new ErrorPedido('El pedido ya no existe.');
    }
    if (pedido.estado !== 'pendiente') {
      throw new ErrorPedido(`El pedido ya está ${pedido.estado}.`);
    }
    const pedidoEntregado: Pedido = { ...pedido, estado: 'entregado' };
    await this.baseDatos.guardar(almacenPedidos, pedidoEntregado);
    this.reemplazarEnMemoria(pedidoEntregado);
    return pedidoEntregado;
  }

  // Mantiene el historial en memoria coherente sin volver a leer toda la base.
  private reemplazarEnMemoria(pedidoActualizado: Pedido): void {
    this.pedidosInterno.update((pedidos) =>
      pedidos.map((pedido) => (pedido.id === pedidoActualizado.id ? pedidoActualizado : pedido)),
    );
  }
}

export interface StockRecuperado {
  productoId: number;
  nombreProducto: string;
  cantidad: number;
  // null si el producto ya no existe en la tienda.
  stockAnterior: number | null;
  stockActual: number | null;
}

export interface ResultadoCancelacion {
  pedido: Pedido;
  stockRecuperado: StockRecuperado[];
}

/** Total redondeado a centavos para evitar errores de coma flotante. */
export function calcularTotal(items: Pick<ItemPedido, 'precioUnitario' | 'cantidad'>[]): number {
  const total = items.reduce((suma, item) => suma + item.precioUnitario * item.cantidad, 0);
  return Math.round(total * 100) / 100;
}
