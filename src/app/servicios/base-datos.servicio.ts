import { isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { productosIniciales } from '../datos/productos-iniciales';

const nombreBaseDatos = 'tiendaBarrioDb';
const versionBaseDatos = 1;

export const almacenProductos = 'productos';
export const almacenPedidos = 'pedidos';
export type NombreAlmacen = typeof almacenProductos | typeof almacenPedidos;

/**
 * Envoltorio de bajo nivel sobre la API `indexedDB` basado en promesas.
 * Los servicios de dominio (productos, pedidos) lo usan para leer, guardar y actualizar.
 */
@Injectable({ providedIn: 'root' })
export class BaseDatosServicio {
  private readonly esNavegador = isPlatformBrowser(inject(PLATFORM_ID));
  // Se reutiliza una única conexión durante toda la vida de la app.
  private conexion: Promise<IDBDatabase> | null = null;

  async obtenerTodos<T>(almacen: NombreAlmacen): Promise<T[]> {
    return this.ejecutarSolicitud<T[]>(almacen, 'readonly', (store) => store.getAll());
  }

  async obtenerPorId<T>(almacen: NombreAlmacen, id: IDBValidKey): Promise<T | undefined> {
    return this.ejecutarSolicitud<T | undefined>(almacen, 'readonly', (store) => store.get(id));
  }

  /** Inserta o actualiza (put) un registro y devuelve su clave. */
  async guardar<T>(almacen: NombreAlmacen, valor: T): Promise<IDBValidKey> {
    return this.ejecutarSolicitud<IDBValidKey>(almacen, 'readwrite', (store) => store.put(valor));
  }

  async guardarVarios<T>(almacen: NombreAlmacen, valores: T[]): Promise<void> {
    await this.ejecutarTransaccion([almacen], 'readwrite', (transaccion) => {
      const store = transaccion.objectStore(almacen);
      valores.forEach((valor) => store.put(valor));
    });
  }

  /**
   * Ejecuta varias operaciones en una sola transacción atómica (todo o nada).
   * Pensado para las fases siguientes: crear/cancelar un pedido y ajustar el stock a la vez.
   */
  async ejecutarTransaccion(
    almacenes: NombreAlmacen[],
    modo: IDBTransactionMode,
    trabajo: (transaccion: IDBTransaction) => void,
  ): Promise<void> {
    const baseDatos = await this.abrir();
    return new Promise((resolve, reject) => {
      const transaccion = baseDatos.transaction(almacenes, modo);
      transaccion.oncomplete = () => resolve();
      transaccion.onerror = () => reject(transaccion.error);
      transaccion.onabort = () => reject(transaccion.error ?? new Error('Transacción cancelada'));
      trabajo(transaccion);
    });
  }

  private async ejecutarSolicitud<R>(
    almacen: NombreAlmacen,
    modo: IDBTransactionMode,
    operacion: (store: IDBObjectStore) => IDBRequest,
  ): Promise<R> {
    const baseDatos = await this.abrir();
    return new Promise((resolve, reject) => {
      const solicitud = operacion(baseDatos.transaction(almacen, modo).objectStore(almacen));
      solicitud.onsuccess = () => resolve(solicitud.result as R);
      solicitud.onerror = () => reject(solicitud.error);
    });
  }

  private abrir(): Promise<IDBDatabase> {
    // En el servidor (SSR) no existe indexedDB.
    if (!this.esNavegador) {
      return Promise.reject(new Error('IndexedDB solo está disponible en el navegador.'));
    }

    this.conexion ??= new Promise((resolve, reject) => {
      const solicitud = indexedDB.open(nombreBaseDatos, versionBaseDatos);

      // `onupgradeneeded` solo se dispara cuando la base no existe o cambia de versión,
      // por eso la semilla se inserta aquí: una única vez, sin duplicados al recargar.
      solicitud.onupgradeneeded = (evento) => {
        const baseDatos = solicitud.result;
        if (evento.oldVersion < 1) {
          const productos = baseDatos.createObjectStore(almacenProductos, { keyPath: 'id' });
          productos.createIndex('categoria', 'categoria');

          const pedidos = baseDatos.createObjectStore(almacenPedidos, { keyPath: 'id', autoIncrement: true });
          pedidos.createIndex('estado', 'estado');
          pedidos.createIndex('fecha', 'fecha');

          productosIniciales.forEach((producto) => productos.add(producto));
        }
      };
      solicitud.onsuccess = () => resolve(solicitud.result);
      solicitud.onerror = () => {
        this.conexion = null; // permite reintentar
        reject(solicitud.error);
      };
    });
    return this.conexion;
  }
}
