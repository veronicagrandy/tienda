import { NgClass } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { IsActiveMatchOptions, NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter, map } from 'rxjs';

interface EnlaceNavegacion {
  ruta: string;
  etiqueta: string;
  opcionesActivo: IsActiveMatchOptions;
  // "Historial" también se resalta al ver el detalle de un pedido (/pedidos/:id).
  incluyeDetallePedido?: boolean;
}

// /pedidos/<algo> excepto /pedidos/nuevo.
const patronDetallePedido = /^\/pedidos\/(?!nuevo(?:[/?#]|$))[^/?#]+/;

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

  private readonly router = inject(Router);
  private readonly urlActual = toSignal(
    this.router.events.pipe(
      filter((evento) => evento instanceof NavigationEnd),
      map((evento) => evento.urlAfterRedirects),
    ),
    { initialValue: this.router.url },
  );

  /** Combina el estado de routerLinkActive con la regla extra del detalle de pedido. */
  protected estaActivo(enlace: EnlaceNavegacion, activoPorRouterLink: boolean): boolean {
    return activoPorRouterLink || (!!enlace.incluyeDetallePedido && patronDetallePedido.test(this.urlActual()));
  }

  protected readonly enlaces: EnlaceNavegacion[] = [
    { ruta: '/productos', etiqueta: 'Catálogo', opcionesActivo: rutaExacta },
    { ruta: '/pedidos/nuevo', etiqueta: 'Nuevo pedido', opcionesActivo: rutaExacta },
    { ruta: '/pedidos', etiqueta: 'Historial', opcionesActivo: rutaExacta, incluyeDetallePedido: true },
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
