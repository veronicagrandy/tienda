import { CurrencyPipe, DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { Component, OnInit, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { InsigniaEstadoPedido } from '../../componentes/insignia-estado-pedido/insignia-estado-pedido';
import { ResumenPedido } from '../../componentes/resumen-pedido/resumen-pedido';
import {
  EstadoPedido,
  Pedido,
  coloresEstadoPedido,
  contarUnidades,
  estadosPedido,
  etiquetasEstadoPedido,
} from '../../modelos/pedido';
import { PedidosServicio } from '../../servicios/pedidos.servicio';

type FiltroEstado = EstadoPedido | 'todos';

/**
 * Funcionalidad 3: historial de pedidos con filtro por estado y detalle del pedido elegido.
 * El filtro y la selección viven en la URL (?estado=…&seleccionado=…), así sobreviven
 * a una recarga y se pueden compartir.
 */
@Component({
  selector: 'app-historial-pedidos',
  imports: [RouterLink, NgClass, CurrencyPipe, DatePipe, DecimalPipe, InsigniaEstadoPedido, ResumenPedido],
  templateUrl: './historial-pedidos.html',
})
export class HistorialPedidos implements OnInit {
  private readonly router = inject(Router);
  protected readonly pedidosServicio = inject(PedidosServicio);

  // Query params enlazados como input() gracias a withComponentInputBinding().
  readonly estado = input<string>();
  readonly seleccionado = input<string>();

  protected readonly estadosPedido = estadosPedido;
  protected readonly etiquetasEstadoPedido = etiquetasEstadoPedido;
  protected readonly coloresEstadoPedido = coloresEstadoPedido;
  protected readonly contarUnidades = contarUnidades;

  // Un valor desconocido en la URL se trata como "todos".
  protected readonly estadoSeleccionado = computed<FiltroEstado>(() => {
    const estado = this.estado();
    return estadosPedido.includes(estado as EstadoPedido) ? (estado as EstadoPedido) : 'todos';
  });

  protected readonly etiquetaFiltroActual = computed(() => {
    const estado = this.estadoSeleccionado();
    return estado === 'todos' ? 'Todos' : etiquetasEstadoPedido[estado];
  });

  protected readonly pedidosFiltrados = computed(() => {
    const estado = this.estadoSeleccionado();
    const pedidos = this.pedidosServicio.pedidos();
    return estado === 'todos' ? pedidos : pedidos.filter((pedido) => pedido.estado === estado);
  });

  // Cantidad de pedidos por estado, para los contadores de los botones del filtro.
  protected readonly conteoPorEstado = computed(() => {
    const conteo: Record<FiltroEstado, number> = { todos: 0, pendiente: 0, entregado: 0, cancelado: 0 };
    for (const pedido of this.pedidosServicio.pedidos()) {
      conteo[pedido.estado]++;
      conteo.todos++;
    }
    return conteo;
  });

  protected readonly idSeleccionado = computed(() => {
    const id = Number(this.seleccionado());
    return Number.isInteger(id) && id > 0 ? id : null;
  });

  protected readonly pedidoSeleccionado = computed(
    () => this.pedidosServicio.pedidos().find((pedido) => pedido.id === this.idSeleccionado()) ?? null,
  );

  // El id de la URL no corresponde a ningún pedido (solo se evalúa tras cargar).
  protected readonly seleccionInexistente = computed(
    () => this.idSeleccionado() !== null && !this.pedidosServicio.cargando() && this.pedidoSeleccionado() === null,
  );

  ngOnInit(): void {
    this.pedidosServicio.cargarPedidos();
  }

  protected filtrarPorEstado(estado: FiltroEstado): void {
    // Si el pedido elegido no pertenece al nuevo filtro, se deselecciona.
    const seleccionado = this.pedidoSeleccionado();
    const mantenerSeleccion = seleccionado && (estado === 'todos' || seleccionado.estado === estado);
    this.actualizarUrl({
      estado: estado === 'todos' ? null : estado,
      seleccionado: mantenerSeleccion ? seleccionado.id : null,
    });
  }

  protected alSeleccionarPedido(pedido: Pedido): void {
    const yaSeleccionado = this.idSeleccionado() === pedido.id;
    this.actualizarUrl({ seleccionado: yaSeleccionado ? null : pedido.id });
  }

  protected cerrarDetalle(): void {
    this.actualizarUrl({ seleccionado: null });
  }

  private actualizarUrl(parametros: Record<string, string | number | null | undefined>): void {
    // replaceUrl: cambiar de filtro no llena el historial del navegador de entradas.
    this.router.navigate([], { queryParams: parametros, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
