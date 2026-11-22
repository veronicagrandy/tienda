import { NgClass } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { EstadoPedido, coloresEstadoPedido, etiquetasEstadoPedido } from '../../modelos/pedido';

/** Badge de Bootstrap con el color y la etiqueta de un estado de pedido. */
@Component({
  selector: 'app-insignia-estado-pedido',
  imports: [NgClass],
  template: `<span class="badge" [ngClass]="'text-bg-' + color()">{{ etiqueta() }}</span>`,
})
export class InsigniaEstadoPedido {
  readonly estado = input.required<EstadoPedido>();

  protected readonly etiqueta = computed(() => etiquetasEstadoPedido[this.estado()]);
  protected readonly color = computed(() => coloresEstadoPedido[this.estado()]);
}
