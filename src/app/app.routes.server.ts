import { RenderMode, ServerRoute } from '@angular/ssr';

// Los datos viven en IndexedDB (solo existe en el navegador), así que todas las rutas
// se renderizan en el cliente. Esto también permite recargar rutas dinámicas como /pedidos/:id.
export const serverRoutes: ServerRoute[] = [
  {
    path: '**',
    renderMode: RenderMode.Client,
  },
];
