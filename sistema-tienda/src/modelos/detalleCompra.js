const defineDetalleFactura = (sequelize, DataTypes) => {
  return sequelize.define('DetalleFactura', {
    id_det: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    cod_pro: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'productos',
        key: 'cod_pro'
      }
    },
    nro_fac: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: 'facturas',
        key: 'nro_fac'
      }
    },
    val_uni_pro: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    cant_pro: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    val_total_pro: {
      type: DataTypes.DECIMAL(14, 2),
      allowNull: false
    }
  }, {
    tableName: 'detalle_facturas',
    timestamps: false
  });
};

module.exports = defineDetalleFactura;
