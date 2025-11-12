require('dotenv').config();

const { Sequelize, DataTypes } = require('sequelize');

// Importar modelos
const defineCliente = require('../modelos/cliente');
const defineCompra = require('../modelos/compra');
const defineProducto = require('../modelos/producto');
const defineProveedor = require('../modelos/proveedor');
const defineDetalleCompra = require('../modelos/detalleCompra');
const defineCajero = require('../modelos/cajero');
const defineCategoria = require('../modelos/categoria');
const definePuntosCliente = require('../modelos/puntosCliente');
const defineDetallePuntos = require('../modelos/detallePuntos');
const defineProveedorProducto = require('../modelos/proveedorProducto');

// Configuración de conexión
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT
  }
);

// Definir modelos
const Cliente = defineCliente(sequelize, DataTypes);
const Compra = defineCompra(sequelize, DataTypes);
const Producto = defineProducto(sequelize, DataTypes);
const Proveedor = defineProveedor(sequelize, DataTypes);
const DetalleCompra = defineDetalleCompra(sequelize, DataTypes);
const Cajero = defineCajero(sequelize, DataTypes);
const Categoria = defineCategoria(sequelize, DataTypes);
const PuntosCliente = definePuntosCliente(sequelize, DataTypes);
const DetallePuntos = defineDetallePuntos(sequelize, DataTypes);
const ProveedorProducto = defineProveedorProducto(sequelize, DataTypes);

// Relaciones entre tablas

// Cliente -> Factura (1 a muchos)
Cliente.hasMany(Compra, { foreignKey: 'ide_cli' });
Compra.belongsTo(Cliente, { foreignKey: 'ide_cli' });

// Cajero -> Factura (1 a muchos)
Cajero.hasMany(Compra, { foreignKey: 'ide_caj' });
Compra.belongsTo(Cajero, { foreignKey: 'ide_caj' });

// Categoria -> Producto (1 a muchos)
Categoria.hasMany(Producto, { foreignKey: 'cod_cat' });
Producto.belongsTo(Categoria, { foreignKey: 'cod_cat' });

// Compra -> DetalleFactura (1 a muchos)
Compra.hasMany(DetalleCompra, { foreignKey: 'nro_fac' });
DetalleCompra.belongsTo(Compra, { foreignKey: 'nro_fac' });

// Producto -> DetalleFactura (1 a muchos)
Producto.hasMany(DetalleCompra, { foreignKey: 'cod_pro' });
DetalleCompra.belongsTo(Producto, { foreignKey: 'cod_pro' });

// Conexión y sincronización
sequelize.authenticate()
  .then(() => console.log('✅ Conectado a la base de datos.'))
  .catch(err => console.error('❌ Error de conexión:', err));

sequelize.sync({ alter: true, force: false })
  .then(() => console.log('🔄 Sincronización completada.'))
  .catch(err => console.error('⚠️ Error en la sincronización:', err));

module.exports = {
  Cliente,
  Compra,
  Producto,
  Proveedor,
  DetalleCompra,
  Cajero,
  Categoria,
  PuntosCliente,
  DetallePuntos,
  ProveedorProducto,
  sequelize
};
