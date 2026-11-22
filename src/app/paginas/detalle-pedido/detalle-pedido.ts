import { DecimalPipe } from '@angular/common';
import { Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ResumenPedido } from '../../componentes/resumen-pedido/resumen-pedido';
import { Pedido, contarUnidades } from '../../modelos/pedido';
import { ErrorPedido, PedidosServicio, StockRecuperado } from '../../servicios/pedidos.servicio';

type AccionEnCurso = 'cancelar' | 'entregar' | null;

/**
 * Funcionalidad 4: detalle de un pedido en /pedidos/:id.
 * Lee el pedido directamente de IndexedDB, así funciona también al recargar la página
 * o al entrar por un enlace directo sin pasar por el historial.
 */
@Component({
  selector: 'app-detalle-pedido',
  imports: [RouterLink, DecimalPipe, ResumenPedido],
  templateUrl: './detalle-pedido.html',
})
export class DetallePedido {
  private readonly pedidosServicio = inject(PedidosServicio);

  // Parámetro :id de la ruta (withComponentInputBinding).
  readonly id = input.required<string>();

  protected readonly cargando = signal(true);
  protected readonly pedido = signal<Pedido | null>(null);
  protected readonly mensajeError = signal<string | null>(null);
  protected readonly confirmandoCancelacion = signal(false);
  protected readonly accionEnCurso = signal<AccionEnCurso>(null);
  protected readonly stockRecuperado = signal<StockRecuperado[] | null>(null);
  protected readonly mensajeExito = signal<string | null>(null);

  protected readonly idNumerico = computed(() => {
    const id = Number(this.id());
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  protected readonly esPendiente = computed(() => this.pedido()?.estado === 'pendiente');
  protected readonly unidades = computed(() => {
    const pedido = this.pedido();
    return pedido ? contarUnidades(pedido) : 0;
  });

  constructor() {
    // Si cambia el :id (p. ej. navegando de /pedidos/1 a /pedidos/2) se vuelve a cargar.
    effect(() => {
      const id = this.idNumerico();
      untracked(() => this.cargarPedido(id));
    });
  }

  protected pedirConfirmacion(): void {
    this.mensajeError.set(null);
    this.confirmandoCancelacion.set(true);
  }

  protected descartarCancelacion(): void {
    this.confirmandoCancelacion.set(false);
  }

  protected async confirmarCancelacion(): Promise<void> {
    const id = this.idNumerico();
    if (id === null || this.accionEnCurso()) return;

    this.accionEnCurso.set('cancelar');
    this.mensajeError.set(null);
    try {
      const resultado = await this.pedidosServicio.cancelarPedido(id);
      this.pedido.set(resultado.pedido);
      this.stockRecuperado.set(resultado.stockRecuperado);
      this.mensajeExito.set(null);
    } catch (error) {
      await this.manejarError(error, id);
    } finally {
      this.accionEnCurso.set(null);
      this.confirmandoCancelacion.set(false);
    }
  }

  protected async marcarComoEntregado(): Promise<void> {
    const id = this.idNumerico();
    if (id === null || this.accionEnCurso()) return;

    this.accionEnCurso.set('entregar');
    this.mensajeError.set(null);
    try {
      this.pedido.set(await this.pedidosServicio.marcarComoEntregado(id));
      this.mensajeExito.set('El pedido se marcó como entregado.');
    } catch (error) {
      await this.manejarError(error, id);
    } finally {
      this.accionEnCurso.set(null);
    }
  }

  private async cargarPedido(id: number | null): Promise<void> {
    this.cargando.set(true);
    this.pedido.set(null);
    this.mensajeError.set(null);
    this.mensajeExito.set(null);
    this.stockRecuperado.set(null);
    this.confirmandoCancelacion.set(false);
    try {
      // Un id no numérico (p. ej. /pedidos/abc) se trata igual que uno inexistente.
      this.pedido.set(id === null ? null : ((await this.pedidosServicio.obtenerPedidoPorId(id)) ?? null));
    } catch (error) {
      console.error(error);
      this.mensajeError.set('No se pudo leer el pedido.');
    } finally {
      this.cargando.set(false);
    }
  }

  // Si la acción falló porque el pedido cambió (p. ej. en otra pestaña), se muestra su estado real.
  private async manejarError(error: unknown, id: number): Promise<void> {
    this.mensajeError.set(error instanceof ErrorPedido ? error.message : 'Ocurrió un error inesperado.');
    const pedidoActual = await this.pedidosServicio.obtenerPedidoPorId(id).catch(() => undefined);
    if (pedidoActual) {
      this.pedido.set(pedidoActual);
    }
  }
}
