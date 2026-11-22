# Tienda de Barrio

Aplicación web en Angular para una tienda de barrio: permite consultar productos, armar pedidos respetando las existencias, revisar el historial y cancelar pedidos devolviendo las unidades al stock. Los datos se guardan en el navegador con **IndexedDB**, por lo que no necesita backend ni base de datos externa.

## Características

### 1. Catálogo de productos (`/productos`)
- Productos en tarjetas con categoría, precio (en bolivianos), stock y estado de disponibilidad: *Disponible*, *Pocas unidades* o *Agotado*.
- **Búsqueda por texto** (nombre o descripción, sin importar mayúsculas ni tildes) combinada con **filtros por categoría y disponibilidad**.
- Mensaje claro cuando ningún producto coincide, con opción para limpiar los filtros.
- Al seleccionar un producto se muestra su detalle y un acceso directo para agregarlo a un pedido.

### 2. Registro de pedidos (`/pedidos/nuevo`)
- Formulario reactivo con datos del cliente y **varios productos por pedido**.
- **Total calculado en tiempo real**, con subtotales por producto.
- Validaciones con mensajes claros: campos obligatorios, cantidades enteras, **cantidad que no supere el stock disponible**, productos agotados y productos repetidos.
- Al confirmar, el pedido se guarda y el stock se descuenta en una sola operación: si algo falla, no se guarda nada.

### 3. Historial de pedidos (`/pedidos`)
- Lista de pedidos con número, fecha, cliente, total y estado (*Pendiente*, *Entregado* o *Cancelado*).
- **Filtro por estado** con contador de pedidos en cada uno.
- Al seleccionar un pedido se muestra su detalle. El filtro y el pedido seleccionado se guardan en la URL, así que se mantienen al recargar la página.

### 4. Detalle y cancelación de pedidos (`/pedidos/:id`)
- Página propia por pedido que **funciona al recargar** o al abrirla desde un enlace directo.
- Si el pedido no existe, muestra un aviso con opción para volver al historial.
- **Cancelar pedido** (con confirmación previa): cambia su estado a *Cancelado* y **devuelve las unidades al stock**, mostrando el stock antes y después de cada producto.
- También permite **marcar el pedido como entregado**.

### Otras características
- **Datos persistentes en el navegador (IndexedDB)**: se incluyen 18 productos y 3 pedidos de ejemplo, que se cargan una sola vez.
- **Diseño responsive** para escritorio y móvil, hecho únicamente con Bootstrap 5 y un color principal naranja.
- Menú de navegación que resalta la sección activa.

## Tecnologías

- [Angular](https://angular.dev) 22 (componentes standalone, signals y control de flujo `@if` / `@for`)
- [Bootstrap](https://getbootstrap.com) 5.3, compilado desde Sass para personalizar los colores
- IndexedDB, la base de datos integrada del navegador

## Instalación y ejecución en local

### Requisitos

- [Node.js](https://nodejs.org) **22.22.3 o superior** (o 24.15+), que ya incluye npm.
- Git.

Para comprobar las versiones instaladas:

```bash
node -v
npm -v
```

### 1. Clonar el repositorio e instalar dependencias

```bash
git clone https://github.com/veronicagrandy/tienda.git
cd tienda
npm install
```

### 2. Ejecutar en modo desarrollo

```bash
npm start
```

Abre **http://localhost:4200** en el navegador. La aplicación se recarga sola al modificar el código.


### Reiniciar los datos de ejemplo

Los datos viven en el navegador. Para volver al estado inicial, abre las herramientas de desarrollador (F12) → **Application** → **IndexedDB**, elimina la base `tiendaBarrioDb` y recarga la página.