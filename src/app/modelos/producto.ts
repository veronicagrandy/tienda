// Categorías de la tienda en minúsculas: el pipe `titlecase` se encarga de mostrarlas.
export const categoriasProducto = ['abarrotes', 'bebidas', 'lácteos', 'limpieza', 'snacks'] as const;
export type CategoriaProducto = (typeof categoriasProducto)[number];

export type UnidadMedida = 'unidad' | 'kg' | 'litro' | 'paquete' | 'bolsa';

export interface Producto {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: CategoriaProducto;
  precio: number;
  stock: number;
  unidadMedida: UnidadMedida;
  icono: string;
}

// Estado derivado del stock (no se guarda: se calcula para evitar datos inconsistentes).
export type EstadoStock = 'disponible' | 'pocasUnidades' | 'agotado';

export const umbralPocasUnidades = 5;

export const etiquetasEstadoStock: Record<EstadoStock, string> = {
  disponible: 'Disponible',
  pocasUnidades: 'Pocas unidades',
  agotado: 'Agotado',
};

export function obtenerEstadoStock(producto: Producto): EstadoStock {
  if (producto.stock <= 0) {
    return 'agotado';
  }
  return producto.stock <= umbralPocasUnidades ? 'pocasUnidades' : 'disponible';
}
