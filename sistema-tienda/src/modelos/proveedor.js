const defineProveedor = (sequelize, DataTypes) => {
  return sequelize.define('Proveedor', {
    nit_prov: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nom_prov: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dir_prov: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tel_prov: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'proveedores',
    timestamps: true
  });
};

module.exports = defineProveedor;
