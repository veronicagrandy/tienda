import { Routes } from '@angular/router';

const sufijoTitulo = ' | Tienda de Barrio';

// Rutas de las 4 pantallas de la tienda.
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
    loadComponent: () => import('./paginas/nuevo-pedido/nuevo-pedido').then((m) => m.NuevoPedido),
  },
  {
    path: 'pedidos',
    title: 'Historial de pedidos' + sufijoTitulo,
    loadComponent: () => import('./paginas/historial-pedidos/historial-pedidos').then((m) => m.HistorialPedidos),
  },
  {
    path: 'pedidos/:id',
    title: 'Detalle de pedido' + sufijoTitulo,
    loadComponent: () => import('./paginas/detalle-pedido/detalle-pedido').then((m) => m.DetallePedido),
  },
  {
    path: '**',
    title: 'Página no encontrada' + sufijoTitulo,
    loadComponent: () =>
      import('./paginas/pagina-no-encontrada/pagina-no-encontrada').then((m) => m.PaginaNoEncontrada),
  },
];
