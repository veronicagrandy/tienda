import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { IsActiveMatchOptions, RouterLink, RouterLinkActive } from '@angular/router';

interface EnlaceNavegacion {
  ruta: string;
  etiqueta: string;
  opcionesActivo: IsActiveMatchOptions;
}

// Ruta exacta (así /pedidos no queda activo en /pedidos/nuevo), pero ignorando los
// query params: /pedidos?estado=entregado debe seguir resaltando "Historial".
const rutaExacta: IsActiveMatchOptions = {
  paths: 'exact',
  queryParams: 'ignored',
  matrixParams: 'ignored',
  fragment: 'ignored',
};

@Component({
  selector: 'app-barra-navegacion',
  imports: [RouterLink, RouterLinkActive, NgClass],
  templateUrl: './barra-navegacion.html',
})
export class BarraNavegacion {
  // El colapso se maneja con una señal + ngClass en lugar del JS de Bootstrap,
  // así el menú móvil se cierra al navegar.
  protected readonly menuAbierto = signal(false);

  protected readonly enlaces: EnlaceNavegacion[] = [
    { ruta: '/productos', etiqueta: 'Catálogo', opcionesActivo: rutaExacta },
    { ruta: '/pedidos/nuevo', etiqueta: 'Nuevo pedido', opcionesActivo: rutaExacta },
    { ruta: '/pedidos', etiqueta: 'Historial', opcionesActivo: rutaExacta },
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
