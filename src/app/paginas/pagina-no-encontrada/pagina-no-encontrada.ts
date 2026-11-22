import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-pagina-no-encontrada',
  imports: [RouterLink],
  template: `
    <div class="alert alert-warning text-center py-5" role="alert">
      <h1 class="h4 alert-heading">Página no encontrada</h1>
      <p>La dirección que buscas no existe en la tienda.</p>
      <a routerLink="/productos" class="btn btn-warning">Ir al catálogo</a>
    </div>
  `,
})
export class PaginaNoEncontrada {}
