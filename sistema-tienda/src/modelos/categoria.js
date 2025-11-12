module.exports = (sequelize, DataTypes) => {
  return sequelize.define('Categoria', {
    cod_cat: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nom_cat: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'categorias',
    timestamps: false
  });
};
