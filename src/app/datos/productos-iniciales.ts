import { Producto } from '../modelos/producto';

// Datos semilla: se insertan en IndexedDB una sola vez, al crear la base de datos.
export const productosIniciales: Producto[] = [
  { id: 1, nombre: 'Arroz Grano de Oro', descripcion: 'Arroz blanco de grano largo, bolsa de 1 kg.', categoria: 'abarrotes', precio: 9.5, stock: 40, unidadMedida: 'bolsa', icono: '🍚' },
  { id: 2, nombre: 'Azúcar blanca', descripcion: 'Azúcar refinada, ideal para el café y repostería.', categoria: 'abarrotes', precio: 7, stock: 25, unidadMedida: 'kg', icono: '🧂' },
  { id: 3, nombre: 'Aceite vegetal', descripcion: 'Aceite de girasol de 900 ml.', categoria: 'abarrotes', precio: 15.5, stock: 4, unidadMedida: 'unidad', icono: '🫒' },
  { id: 4, nombre: 'Fideo tallarín', descripcion: 'Pasta seca tipo tallarín, paquete de 400 g.', categoria: 'abarrotes', precio: 5, stock: 30, unidadMedida: 'paquete', icono: '🍝' },
  { id: 5, nombre: 'Coca-Cola 2 L', descripcion: 'Gaseosa sabor cola, botella retornable de 2 litros.', categoria: 'bebidas', precio: 12, stock: 18, unidadMedida: 'unidad', icono: '🥤' },
  { id: 6, nombre: 'Agua mineral sin gas', descripcion: 'Botella de agua natural de 2 litros.', categoria: 'bebidas', precio: 6, stock: 3, unidadMedida: 'unidad', icono: '💧' },
  { id: 7, nombre: 'Jugo de durazno', descripcion: 'Néctar de durazno en caja de 1 litro.', categoria: 'bebidas', precio: 8.5, stock: 0, unidadMedida: 'litro', icono: '🧃' },
  { id: 8, nombre: 'Leche entera PIL', descripcion: 'Leche entera pasteurizada en bolsa de 1 litro.', categoria: 'lácteos', precio: 6.5, stock: 35, unidadMedida: 'litro', icono: '🥛' },
  { id: 9, nombre: 'Yogur de frutilla', descripcion: 'Yogur bebible sabor frutilla, 1 litro.', categoria: 'lácteos', precio: 11, stock: 5, unidadMedida: 'unidad', icono: '🍓' },
  { id: 10, nombre: 'Queso criollo', descripcion: 'Queso fresco artesanal por kilo.', categoria: 'lácteos', precio: 38, stock: 0, unidadMedida: 'kg', icono: '🧀' },
  { id: 11, nombre: 'Mantequilla', descripcion: 'Mantequilla con sal, barra de 200 g.', categoria: 'lácteos', precio: 13, stock: 12, unidadMedida: 'unidad', icono: '🧈' },
  { id: 12, nombre: 'Detergente en polvo', descripcion: 'Detergente para ropa blanca y de color, 1 kg.', categoria: 'limpieza', precio: 18, stock: 15, unidadMedida: 'bolsa', icono: '🧺' },
  { id: 13, nombre: 'Lavandina', descripcion: 'Desinfectante a base de cloro, botella de 1 litro.', categoria: 'limpieza', precio: 7.5, stock: 2, unidadMedida: 'litro', icono: '🧴' },
  { id: 14, nombre: 'Jabón de tocador', descripcion: 'Jabón en barra con aroma a lavanda.', categoria: 'limpieza', precio: 4, stock: 50, unidadMedida: 'unidad', icono: '🧼' },
  { id: 15, nombre: 'Papas fritas clásicas', descripcion: 'Papas fritas crocantes con sal, bolsa de 150 g.', categoria: 'snacks', precio: 8, stock: 22, unidadMedida: 'bolsa', icono: '🥔' },
  { id: 16, nombre: 'Galletas de chocolate', descripcion: 'Galletas rellenas de crema de chocolate.', categoria: 'snacks', precio: 5.5, stock: 0, unidadMedida: 'paquete', icono: '🍪' },
  { id: 17, nombre: 'Maní salado', descripcion: 'Maní tostado y salado, bolsa de 200 g.', categoria: 'snacks', precio: 6, stock: 14, unidadMedida: 'bolsa', icono: '🥜' },
  { id: 18, nombre: 'Chocolate en barra', descripcion: 'Chocolate con leche de 100 g.', categoria: 'snacks', precio: 9, stock: 1, unidadMedida: 'unidad', icono: '🍫' },
];
