import { NgClass } from '@angular/common';
import { Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

interface EnlaceNavegacion {
  ruta: string;
  etiqueta: string;
  // `exacta` evita que /pedidos quede activo al visitar /pedidos/nuevo.
  exacta: boolean;
}

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
    { ruta: '/productos', etiqueta: 'Catálogo', exacta: true },
    { ruta: '/pedidos/nuevo', etiqueta: 'Nuevo pedido', exacta: true },
    { ruta: '/pedidos', etiqueta: 'Historial', exacta: true },
  ];

  protected alternarMenu(): void {
    this.menuAbierto.update((abierto) => !abierto);
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }
}
