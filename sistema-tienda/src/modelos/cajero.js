module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Cajero', {
    ide_caj: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nom_caj: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tel_caj: {
      type: DataTypes.STRING,
      allowNull: true
    },
    dir_caj: {
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'cajeros',
    timestamps: false
  });
};
