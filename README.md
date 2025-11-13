# Sistema de Gestión de Tienda

Este proyecto es un sistema web para la gestión de una tienda, desarrollado con Node.js, Express, Sequelize y Bootstrap. Permite administrar clientes, productos, compras, proveedores, cajeros, categorías y puntos por cliente.

## Características

- CRUD de clientes, productos, proveedores, cajeros y categorías.
- Gestión de compras y detalle de compras.
- Relación proveedores-productos.
- Sistema de puntos por cliente.
- Interfaz moderna con Bootstrap 5.

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <URL-del-repo>
   cd Sistema_Tienda
   ```

2. Instala dependencias:
   ```bash
   npm install
   ```

3. Configura la base de datos en el archivo `.env`:
   ```
   DB_NAME=tu_base
   DB_USER=tu_usuario
   DB_PASSWORD=tu_password
   DB_HOST=localhost
   DB_DIALECT=mysql
   PORT=3000
   ```

4. Inicia el servidor:
   ```bash
   npm start
   ```
   El sistema estará disponible en [http://localhost:3000](http://localhost:3000).

## Estructura del proyecto

- `/src/modelos/` — Modelos Sequelize para cada entidad.
- `/src/controladores/` — Lógica de negocio y validaciones.
- `/src/rutas/` — Rutas Express para cada módulo.
- `/src/baseDatos/` — Configuración y relaciones de Sequelize.
- `/public/pages/` — Páginas HTML del frontend.
- `/public/js/` — Scripts JS para la interacción frontend.
- `/public/css/` — Hojas de estilos CSS.

## Scripts útiles

- `npm start` — Inicia el servidor en modo producción.
- `npm run dev` — Inicia el servidor en modo desarrollo (si tienes nodemon).

## Recomendaciones

- No subas tu archivo `.env` ni credenciales sensibles al repositorio.
- Revisa la configuración de CORS si accedes desde otro origen.
- Para desarrollo, usa una base de datos local y configura los modelos con `timestamps` según tu estructura.

## Licencia

MIT
