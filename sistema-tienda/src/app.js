require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');

// Configuración de CORS
const corsOptions = {
  origin: [
    'https://sistema-tienda.onrender.com', // cambiado desde 'http://localhost:3000'
    'https://sistema-tienda-c3xf.onrender.com', // reemplaza por tu dominio real en producción
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};
app.use(cors(corsOptions));

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
app.use(express.static('public'));
app.use('/pages', express.static('public/pages'));

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

// Ruta para servir cualquier archivo HTML directamente desde /pages
app.get('/:page', (req, res, next) => {
  const page = req.params.page;
  if (page.endsWith('.html')) {
    return res.sendFile(require('path').join(__dirname, '../public/pages', page));
  }
  next();
});

// Puerto y sincronización de base de datos
const PORT = process.env.PORT || 3000;

sequelize.sync()//Antes: .sync({ alter: true, force: false })
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
