import { CurrencyPipe, DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { EstadoStock, Producto, etiquetasEstadoStock, obtenerEstadoStock } from '../../modelos/producto';

/** Tarjeta reutilizable: recibe un producto del padre y le avisa cuando el usuario lo selecciona. */
@Component({
  selector: 'app-tarjeta-producto',
  imports: [NgClass, CurrencyPipe, DecimalPipe, TitleCasePipe],
  templateUrl: './tarjeta-producto.html',
})
export class TarjetaProducto {
  readonly producto = input.required<Producto>();
  readonly seleccionado = input(false);

  readonly seleccionarProducto = output<Producto>();

  protected readonly estadoStock = computed(() => obtenerEstadoStock(this.producto()));
  protected readonly etiquetaEstado = computed(() => etiquetasEstadoStock[this.estadoStock()]);

  // Color del badge según el estado del stock (se aplica con ngClass).
  protected readonly claseEstado = computed(() => {
    const clases: Record<EstadoStock, string> = {
      disponible: 'text-bg-success',
      pocasUnidades: 'text-bg-warning',
      agotado: 'text-bg-secondary',
    };
    return clases[this.estadoStock()];
  });

  protected alHacerClic(): void {
    this.seleccionarProducto.emit(this.producto());
  }
}
