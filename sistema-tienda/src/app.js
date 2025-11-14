require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

const { sequelize } = require('./baseDatos');

// Importar rutas
const ClienteRutas = require('./rutas/rutasCliente');
const CompraRutas = require('./rutas/rutasCompra');
const ProductoRutas = require('./rutas/rutasProducto');
const ProveedorRutas = require('./rutas/rutasProveedor');
const DetalleCompraRutas = require('./rutas/rutasDetalleCompra');
const CajeroRutas = require('./rutas/rutasCajero');
const CategoriaRutas = require('./rutas/rutasCategoria');
const rutasProveedorProducto = require('./rutas/rutasProveedorProducto');
const rutasPuntosCliente = require('./rutas/rutasPuntosCliente');
const rutasAuth = require('./rutas/rutasAuth');

// Middlewares
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

// Rutas principales
app.use('/auth', rutasAuth);
app.use('/clientes', ClienteRutas);
app.use('/compras', CompraRutas);
app.use('/productos', ProductoRutas);
app.use('/proveedores', ProveedorRutas);
app.use('/detalles-compra', DetalleCompraRutas);
app.use('/cajeros', CajeroRutas);
app.use('/categorias', CategoriaRutas);
app.use('/proveedores-productos', rutasProveedorProducto);
app.use('/puntos-clientes', rutasPuntosCliente);

// Ruta principal para servir index.html
app.get('/', (req, res) => {
  res.sendFile(require('path').join(__dirname, '../public/pages/index.html'));
});

// Puerto y sincronización de base de datos
const PORT = process.env.PORT || 3000;

sequelize.sync({ alter: true, force: false })
  .then(() => {
    console.log('✅ Base de datos sincronizada correctamente.');
    app.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en el puerto ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Error en la sincronización:', err);
  });

// Todas las rutas están correctamente importadas y usadas.
// No se requieren cambios aquí si los modelos y rutas están bien definidos.
