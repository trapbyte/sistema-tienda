const defineProducto = (sequelize, DataTypes) => {
  return sequelize.define('Producto', {
    cod_pro: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    nom_pro: {
      type: DataTypes.STRING,
      allowNull: false
    },
    cant_pro: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    val_pro: {
      type: DataTypes.DECIMAL(12, 2),
      allowNull: false
    },
    fec_ven_pro: {
      type: DataTypes.DATE,
      allowNull: true
    },
    cod_cat: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'categorias',
        key: 'cod_cat'
      }
    }
  }, {
    tableName: 'productos',
    timestamps: true
  });
};

module.exports = defineProducto;
