import { Routes } from '@angular/router';

const sufijoTitulo = ' | Tienda de Barrio';

// Rutas de las 4 pantallas. Las fases 2-4 usan un marcador temporal hasta implementarse.
// Todas se cargan de forma diferida (lazy) para mantener liviano el bundle inicial.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'productos' },
  {
    path: 'productos',
    title: 'Catálogo' + sufijoTitulo,
    loadComponent: () => import('./paginas/catalogo/catalogo').then((m) => m.Catalogo),
  },
  {
    // Debe ir antes de 'pedidos/:id' para que "nuevo" no se interprete como id.
    path: 'pedidos/nuevo',
    title: 'Nuevo pedido' + sufijoTitulo,
    loadComponent: () => import('./paginas/en-construccion/en-construccion').then((m) => m.EnConstruccion),
    data: { titulo: 'Nuevo pedido', descripcion: 'Aquí podrás armar un pedido con varios productos (Funcionalidad 2).' },
  },
  {
    path: 'pedidos',
    title: 'Historial de pedidos' + sufijoTitulo,
    loadComponent: () => import('./paginas/en-construccion/en-construccion').then((m) => m.EnConstruccion),
    data: { titulo: 'Historial de pedidos', descripcion: 'Aquí verás los pedidos guardados y su estado (Funcionalidad 3).' },
  },
  {
    path: 'pedidos/:id',
    title: 'Detalle de pedido' + sufijoTitulo,
    loadComponent: () => import('./paginas/en-construccion/en-construccion').then((m) => m.EnConstruccion),
    data: { titulo: 'Detalle de pedido', descripcion: 'Aquí podrás consultar y cancelar un pedido (Funcionalidad 4).' },
  },
  {
    path: '**',
    title: 'Página no encontrada' + sufijoTitulo,
    loadComponent: () =>
      import('./paginas/pagina-no-encontrada/pagina-no-encontrada').then((m) => m.PaginaNoEncontrada),
  },
];
