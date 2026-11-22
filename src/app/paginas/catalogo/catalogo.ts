import { CurrencyPipe, DecimalPipe, NgClass, TitleCasePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TarjetaProducto } from '../../componentes/tarjeta-producto/tarjeta-producto';
import {
  CategoriaProducto,
  EstadoStock,
  Producto,
  categoriasProducto,
  etiquetasEstadoStock,
  obtenerEstadoStock,
} from '../../modelos/producto';
import { ProductosServicio } from '../../servicios/productos.servicio';

type FiltroCategoria = CategoriaProducto | 'todas';
type FiltroDisponibilidad = EstadoStock | 'todos';

// Normaliza el texto para buscar sin importar mayúsculas ni tildes ("lacteos" encuentra "lácteos").
function normalizarTexto(texto: string): string {
  return texto.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().trim();
}

/** Funcionalidad 1: consulta principal del catálogo con búsqueda y filtros combinados. */
@Component({
  selector: 'app-catalogo',
  imports: [TarjetaProducto, RouterLink, NgClass, CurrencyPipe, DecimalPipe, TitleCasePipe],
  templateUrl: './catalogo.html',
})
export class Catalogo implements OnInit {
  protected readonly productosServicio = inject(ProductosServicio);

  protected readonly categorias = categoriasProducto;
  protected readonly opcionesDisponibilidad = Object.entries(etiquetasEstadoStock) as [EstadoStock, string][];

  // Criterios de filtrado, cada uno como señal independiente.
  protected readonly filtroTexto = signal('');
  protected readonly categoriaSeleccionada = signal<FiltroCategoria>('todas');
  protected readonly disponibilidadSeleccionada = signal<FiltroDisponibilidad>('todos');
  protected readonly productoSeleccionado = signal<Producto | null>(null);

  // Intersección de los tres criterios: se recalcula automáticamente cuando cambia cualquiera.
  protected readonly productosFiltrados = computed(() => {
    const texto = normalizarTexto(this.filtroTexto());
    const categoria = this.categoriaSeleccionada();
    const disponibilidad = this.disponibilidadSeleccionada();

    return this.productosServicio.productos().filter((producto) => {
      const coincideTexto =
        !texto || normalizarTexto(`${producto.nombre} ${producto.descripcion}`).includes(texto);
      const coincideCategoria = categoria === 'todas' || producto.categoria === categoria;
      const coincideDisponibilidad =
        disponibilidad === 'todos' || obtenerEstadoStock(producto) === disponibilidad;
      return coincideTexto && coincideCategoria && coincideDisponibilidad;
    });
  });

  protected readonly hayFiltrosActivos = computed(
    () =>
      this.filtroTexto().trim() !== '' ||
      this.categoriaSeleccionada() !== 'todas' ||
      this.disponibilidadSeleccionada() !== 'todos',
  );

  protected readonly estadoSeleccionado = computed(() => {
    const producto = this.productoSeleccionado();
    return producto ? obtenerEstadoStock(producto) : null;
  });

  ngOnInit(): void {
    this.productosServicio.cargarProductos();
  }

  protected alCambiarCategoria(valor: string): void {
    this.categoriaSeleccionada.set(valor as FiltroCategoria);
  }

  protected alCambiarDisponibilidad(valor: string): void {
    this.disponibilidadSeleccionada.set(valor as FiltroDisponibilidad);
  }

  // Manejador del output() del componente hijo. Un segundo clic deselecciona.
  protected alSeleccionarProducto(producto: Producto): void {
    this.productoSeleccionado.update((actual) => (actual?.id === producto.id ? null : producto));
  }

  protected cerrarDetalle(): void {
    this.productoSeleccionado.set(null);
  }

  protected limpiarFiltros(): void {
    this.filtroTexto.set('');
    this.categoriaSeleccionada.set('todas');
    this.disponibilidadSeleccionada.set('todos');
  }
}
