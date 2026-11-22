import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

/**
 * Marcador temporal para las pantallas de las fases 2, 3 y 4.
 * Recibe `titulo` y `descripcion` desde `data` de la ruta (withComponentInputBinding).
 */
@Component({
  selector: 'app-en-construccion',
  imports: [RouterLink],
  template: `
    <div class="row justify-content-center">
      <div class="col-12 col-md-8 col-lg-6">
        <div class="card shadow-sm text-center">
          <div class="card-body py-5">
            <span class="badge text-bg-info mb-3">Próximamente</span>
            <h1 class="h4">{{ titulo() }}</h1>
            <p class="text-body-secondary">{{ descripcion() }}</p>
            <a routerLink="/productos" class="btn btn-primary">Volver al catálogo</a>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class EnConstruccion {
  readonly titulo = input('Sección en construcción');
  readonly descripcion = input('Esta funcionalidad se implementará en una fase posterior.');
}
