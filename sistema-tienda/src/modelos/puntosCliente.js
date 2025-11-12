module.exports = (sequelize, DataTypes) => {
  return sequelize.define('PuntosCliente', {
    id: {
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
    puntos_actual: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    puntos_totales_obtenidos: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    puntos_totales_canjeados: {
      type: DataTypes.BIGINT,
      allowNull: false,
      defaultValue: 0
    },
    ultima_actualizacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'puntos_clientes',
    timestamps: false
  });
};
