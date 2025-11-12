module.exports = (sequelize, DataTypes) => {
  return sequelize.define('DetallePuntos', {
    id_det_puntos: {
      type: DataTypes.BIGINT.UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    ide_cli: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'clientes',
        key: 'ide_cli'
      }
    },
    nro_fac: {
      type: DataTypes.BIGINT,
      allowNull: true,
      references: {
        model: 'facturas',
        key: 'nro_fac'
      }
    },
    tipo_movimiento: {
      type: DataTypes.STRING,
      allowNull: false
    },
    puntos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'detalle_puntos',
    timestamps: false
  });
};
