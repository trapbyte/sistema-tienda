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
const defineUsuario = require('../modelos/usuario');

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
const Factura = defineCompra(sequelize, DataTypes); // Factura para compras
const Producto = defineProducto(sequelize, DataTypes);
const Proveedor = defineProveedor(sequelize, DataTypes);
const DetalleFactura = defineDetalleCompra(sequelize, DataTypes); // DetalleFactura para detalle de compra
const Cajero = defineCajero(sequelize, DataTypes);
const Categoria = defineCategoria(sequelize, DataTypes);
const PuntosCliente = definePuntosCliente(sequelize, DataTypes);
const DetallePuntos = defineDetallePuntos(sequelize, DataTypes);
const ProveedorProducto = defineProveedorProducto(sequelize, DataTypes);
const Usuario = defineUsuario(sequelize, DataTypes);

// Relaciones entre tablas

// Cliente -> Factura (1 a muchos)
Cliente.hasMany(Factura, { foreignKey: 'ide_cli' });
Factura.belongsTo(Cliente, { foreignKey: 'ide_cli' });

// Cajero -> Factura (1 a muchos)
Cajero.hasMany(Factura, { foreignKey: 'ide_caj' });
Factura.belongsTo(Cajero, { foreignKey: 'ide_caj' });

// Categoria -> Producto (1 a muchos)
Categoria.hasMany(Producto, { foreignKey: 'cod_cat' });
Producto.belongsTo(Categoria, { foreignKey: 'cod_cat' });

// Compra -> DetalleFactura (1 a muchos)
Factura.hasMany(DetalleFactura, { foreignKey: 'nro_fac' });
DetalleFactura.belongsTo(Factura, { foreignKey: 'nro_fac' });

// Producto -> DetalleFactura (1 a muchos)
Producto.hasMany(DetalleFactura, { foreignKey: 'cod_pro' });
DetalleFactura.belongsTo(Producto, { foreignKey: 'cod_pro' });

// Cliente -> PuntosCliente (1 a 1)
Cliente.hasOne(PuntosCliente, { foreignKey: 'ide_cli' });
PuntosCliente.belongsTo(Cliente, { foreignKey: 'ide_cli' });

// Cliente -> DetallePuntos (1 a muchos)
Cliente.hasMany(DetallePuntos, { foreignKey: 'ide_cli' });
DetallePuntos.belongsTo(Cliente, { foreignKey: 'ide_cli' });

// Factura -> DetallePuntos (1 a muchos)
Factura.hasMany(DetallePuntos, { foreignKey: 'nro_fac' });
DetallePuntos.belongsTo(Factura, { foreignKey: 'nro_fac' });

// Conexión y sincronización
sequelize.authenticate()
  .then(() => console.log('✅ Conectado a la base de datos.'))
  .catch(err => console.error('❌ Error de conexión:', err));

sequelize.sync({ alter: true, force: false })
  .then(() => console.log('🔄 Sincronización completada.'))
  .catch(err => console.error('⚠️ Error en la sincronización:', err));

module.exports = {
  Cliente,
  Factura,
  Producto,
  Proveedor,
  DetalleFactura,
  Cajero,
  Categoria,
  PuntosCliente,
  DetallePuntos,
  ProveedorProducto,
  Usuario,
  sequelize
};
