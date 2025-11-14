const defineCliente = (sequelize, DataTypes) => {
  return sequelize.define('Cliente', {
    ide_cli: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nom_cli: {
      type: DataTypes.STRING,
      allowNull: false
    },
    dir_cli: {
      type: DataTypes.STRING,
      allowNull: true
    },
    tel_cli: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'clientes',
    timestamps: false
  });
};

module.exports = defineCliente;
