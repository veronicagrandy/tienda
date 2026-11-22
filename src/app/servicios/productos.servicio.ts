import { Injectable, inject, signal } from '@angular/core';
import { Producto } from '../modelos/producto';
import { BaseDatosServicio, almacenProductos } from './base-datos.servicio';

/** Estado de los productos de la tienda, sincronizado con IndexedDB. */
@Injectable({ providedIn: 'root' })
export class ProductosServicio {
  private readonly baseDatos = inject(BaseDatosServicio);

  // Señales privadas escribibles; hacia afuera solo se exponen en lectura.
  private readonly productosInterno = signal<Producto[]>([]);
  private readonly cargandoInterno = signal(false);
  private readonly errorInterno = signal<string | null>(null);

  readonly productos = this.productosInterno.asReadonly();
  readonly cargando = this.cargandoInterno.asReadonly();
  readonly error = this.errorInterno.asReadonly();

  async cargarProductos(): Promise<void> {
    this.cargandoInterno.set(true);
    this.errorInterno.set(null);
    try {
      const productos = await this.baseDatos.obtenerTodos<Producto>(almacenProductos);
      this.productosInterno.set(productos.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')));
    } catch (error) {
      console.error(error);
      this.errorInterno.set('No se pudieron cargar los productos de la tienda.');
    } finally {
      this.cargandoInterno.set(false);
    }
  }

  async obtenerProductoPorId(id: number): Promise<Producto | undefined> {
    return this.baseDatos.obtenerPorId<Producto>(almacenProductos, id);
  }

  /** Guarda los cambios de un producto (p. ej. stock) y refresca el estado en memoria. */
  async actualizarProducto(producto: Producto): Promise<void> {
    await this.baseDatos.guardar(almacenProductos, producto);
    this.productosInterno.update((productos) =>
      productos.map((actual) => (actual.id === producto.id ? producto : actual)),
    );
  }
}
