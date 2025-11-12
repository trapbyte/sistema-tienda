const defineCompra = (sequelize, DataTypes) => {
  return sequelize.define('Factura', {
    nro_fac: {
      type: DataTypes.BIGINT,
      primaryKey: true,
      allowNull: false
    },
    val_tot_fac: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false
    },
    fec_fac: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    ide_cli: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'ide_cli'
      }
    },
    ide_caj: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'cajeros',
        key: 'ide_caj'
      }
    }
  }, {
    tableName: 'facturas',
    timestamps: true
  });
};

module.exports = defineCompra;
