module.exports = (sequelize, DataTypes) => {
  return sequelize.define('ProveedorProducto', {
    nit_prov: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'proveedores',
        key: 'nit_prov'
      }
    },
    cod_pro: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'cod_pro'
      }
    }
  }, {
    tableName: 'proveedores_productos',
    timestamps: true
  });
};
