import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { Component, computed, input } from '@angular/core';
import { Pedido, contarUnidades } from '../../modelos/pedido';
import { InsigniaEstadoPedido } from '../insignia-estado-pedido/insignia-estado-pedido';

/**
 * Tarjeta con el detalle completo de un pedido. Se reutiliza en el historial (panel lateral)
 * y en la página /pedidos/:id. Las acciones (botones) las aporta el padre con <ng-content>.
 */
@Component({
  selector: 'app-resumen-pedido',
  imports: [InsigniaEstadoPedido, CurrencyPipe, DatePipe, DecimalPipe],
  templateUrl: './resumen-pedido.html',
})
export class ResumenPedido {
  readonly pedido = input.required<Pedido>();

  protected readonly unidades = computed(() => contarUnidades(this.pedido()));
}
